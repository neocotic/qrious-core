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

import Renderer from './Renderer';
import Frame from '../Frame';

/**
 * An implementation of {@link Renderer} for working with <code>canvas</code> elements.
 */
class CanvasRenderer extends Renderer<HTMLCanvasElement> {

  override draw(frame: Frame) {
    let i, j;
    const moduleSize = this.getModuleSize(frame);
    const offset = this.getOffset(frame);
    const context = this.element.getContext('2d');
    
    if (context == null) throw Error("2d Context is null!")

    context.fillStyle = this.qrious.options.foreground;
    context.globalAlpha = this.qrious.options.foregroundAlpha;

    for (i = 0; i < frame.width; i++) {
      for (j = 0; j < frame.width; j++) {
        if (frame.buffer[(j * frame.width) + i]) {
          context.fillRect((moduleSize * i) + offset, (moduleSize * j) + offset, moduleSize, moduleSize);
        }
      }
    }
  }

  override reset() {
    const context = this.element.getContext('2d');
    const size = this.qrious.options.size;

    if (context == null) throw Error("2d Context is null!")

    context.lineWidth = 1;
    context.clearRect(0, 0, size, size);
    context.fillStyle = this.qrious.options.background;
    context.globalAlpha = this.qrious.options.backgroundAlpha;
    context.fillRect(0, 0, size, size);
  }

  override resize() {
    this.element.width = this.element.height = this.qrious.options.size;
  }

}

export default CanvasRenderer;
