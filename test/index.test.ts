import QRious from '../src/QRious';

// A renderer can either be a:

// PureRenderer
// SideEffectRenderer - Wraps an element (ex a canvas) for direct output

// BaseRenderOptions (level, content)
// PaddedRenderOptions (padding) & BaseRenderOptions
// ImageLikeRenderOptions (bg, balpha, fg, falpha) & PaddedRenderOptions

// class BrowserCanvasFrameRenderer(ImageLikeRenderOptions, HTMLCanvasElement) -> void (side effect)
// class NodeCanvasFrameRenderer(ImageLikeRenderOptions) -> img (pure)
// clas TextFrameRenderer(ImageLikeRenderOptions) -> string (pure)

// { }


test('woo', () => {
  expect(1 + 2).toBe(3);
});
