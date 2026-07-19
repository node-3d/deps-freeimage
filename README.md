# FreeImage binaries and headers

This is a part of [Node3D](https://github.com/node-3d) project.

[![NPM](https://badge.fury.io/js/@node-3d%2Fdeps-freeimage.svg)](https://badge.fury.io/js/@node-3d/deps-freeimage)
[![Lint](https://github.com/node-3d/deps-freeimage/actions/workflows/lint.yml/badge.svg)](https://github.com/node-3d/deps-freeimage/actions/workflows/lint.yml)
[![Test](https://github.com/node-3d/deps-freeimage/actions/workflows/test.yml/badge.svg)](https://github.com/node-3d/deps-freeimage/actions/workflows/test.yml)

```bash
npm install @node-3d/deps-freeimage
```

## Binary Origin

Release archives are built by this repository's public GitHub Actions workflows.

Attestations: https://github.com/node-3d/deps-freeimage/attestations

To verify a downloaded archive:

```bash
gh release download <tag> -R node-3d/deps-freeimage -p <platform>.gz
gh attestation verify <platform>.gz -R node-3d/deps-freeimage
```

This dependency package distributes **FreeImage 3.18**
binaries and headers through **npm** for **Node.js** addons.

* Platforms: Windows x64, Linux x64/ARM64, macOS x64/ARM64.
* Library: FreeImage.


### JS Interface

See the [@node-3d/image public entrypoint](https://github.com/node-3d/image/blob/master/ts/index.ts).


### binding.gyp

See the [@node-3d/image binding.gyp](https://github.com/node-3d/image/tree/master/src/binding.gyp).


### addon.cpp

See the [@node-3d/image native source](https://github.com/node-3d/image/blob/master/src/cpp/image.hpp).

```cpp
#include <FreeImage.h>
```

Refer to [FreeImage 3.18 docs](http://downloads.sourceforge.net/freeimage/FreeImage3180.pdf).


## Legal notice

This software uses the [FreeImage open source image library](http://freeimage.sourceforge.net).
FreeImage is legally used under the FIPL (FreeImage Public License) version.
It is explicitly stated that FreeImage can be used commercially under FIPL.

FreeImage licensing information (a copy) is given in a [separate file](FREEIMAGE_FIPL),
which also can be found on
[FreeImage's official web-site](http://freeimage.sourceforge.net/license.html).
The rest of this package is MIT licensed.

Windows, Linux, and macOS binaries are built with
[GitHub Actions](https://github.com/node-3d/deps-freeimage/actions).
