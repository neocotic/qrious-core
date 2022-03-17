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

import type Service from "./Service"

/**
 * A basic manager for {@link Service} implementations that are mapped to simple names.
 */
class ServiceManager {
  private _services: { [key: string]: Service } = {};


  /**
   * Returns the {@link Service} being managed with the specified <code>name</code>.
   *
   * @param name - the name of the {@link Service} to be returned
   * @return The {@link Service} is being managed with <code>name</code>.
   * @throws {Error} If no {@link Service} is being managed with <code>name</code>.
   */
  getService(name: string): Service {
    let service = this._services[name];
    if (!service) {
      throw new Error('Service is not being managed with name: ' + name);
    }

    return service;
  }

  /**
   * Sets the {@link Service} implementation to be managed for the specified <code>name</code> to the
   * <code>service</code> provided.
   *
   * @param name - the name of the {@link Service} to be managed with <code>name</code>
   * @param service - the {@link Service} implementation to be managed
   * @throws {Error} If a {@link Service} is already being managed with the same <code>name</code>.
   */
  setService(name: string, service: Service): void {
    if (this._services[name]) {
      throw new Error('Service is already managed with name: ' + name);
    }

    if (service) {
      this._services[name] = service;
    }
  }

}

export default ServiceManager;
