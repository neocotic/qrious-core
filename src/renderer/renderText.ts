import Frame, { UserFacingFrameOptions } from '../Frame';
import { BaseRenderOptions, defaultBaseRenderOptions } from './options/base';

interface TextRenderOptions extends BaseRenderOptions {
  foregroundChar?: string;
  backgroundChar?: string;
}

export const renderText = (options: UserFacingFrameOptions<TextRenderOptions>): string => {
  const processedOptions: Required<TextRenderOptions> = Object.assign(defaultBaseRenderOptions, {
    foregroundChar: '#',
    backgroundChar: ' '
  }, options);

  const frame = new Frame(processedOptions);

  let i, j;

  let str = '';

  for (i = 0; i < frame.width; i++) {
    for (j = 0; j < frame.width; j++) {
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

  return str;
};
