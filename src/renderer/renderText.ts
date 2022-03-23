import { FrameOptions, UserFacingFrameOptions, defaultFrameOptions, generateFrame } from '../Frame';

interface TextRenderOptions extends FrameOptions {
  readonly foregroundChar?: string;
  readonly backgroundChar?: string;
}

export const renderText = (options: Readonly<UserFacingFrameOptions<TextRenderOptions>> | string): string => {
  const processedOptions: Required<TextRenderOptions> = {
    ...defaultFrameOptions,
    foregroundChar: '#',
    backgroundChar: ' ',
    ...(typeof options === 'string' ? { value: options } : options)
  };

  const frame = generateFrame(processedOptions);

  let str = '';

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

  return str;
};
