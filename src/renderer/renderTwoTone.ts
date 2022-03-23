import { FrameOptions, UserFacingFrameOptions, defaultFrameOptions, generateFrame } from '../Frame';

export const renderTwoTone = (options: Readonly<UserFacingFrameOptions<FrameOptions>> | string): string => {
  const processedOptions: Required<FrameOptions> = {
    ...defaultFrameOptions,
    ...(typeof options === 'string' ? { value: options } : options)
  };

  const frame = generateFrame(processedOptions);

  let str = '';

  for (let i = 0; i < frame.width; i += 2) {
    for (let j = 0; j < frame.width; j++) {
      if (frame.buffer[(i * frame.width) + j] && frame.buffer[((i + 1) * frame.width) + j]) {
        str += "█";
      } else if (!frame.buffer[(i * frame.width) + j] && frame.buffer[((i + 1) * frame.width) + j]) {
        str += "▄";
      } else if (frame.buffer[(i * frame.width) + j] && !frame.buffer[((i + 1) * frame.width) + j]) {
        str += "▀";
      } else {
        str += " ";
      }
    }
    if (i !== frame.width - 1) {
      str += '\n';
    }
  }

  return str;
};
