     .d88888b.  8888888b.  d8b                                  .d8888b.
    d88P" "Y88b 888   Y88b Y8P                                 d88P  Y88b
    888     888 888    888                                     888    888
    888     888 888   d88P 888  .d88b.  888  888 .d8888b       888         .d88b.  888d888 .d88b.
    888     888 8888888P"  888 d88""88b 888  888 88K           888        d88""88b 888P"  d8P  Y8b
    888 Y8b 888 888 T88b   888 888  888 888  888 "Y8888b.      888    888 888  888 888    88888888
    Y88b.Y8b88P 888  T88b  888 Y88..88P Y88b 888      X88      Y88b  d88P Y88..88P 888    Y8b.
     "Y888888"  888   T88b 888  "Y88P"   "Y88888  88888P'       "Y8888P"   "Y88P"  888     "Y8888
           Y8b

[QRious Core](https://github.com/neocotic/qrious-core) is the core engine for
[QRious](https://github.com/neocotic/qrious)' QR code generation as well as modules to support other environments (e.g.
[QRious Node](https://github.com/neocotic/node-qrious)).

[![Chat](https://img.shields.io/gitter/room/neocotic/qrious.svg?style=flat-square)](https://gitter.im/neocotic/qrious)
[![Build Status](https://img.shields.io/travis/neocotic/qrious-core/develop.svg?style=flat-square)](https://travis-ci.org/neocotic/qrious-core)
[![Dependency Status](https://img.shields.io/david/neocotic/qrious-core.svg?style=flat-square)](https://david-dm.org/neocotic/qrious-core)
[![Dev Dependency Status](https://img.shields.io/david/dev/neocotic/qrious-core.svg?style=flat-square)](https://david-dm.org/neocotic/qrious-core?type=dev)
[![License](https://img.shields.io/npm/l/qrious-core.svg?style=flat-square)](https://github.com/neocotic/qrious-core/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/qrious-core.svg?style=flat-square)](https://www.npmjs.com/package/qrious-core)

* [Install](#install)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using `npm`:

``` bash
$ npm install --save qrious-core
```

You will most likely never need to depend on `qrious-core` directly. Instead, you will probably want to install a module
that supports your desired environment. For example:

* [qrious](https://github.com/neocotic/qrious) for browser
* [node-qrious](https://github.com/neocotic/node-qrious) for Node.js

## API

As this is the core of QRious, it contains all of the QR code generation logic and, since it's designed to use HTML5
canvas to render the QR code, all that consumers need to do is define and register an implementation of
`ElementService`.

Most modules that use QRious Core will look something like the following:

``` javascript
var ElementService = require('qrious-core/src/service/element/ElementService');
var QRious = require('qrious-core');

var ExampleElementService = ElementService.extend({
  createCanvas: function() { /* ... */ },
  createImage: function() { /* ... */ },
  isCanvas: function(element) { /* ... */ },
  isImage: function(element) { /* ... */ }
});

QRious.use(new ExampleElementService());

module.exports = QRious;
```

This allows the core to control the primary API and keep it consistent across all environments. With the above in place,
you are free to import QRious and use it as you would anywhere else.

You will find the primary API documentation on [QRious](https://github.com/neocotic/qrious). All direct consumers of
core should also reference this to help developers find the information easily. However, they are encouraged to provide
environment-specific examples.

## Bugs

If you have any problems with QRious Core or would like to see changes currently in development you can do so
[here](https://github.com/neocotic/qrious-core/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/qrious-core/blob/master/CONTRIBUTING.md). We want your suggestions and
pull requests!

A list of QRious Core contributors can be found in
[AUTHORS.md](https://github.com/neocotic/qrious-core/blob/master/AUTHORS.md).

## License

Copyright © 2017 Alasdair Mercer  
Copyright © 2010 Tom Zerucha

See [LICENSE.md](https://github.com/neocotic/qrious-core/blob/master/LICENSE.md) for more information on our GPLv3
license.
