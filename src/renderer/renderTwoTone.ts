import Frame, { UserFacingFrameOptions } from '../Frame';
import { BaseRenderOptions, defaultBaseRenderOptions } from './options/base';

export const renderTwoTone = (options: Readonly<UserFacingFrameOptions<BaseRenderOptions>> | string): string => {
  const processedOptions: Required<BaseRenderOptions> = {
    ...defaultBaseRenderOptions,
    ...(typeof options === 'string' ? { value: options } : options)
  };

  const frame = Frame(processedOptions);

  let str = '';

  for (let p = 0; p < processedOptions.padding; p++) {
    str += '\n';
  }

  for (let i = 0; i < frame.width; i += 2) {
    for (let j = 0; j < frame.width; j++) {
      if (frame.buffer[(i * frame.width) + j] && frame.buffer[((i + 1) * frame.width) + j]) {
        str += "█";
      } else if (!frame.buffer[(i * frame.width) + j] && frame.buffer[((i + 1) * frame.width) + j]) {
        str += "▄";
      } else if (frame.buffer[(i * frame.width) + j] && !frame.buffer[((i + 1) * frame.width) + j]) {
        str += "▀"
      } else {
        str += " "
      }
    }
    if (i !== frame.width - 1) {
      str += '\n';
    }
  }

  for (let p = 0; p < processedOptions.padding; p++) {
    str += '\n';
  }

  return str;
};
