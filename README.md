# background-imager.js

Reads a directory for images with special descriptors to produce responsive CSS classes using background-image. It is particularly helpful when dealing with a large number of classes with 2 or more image versions.

A directory with the following images produces similar proceeding CSS output:

```
noodle@1x.png
noodle@2x.png
noodle-small@1x.png
noodle-small@2x.png
```

```css
.noodle {
  background-image: url("test/images/noodle@1x.png");
  width: 64px;
  height: 64px;
}

@media only screen and (min-device-pixel-ratio: 2) {
  .noodle {
    background-image: url("test/images/noodle@2x.png");
    background-size: 64px 64px;
  }
}

@media only screen and (max-width: 480px) {
  .noodle {
    background-image: url("test/images/noodle-small@1x.png");
    width: 28px;
    height: 28px;
  }
}

@media only screen and (max-width: 480px) and (min-device-pixel-ratio: 2) {
  .noodle {
    background-image: url("test/images/noodle-small@2x.png");
    background-size: 28px 28px;
  }
}
```

Actual output contains several media queries per media rule to ensure cross-platform device-pixel-ratio support.

## Use

`background-imager --help`

Script searches for image files with the following descriptors in the filename:
* `@1x` e.g. noodle@1x.png
* `@2x` e.g. noodle@2x.png
* `-small`  e.g. noodle-small@1x.png

## Dependencies

background-imager.js assumes ImageMagick is installed.

On Mac OS X via brew `brew install imagemagick`

## Example

See `test/noodle.html`, which uses `test/noodle.css` that was generated from running script against `images/`. This is also part of the testing.

## Testing

```
npm test
```

At the moment there is a simple test using diff between produced CSS output and expected output (file). A proper testing framework implementing this ability should be used. If you have a suggestion please file an issue.

## TODO

* Improve testing
* Support both GraphicsMagick and ImageMagick
* Add support for @1.5x

## License

(The MIT License)

Copyright (c) 2013 [Hector Guillermo Parra Alvarez](hector@hectorparra.com)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.