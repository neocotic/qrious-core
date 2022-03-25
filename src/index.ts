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

export { renderText } from './renderer/renderText';
export { renderCanvas } from './renderer/renderCanvas';
export { renderTwoTone } from './renderer/renderTwoTone';
export type { ImageLikeRenderOptions } from './renderer/options/image';
export { defaultImageLikeRenderOptions } from './renderer/options/image';
export type { FrameOptions, UserFacingFrameOptions } from './Frame';
export { generateFrame, defaultFrameOptions } from './Frame';