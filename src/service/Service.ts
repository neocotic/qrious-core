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

/**
 * Defines a service contract that must be met by all implementations.
 */
export default abstract class Service {

  isCanvas(element: any): boolean {
    throw new Error('Method not implemented.');
  }
  createCanvas(): HTMLCanvasElement {
    throw new Error('Method not implemented.');
  }
  isImage(element: any): boolean {
    throw new Error('Method not implemented.');
  }
  createImage(): HTMLImageElement {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns the name of this {@link Service}.
   *
   * @return The service name.
   */
  abstract get name(): string

}
