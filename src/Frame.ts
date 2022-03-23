/* eslint-disable max-params */
/*
 * QRious
 * Copyright (C) 2017 Alasdair Mercer
 * Copyright (C) 2010 Tom Zerucha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Bitwise notes:
// x ^ 1
//  f(0) = 1
//  f(1) = 0

import * as Alignment from './constants/alignment';
import * as ErrorCorrection from './constants/errorCorrection';
import * as Galois from './constants/galois';
import * as Version from './constants/version';

/**
 * The options used by {@link Frame}.
 */
export interface FrameOptions {
  /** The value to be encoded. */
  readonly value: string;
  /** The ECC level to be used. Default is L */
  readonly level: ErrorCorrection.Level;
}

/** Utility to make value required for users inputting in a value. */
export type UserFacingFrameOptions<T = FrameOptions> = Partial<T> & { readonly value: string }

export type RenderOptionsDefaults<T = FrameOptions> = Omit<T, 'value'> & { readonly value?: string };

export const defaultFrameOptions: RenderOptionsDefaults<FrameOptions> = Object.freeze({ level: 'L' });

// *Badness* coefficients.
const N1 = 3;

const N2 = 3;

const N3 = 40;

const N4 = 10;

type Mask = Uint8Array;
type Buffer = Uint8Array;

function getMaskBit(x: number, y: number) {
  let bit;

  if (x > y) {
    bit = x;
    x = y;
    y = bit;
  }

  bit = y;
  bit += y * y;
  bit >>= 1;
  bit += x;

  return bit;
}

function modN(x: number) {
  while (x >= 255) {
    x -= 255;
    x = (x >> 8) + (x & 255);
  }

  return x;
}

export interface FrameResults {
  readonly buffer: Uint8Array
  readonly width: number
}

/**
 * Generates information for a QR code frame based on a specific value to be encoded.
 *
 * @param options - the options to be used
 */
export function generateFrame(options: UserFacingFrameOptions): FrameResults {
  let version = 0;
  let neccBlock1 = 0;
  let neccBlock2 = 0;
  let dataBlock = 0;
  let eccBlock = 0;
  const badness: number[] = [];

  const processedOptions: Required<FrameOptions> = { ...defaultFrameOptions, ...options };

  const level = ErrorCorrection.LEVELS[processedOptions.level];
  const value = options.value;

  while (version < 40) {
    version++;

    let index = ((level - 1) * 4) + ((version - 1) * 16);

    neccBlock1 = ErrorCorrection.BLOCKS[index++];
    neccBlock2 = ErrorCorrection.BLOCKS[index++];
    dataBlock = ErrorCorrection.BLOCKS[index++];
    eccBlock = ErrorCorrection.BLOCKS[index];
    
    if (value.length <= (dataBlock * (neccBlock1 + neccBlock2)) + neccBlock2 - 3 + Number(version <= 9)) {
      break;
    }
  }

  // FIXME: Ensure that it fits instead of being truncated.
  const width = 17 + (4 * version);

  let buffer = new Uint8Array(width * width);

  const ecc = new Uint8Array(dataBlock + ((dataBlock + eccBlock) * (neccBlock1 + neccBlock2)) + neccBlock2);
  const mask = new Uint8Array(((width * (width + 1)) + 1) / 2);

  insertFinders(mask, buffer, width);
  insertAlignments(version, width, buffer, mask);

  // Insert single foreground cell.
  buffer[8 + (width * (width - 8))] = 1;

  insertTimingGap(width, mask);
  reverseMask(mask, width);
  insertTimingRowAndColumn(buffer, mask, width);
  insertVersion(buffer, width, version, mask);
  syncMask(width, mask, buffer);

  const polynomial: Uint8Array = new Uint8Array(eccBlock);

  const stringBuffer = convertBitStream(options.value.length, version, value, ecc, dataBlock, neccBlock1, neccBlock2);
  calculatePolynomial(polynomial, eccBlock);
  appendEccToData(dataBlock, neccBlock1, neccBlock2, eccBlock, polynomial, stringBuffer);
  const newStringBuffer = interleaveBlocks(ecc, eccBlock, dataBlock, neccBlock1, neccBlock2, stringBuffer.slice());
  pack(width, dataBlock, eccBlock, neccBlock1, neccBlock2, mask, buffer, newStringBuffer);
  buffer = finish(level, badness, buffer, width, mask);

  return {
    width,
    buffer
  };
}

function addAlignment(x: number, y: number, buffer: Buffer, mask: Mask, width: number) {
  let i;

  buffer[x + (width * y)] = 1;

  for (i = -2; i < 2; i++) {
    buffer[x + i + (width * (y - 2))] = 1;
    buffer[x - 2 + (width * (y + i + 1))] = 1;
    buffer[x + 2 + (width * (y + i))] = 1;
    buffer[x + i + 1 + (width * (y + 2))] = 1;
  }

  for (i = 0; i < 2; i++) {
    setMask(x - 1, y + i, mask);
    setMask(x + 1, y - i, mask);
    setMask(x - i, y - 1, mask);
    setMask(x + i, y + 1, mask);
  }
}

function appendData(data: number, dataLength: number, ecc: number, eccLength: number, polynomial: Uint8Array, stringBuffer: Uint8Array) {
  let bit, i, j;

  for (i = 0; i < eccLength; i++) {
    stringBuffer[ecc + i] = 0;
  }

  for (i = 0; i < dataLength; i++) {
    bit = Galois.LOG[stringBuffer[data + i] ^ stringBuffer[ecc]];

    if (bit !== 255) {
      for (j = 1; j < eccLength; j++) {
        stringBuffer[ecc + j - 1] = stringBuffer[ecc + j] ^
          Galois.EXPONENT[modN(bit + polynomial[eccLength - j])];
      }
    } else {
      for (j = ecc; j < ecc + eccLength; j++) {
        stringBuffer[j] = stringBuffer[j + 1];
      }
    }

    stringBuffer[ecc + eccLength - 1] = bit === 255 ? 0 : Galois.EXPONENT[modN(bit + polynomial[0])];
  }
}

function appendEccToData(dataBlock: number, neccBlock1: number, neccBlock2: number, eccBlock: number, polynomial: Uint8Array, stringBuffer: Uint8Array) {
  let data = 0;
  let ecc = calculateMaxLength(dataBlock, neccBlock1, neccBlock2);

  for (let i = 0; i < neccBlock1; i++) {
    appendData(data, dataBlock, ecc, eccBlock, polynomial, stringBuffer);

    data += dataBlock;
    ecc += eccBlock;
  }

  for (let i = 0; i < neccBlock2; i++) {
    appendData(data, dataBlock + 1, ecc, eccBlock, polynomial, stringBuffer);

    data += dataBlock + 1;
    ecc += eccBlock;
  }
}

function applyMask(width: number, buffer: Buffer, mask: number, currentMask: Mask) {
  let r3x, r3y, x, y;

  switch (mask) {
  case 0:
    for (y = 0; y < width; y++) {
      for (x = 0; x < width; x++) {
        if (!((x + y) & 1) && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 1:
    for (y = 0; y < width; y++) {
      for (x = 0; x < width; x++) {
        if (!(y & 1) && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 2:
    for (y = 0; y < width; y++) {
      for (r3x = 0, x = 0; x < width; x++, r3x++) {
        if (r3x === 3) {
          r3x = 0;
        }

        if (!r3x && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 3:
    for (r3y = 0, y = 0; y < width; y++, r3y++) {
      if (r3y === 3) {
        r3y = 0;
      }

      for (r3x = r3y, x = 0; x < width; x++, r3x++) {
        if (r3x === 3) {
          r3x = 0;
        }

        if (!r3x && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 4:
    for (y = 0; y < width; y++) {
      for (r3x = 0, r3y = (y >> 1) & 1, x = 0; x < width; x++, r3x++) {
        if (r3x === 3) {
          r3x = 0;
          r3y = !r3y;
        }

        if (!r3y && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 5:
    for (r3y = 0, y = 0; y < width; y++, r3y++) {
      if (r3y === 3) {
        r3y = 0;
      }

      for (r3x = 0, x = 0; x < width; x++, r3x++) {
        if (r3x === 3) {
          r3x = 0;
        }

        if (!((x & y & 1) + Number(!(Number(!r3x) | Number(!r3y)))) && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 6:
    for (r3y = 0, y = 0; y < width; y++, r3y++) {
      if (r3y === 3) {
        r3y = 0;
      }

      for (r3x = 0, x = 0; x < width; x++, r3x++) {
        if (r3x === 3) {
          r3x = 0;
        }

        if (Number(!((x & y & 1) + Number(r3x && r3x === r3y) & 1)) && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  case 7:
    for (r3y = 0, y = 0; y < width; y++, r3y++) {
      if (r3y === 3) {
        r3y = 0;
      }

      for (r3x = 0, x = 0; x < width; x++, r3x++) {
        if (r3x === 3) {
          r3x = 0;
        }

        if (!(Number(r3x && r3x === r3y) + (x + y & 1) & 1) && !isMasked(x, y, currentMask)) {
          buffer[x + (y * width)] ^= 1;
        }
      }
    }

    break;
  }
}

function calculateMaxLength(dataBlock: number, neccBlock1: number, neccBlock2: number): number {
  return (dataBlock * (neccBlock1 + neccBlock2)) + neccBlock2;
}

function calculatePolynomial(polynomial: Uint8Array, eccBlock: number) {
  polynomial[0] = 1;

  for (let i = 1; i < eccBlock; i++) {
    polynomial[i] = 1;

    for (let j = i; j > 0; j--) {
      polynomial[j] = polynomial[j] ? polynomial[j - 1] ^
        Galois.EXPONENT[modN(Galois.LOG[polynomial[j]] + i)] : polynomial[j - 1];
    }

    polynomial[0] = Galois.EXPONENT[modN(Galois.LOG[polynomial[0]] + i)];
  }

  // Use logs for generator polynomial to save calculation step.
  for (let i = 0; i <= eccBlock; i++) {
    polynomial[i] = Galois.LOG[polynomial[i]];
  }
}

function checkBadness(badness: number[], buffer: Buffer, width: number) {
  let b1, h;
  let bad = 0;

  // Blocks of same colour.
  for (let y = 0; y < width - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      // All foreground colour.
      if ((buffer[x + (width * y)] &&
        buffer[x + 1 + (width * y)] &&
        buffer[x + (width * (y + 1))] &&
        buffer[x + 1 + (width * (y + 1))]) ||
        // All background colour.
        !(buffer[x + (width * y)] ||
        buffer[x + 1 + (width * y)] ||
        buffer[x + (width * (y + 1))] ||
        buffer[x + 1 + (width * (y + 1))])) {
        bad += N2;
      }
    }
  }

  let bw = 0;

  // X runs.
  for (let y = 0; y < width; y++) {
    h = 0;

    badness[0] = 0;

    for (let b = 0, x = 0; x < width; x++) {
      b1 = buffer[x + (width * y)];

      if (b === b1) {
        badness[h]++;
      } else {
        badness[++h] = 1;
      }

      b = b1;
      bw += b ? 1 : -1;
    }

    bad += getBadness(h, badness);
  }

  if (bw < 0) {
    bw = -bw;
  }

  let count = 0;
  let big = bw;
  big += big << 2;
  big <<= 1;

  while (big > width * width) {
    big -= width * width;
    count++;
  }

  bad += count * N4;

  // Y runs.
  for (let x = 0; x < width; x++) {
    h = 0;

    badness[0] = 0;

    for (let b = 0, y = 0; y < width; y++) {
      b1 = buffer[x + (width * y)];

      if (b === b1) {
        badness[h]++;
      } else {
        badness[++h] = 1;
      }

      b = b1;
    }

    bad += getBadness(h, badness);
  }

  return bad;
}

function convertBitStream(length: number, version: number, value: string, ecc: Uint8Array, dataBlock: number, neccBlock1: number, neccBlock2: number): Uint8Array {
  let bit, i;

  // Convert string to bit stream. 8-bit data to QR-coded 8-bit data (numeric, alphanumeric, or kanji not supported).
  for (i = 0; i < length; i++) {
    ecc[i] = value.charCodeAt(i);
  }

  const stringBuffer = ecc;
  const maxLength = calculateMaxLength(dataBlock, neccBlock1, neccBlock2);

  if (length >= maxLength - 2) {
    length = maxLength - 2;

    if (version > 9) {
      length--;
    }
  }

  // Shift and re-pack to insert length prefix.
  let index = length;

  if (version > 9) {
    stringBuffer[index + 2] = 0;
    stringBuffer[index + 3] = 0;

    while (index--) {
      bit = stringBuffer[index];

      stringBuffer[index + 3] |= 255 & (bit << 4);
      stringBuffer[index + 2] = bit >> 4;
    }

    stringBuffer[2] |= 255 & (length << 4);
    stringBuffer[1] = length >> 4;
    stringBuffer[0] = 0x40 | (length >> 12);
  } else {
    stringBuffer[index + 1] = 0;
    stringBuffer[index + 2] = 0;

    while (index--) {
      bit = stringBuffer[index];

      stringBuffer[index + 2] |= 255 & (bit << 4);
      stringBuffer[index + 1] = bit >> 4;
    }

    stringBuffer[1] |= 255 & (length << 4);
    stringBuffer[0] = 0x40 | (length >> 4);
  }

  // Fill to end with pad pattern.
  index = length + 3 - Number(version < 10);

  while (index < maxLength) {
    stringBuffer[index++] = 0xec;
    stringBuffer[index++] = 0x11;
  }

  return stringBuffer;
}

function getBadness(length: number, badness: readonly number[]) {
  let badRuns = 0;

  for (let i = 0; i <= length; i++) {
    if (badness[i] >= 5) {
      badRuns += N1 + badness[i] - 5;
    }
  }

  // FBFFFBF as in finder.
  for (let i = 3; i < length - 1; i += 2) {
    if (badness[i - 2] === badness[i + 2] &&
      badness[i + 2] === badness[i - 1] &&
      badness[i - 1] === badness[i + 1] &&
      badness[i - 1] * 3 === badness[i] &&
      // Background around the foreground pattern? Not part of the specs.
      (badness[i - 3] === 0 || i + 3 > length ||
      badness[i - 3] * 3 >= badness[i] * 4 ||
      badness[i + 3] * 3 >= badness[i] * 4)) {
      badRuns += N3;
    }
  }

  return badRuns;
}

function finish(level: number, badness: number[], buffer: Buffer, width: number, oldCurrentMask: Mask): Uint8Array {
  // Save pre-mask copy of frame.
  const tempBuffer = buffer.slice();

  let currentMask, i;
  let bit = 0;
  let mask = 30000;

  /*
    * Using for instead of while since in original Arduino code if an early mask was "good enough" it wouldn't try for
    * a better one since they get more complex and take longer.
    */
  for (i = 0; i < 8; i++) {
    // Returns foreground-background imbalance.
    applyMask(width, buffer, i, oldCurrentMask);

    currentMask = checkBadness(badness, buffer, width);

    // Is current mask better than previous best?
    if (currentMask < mask) {
      mask = currentMask;
      bit = i;
    }

    // Don't increment "i" to a void redoing mask.
    if (bit === 7) {
      break;
    }

    // Reset for next pass.
    buffer = tempBuffer.slice();
  }

  // Redo best mask as none were "good enough" (i.e. last wasn't bit).
  if (bit !== i) {
    applyMask(width, buffer, bit, oldCurrentMask);
  }

  // Add in final mask/ECC level bytes.
  mask = ErrorCorrection.FINAL_FORMAT[bit + (level - 1 << 3)];

  // Low byte.
  for (i = 0; i < 8; i++, mask >>= 1) {
    if (mask & 1) {
      buffer[width - 1 - i + (width * 8)] = 1;

      if (i < 6) {
        buffer[8 + (width * i)] = 1;
      } else {
        buffer[8 + (width * (i + 1))] = 1;
      }
    }
  }

  // High byte.
  for (i = 0; i < 7; i++, mask >>= 1) {
    if (mask & 1) {
      buffer[8 + (width * (width - 7 + i))] = 1;

      if (i) {
        buffer[6 - i + (width * 8)] = 1;
      } else {
        buffer[7 + (width * 8)] = 1;
      }
    }
  }

  return buffer;
}

function interleaveBlocks(ecc: Uint8Array, eccBlock: number, dataBlock: number, neccBlock1: number, neccBlock2: number, stringBuffer: Uint8Array): Uint8Array {
  let i;
  let k = 0;
  const maxLength = calculateMaxLength(dataBlock, neccBlock1, neccBlock2);

  for (i = 0; i < dataBlock; i++) {
    for (let j = 0; j < neccBlock1; j++) {
      ecc[k++] = stringBuffer[i + (j * dataBlock)];
    }

    for (let j = 0; j < neccBlock2; j++) {
      ecc[k++] = stringBuffer[(neccBlock1 * dataBlock) + i + (j * (dataBlock + 1))];
    }
  }

  for (let j = 0; j < neccBlock2; j++) {
    ecc[k++] = stringBuffer[(neccBlock1 * dataBlock) + i + (j * (dataBlock + 1))];
  }

  for (i = 0; i < eccBlock; i++) {
    for (let j = 0; j < neccBlock1 + neccBlock2; j++) {
      ecc[k++] = stringBuffer[maxLength + i + (j * eccBlock)];
    }
  }

  return ecc;
}

function insertAlignments(version: number, width: number, buffer: Uint8Array, mask: Uint8Array) {
  if (version > 1) {
    const i = Alignment.BLOCK[version];
    let y = width - 7;

    for (;;) {
      let x = width - 7;

      while (x > i - 3) {
        addAlignment(x, y, buffer, mask, width);

        if (x < i) {
          break;
        }

        x -= i;
      }

      if (y <= i + 9) {
        break;
      }

      y -= i;

      addAlignment(6, y, buffer, mask, width);
      addAlignment(y, 6, buffer, mask, width);
    }
  }
}

function insertFinders(mask: Mask, buffer: Buffer, width: number) {
  for (let i = 0; i < 3; i++) {
    let j = 0;
    let y = 0;

    if (i === 1) {
      j = width - 7;
    }
    if (i === 2) {
      y = width - 7;
    }

    buffer[y + 3 + (width * (j + 3))] = 1;

    for (let x = 0; x < 6; x++) {
      buffer[y + x + (width * j)] = 1;
      buffer[y + (width * (j + x + 1))] = 1;
      buffer[y + 6 + (width * (j + x))] = 1;
      buffer[y + x + 1 + (width * (j + 6))] = 1;
    }

    for (let x = 1; x < 5; x++) {
      setMask(y + x, j + 1, mask);
      setMask(y + 1, j + x + 1, mask);
      setMask(y + 5, j + x, mask);
      setMask(y + x + 1, j + 5, mask);
    }

    for (let x = 2; x < 4; x++) {
      buffer[y + x + (width * (j + 2))] = 1;
      buffer[y + 2 + (width * (j + x + 1))] = 1;
      buffer[y + 4 + (width * (j + x))] = 1;
      buffer[y + x + 1 + (width * (j + 4))] = 1;
    }
  }
}

function insertTimingGap(width: number, mask: Mask) {
  for (let y = 0; y < 7; y++) {
    setMask(7, y, mask);
    setMask(width - 8, y, mask);
    setMask(7, y + width - 7, mask);
  }

  for (let x = 0; x < 8; x++) {
    setMask(x, 7, mask);
    setMask(x + width - 8, 7, mask);
    setMask(x, width - 8, mask);
  }
}

function insertTimingRowAndColumn(buffer: Buffer, mask: Mask, width: number) {
  for (let x = 0; x < width - 14; x++) {
    if (x & 1) {
      setMask(8 + x, 6, mask);
      setMask(6, 8 + x, mask);
    } else {
      buffer[8 + x + (width * 6)] = 1;
      buffer[6 + (width * (8 + x))] = 1;
    }
  }
}

function insertVersion(buffer: Buffer, width: number, version: number, mask: Mask) {
  if (version > 6) {
    const i = Version.BLOCK[version - 7];
    let j = 17;

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 3; y++, j--) {
        if (1 & (j > 11 ? version >> j - 12 : i >> j)) {
          buffer[5 - x + (width * (2 - y + width - 11))] = 1;
          buffer[2 - y + width - 11 + (width * (5 - x))] = 1;
        } else {
          setMask(5 - x, 2 - y + width - 11, mask);
          setMask(2 - y + width - 11, 5 - x, mask);
        }
      }
    }
  }
}

function isMasked(x: number, y: number, mask: Mask) {
  const bit = getMaskBit(x, y);

  return mask[bit] === 1;
}

function pack(width: number, dataBlock: number, eccBlock: number, neccBlock1: number, neccBlock2: number, mask: Mask, buffer: Buffer, stringBuffer: Uint8Array) {
  let bit: number;
  let k = 1;
  let v = 1;
  let x = width - 1;
  let y = width - 1;

  // Interleaved data and ECC codes.
  const length = ((dataBlock + eccBlock) * (neccBlock1 + neccBlock2)) + neccBlock2;

  for (let i = 0; i < length; i++) {
    bit = stringBuffer[i];

    for (let j = 0; j < 8; j++, bit <<= 1) {
      if (0x80 & bit) {
        buffer[x + (width * y)] = 1;
      }

      // Find next fill position.
      do {
        if (v) {
          x--;
        } else {
          x++;

          if (k) {
            if (y !== 0) {
              y--;
            } else {
              x -= 2;
              k = Number(!k);

              if (x === 6) {
                x--;
                y = 9;
              }
            }
          } else if (y !== width - 1) {
            y++;
          } else {
            x -= 2;
            k = Number(!k);

            if (x === 6) {
              x--;
              y -= 8;
            }
          }
        }

        v = Number(!v);
      } while (isMasked(x, y, mask));
    }
  }
}

function reverseMask(mask: Mask, width: number) {
  for (let x = 0; x < 9; x++) {
    setMask(x, 8, mask);
  }

  for (let x = 0; x < 8; x++) {
    setMask(x + width - 8, 8, mask);
    setMask(8, x, mask);
  }

  for (let y = 0; y < 7; y++) {
    setMask(8, y + width - 7, mask);
  }
}

function setMask(x: number, y: number, mask: Mask) {
  mask[getMaskBit(x, y)] = 1;
}

function syncMask(width: number, mask: Mask, buffer: Buffer) {
  for (let y = 0; y < width; y++) {
    for (let x = 0; x <= y; x++) {
      if (buffer[x + (width * y)]) {
        setMask(x, y, mask);
      }
    }
  }
}
