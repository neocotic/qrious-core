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
import { QRiousElement } from "./renderer/Renderer"
import ImageRenderer from './renderer/ImageRenderer'
import ServiceManager from './service/ServiceManager'
import type Service from './service/Service';
import type { Level } from "./ErrorCorrection"

/**
 * The options used by {@link QRious}.
*/
interface QRiousOptions {
  /** The background color of the QR code. Default is white. */
  background: string;
  /* The transparency of the background. From 1-0, default is 1. */
  backgroundAlpha: number;
  /* The canvas to render the element on. */
  element: HTMLCanvasElement;
  /** The foreground color of the QR code. Default is black */
  foreground: string;
  /** The transparency of the background. From 1-0, default is 1 */
  foregroundAlpha: number;
  /** The error correction level of the QR code */
  level: Level;
  /** The MINE type of the rendered image */
  mime: string;
  /** The padding of the qr code in pixels */
  padding: number;
  /** The size of the qr code in pixels */
  size: number;
  /** The value in the QR code */
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

let serviceManager = new ServiceManager();

/**
 * Enables configuration of a QR code generator which uses HTML5 <code>canvas</code> for rendering.
 *
 * @param {QRious~Options} [options] - the options to be used
 * @throws {Error} If any <code>options</code> are invalid.
 */
class QRious {
  padding: number | undefined;
  mime: string | undefined;
  _canvasRenderer: CanvasRenderer;
  _imageRenderer: ImageRenderer;
  private _options: QRiousOptions 

  constructor(options: QRiousOptions) {
    this._options = Object.assign(generateDefaultOptions(), options)

    let element = options.element as any
    let elementService = serviceManager.getService('element');
    let canvas = element && elementService.isCanvas(element) ? element : elementService.createCanvas();
    let image = element && elementService.isImage(element) ? element : elementService.createImage();

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
    const frame = new Frame({
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
  get canvas(): QRiousElement<HTMLCanvasElement> {
    return this._canvasRenderer.getElement();
  }

  /**
   * Returns the <code>img</code> element being used to render the QR code for this {@link QRious}.
   *
   * @return The <code>img</code> element.
   */
   get image(): QRiousElement<HTMLImageElement> {
    return this._imageRenderer.getElement();
  }

  /**
   * Configures the <code>service</code> provided to be used by all {@link QRious} instances.
   *
   * @param service - the {@link Service} to be configured
   * @throws {Error} If a {@link Service} has already been configured with the same name.
   */
  static use(service: Service): void {
    serviceManager.setService(service.name, service);
  }

}

export default QRious;