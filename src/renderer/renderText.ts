import Frame, { UserFacingFrameOptions } from '../Frame';
import { BaseRenderOptions, defaultBaseRenderOptions } from './options/base';

interface TextRenderOptions extends BaseRenderOptions {
  foregroundChar?: string;
  backgroundChar?: string;
}

export const renderText = (options: UserFacingFrameOptions<TextRenderOptions> | string): string => {
  const processedOptions: Required<TextRenderOptions> = Object.assign({
    ...defaultBaseRenderOptions,
    foregroundChar: '#',
    backgroundChar: ' '
  }, typeof options === 'string' ? { value: options } : options);

  const frame = new Frame(processedOptions);

  let str = '';

  for (let p = 0; p < processedOptions.padding; p++) {
    str += '\n';
  }

  for (let i = 0; i < frame.width; i++) {
    for (let j = 0; j < frame.width; j++) {
      if (frame.buffer[(j * frame.width) + i]) {
        str += processedOptions.foregroundChar;
      } else {
        str += processedOptions.backgroundChar;
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
