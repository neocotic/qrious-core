import { UserFacingFrameOptions, generateFrame } from '../Frame';
import { defaultImageLikeRenderOptions, ImageLikeRenderOptions } from './options/image';
import { getModuleSize } from './utils';

export const renderCanvas = (options: UserFacingFrameOptions<ImageLikeRenderOptions> | string , canvas: HTMLCanvasElement) => {
  const processedOptions: ImageLikeRenderOptions = { 
    ...defaultImageLikeRenderOptions,
    ...(typeof options === 'string' ? { value: options } : options) 
  };

  const frame = generateFrame(processedOptions);

  let i, j;
  const moduleSize = getModuleSize(frame.width, processedOptions.size);
  const context = canvas.getContext('2d');

  if (context == null) {
    throw Error('2d Context is null!');
  }

  context.fillStyle = processedOptions.foregroundColor;
  context.globalAlpha = processedOptions.foregroundAlpha;

  for (i = 0; i < frame.width; i++) {
    for (j = 0; j < frame.width; j++) {
      if (frame.buffer[(j * frame.width) + i]) {
        context.fillRect(
          (moduleSize * i),
          (moduleSize * j),
          moduleSize, moduleSize
        );
      }
    }
  }
};
