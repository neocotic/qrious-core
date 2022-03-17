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

import CanvasRenderer from './renderer/CanvasRenderer'
import Frame from './Frame'
import ImageRenderer from './renderer/ImageRenderer'
import ServiceManager from './service/ServiceManager'
import type Service from './service/Service';
import type { Level } from "./ErrorCorrection"

/**
 * The options used by {@link QRious}.
 *
 * @typedef {Object} QRious~Options
 * @property {string} [background="white"] - The background color to be applied to the QR code.
 * @property {number} [backgroundAlpha=1] - The background alpha to be applied to the QR code.
 * @property {*} [element] - The element to be used to render the QR code which may either be an <code>canvas</code> or
 * <code>img</code>. The element(s) will be created if needed.
 * @property {string} [foreground="black"] - The foreground color to be applied to the QR code.
 * @property {number} [foregroundAlpha=1] - The foreground alpha to be applied to the QR code.
 * @property {string} [level="L"] - The error correction level to be applied to the QR code.
 * @property {string} [mime="image/png"] - The MIME type to be used to render the image for the QR code.
 * @property {number} [padding=0] - The padding for the QR code in pixels.
 * @property {number} [size=100] - The size of the QR code in pixels.
 * @property {string} [value=""] - The value to be encoded within the QR code.
 */
interface QRiousOptions {
  background: string;
  backgroundAlpha: number;
  element: HTMLCanvasElement;
  foreground: string;
  foregroundAlpha: number;
  level: Level;
  mime: string;
  padding: number;
  size: number;
  value: string;
}

const generateDefaultOptions = (): Partial<QRiousOptions> => ({
  background: "white",
  backgroundAlpha: 1,
  foreground: "black",
  foregroundAlpha: 1,
  level: "L",
  mime: "image/png",
  padding: 0,
  size: 100,
  value: ""
})

var serviceManager = new ServiceManager();

/**
 * Enables configuration of a QR code generator which uses HTML5 <code>canvas</code> for rendering.
 *
 * @param {QRious~Options} [options] - the options to be used
 * @throws {Error} If any <code>options</code> are invalid.
 * @public
 * @class
 */
class QRious {
  padding: number | undefined;
  mime: string | undefined;
  _canvasRenderer: CanvasRenderer;
  _imageRenderer: ImageRenderer;
  private _options: QRiousOptions 

  constructor(options: QRiousOptions) {
    this._options = Object.assign(generateDefaultOptions(), options)

    var element = options.element as any
    var elementService = serviceManager.getService('element');
    var canvas = element && elementService.isCanvas(element) ? element : elementService.createCanvas();
    var image = element && elementService.isImage(element) ? element : elementService.createImage();

    this._canvasRenderer = new CanvasRenderer(this, canvas, true);
    this._imageRenderer = new ImageRenderer(this, image, image === element);

    this.update();
  }

  get options(): QRiousOptions {
    return this._options
  }

  change(value: Partial<QRiousOptions>) {
    this._options = Object.assign(this._options, value)

    this.update()
  }

  /**
   * Returns the image data URI for the generated QR code using the <code>mime</code> provided.
   *
   * @param [mime] - the MIME type for the image
   * @return The image data URI for the QR code.
   * @memberof QRious#
   */
  toDataURL(mime?: string): string {
    return this.canvas.toDataURL(mime || this.mime);
  }

  /**
   * Updates this {@link QRious} by generating a new {@link Frame} and re-rendering the QR code.
   *
   * @memberof QRious#
   */
  protected update(): void {
    var frame = new Frame({
      level: this.options.level,
      value: this.options.value
    });

    this._canvasRenderer.render(frame);
    this._imageRenderer.render(frame);
  }

  /**
   * Returns the <code>canvas</code> element being used to render the QR code for this {@link QRious}.
   *
   * @return The <code>canvas</code> element.
   */
  get canvas(): any {
    return this._canvasRenderer.getElement();
  }

  /**
   * Returns the <code>img</code> element being used to render the QR code for this {@link QRious}.
   *
   * @return The <code>img</code> element.
   */
   get image(): any {
    return this._imageRenderer.getElement();
  }

  /**
   * Configures the <code>service</code> provided to be used by all {@link QRious} instances.
   *
   * @param {Service} service - the {@link Service} to be configured
   * @throws {Error} If a {@link Service} has already been configured with the same name.
   */
  static use(service: Service): void {
    serviceManager.setService(service.getName(), service);
  }

}

export default QRious;