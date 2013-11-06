# background-imager.js

background-imager takes image files with [micro media queries](https://gist.github.com/hparra/6789798/) and produces responsive CSS classes. It is particularly helpful when dealing with a large number of CSS classes with 2 or more image versions each.

## Example

Running `background-imager test/` which has the following images:

```
noodle@1x,2x+480w.png
noodle@1x+480w.png
noodle@1.5x.ping
noodle@1.5+480w.png
noodle@2x.png
```
...will produce the following CSS output:

```css
.noodle {
  background-image: url("images/noodle@1x,2x+480w.png");
  width: 64px;
  height: 64px;
}

@media
only screen and (-webkit-min-device-pixel-ratio: 1.5),
only screen and (min--moz-device-pixel-ratio: 1.5),
only screen and (-o-min-device-pixel-ratio: 15/10),
only screen and (min-device-pixel-ratio: 1.5),
only screen and (min-resolution: 144dpi),
only screen and (min-resolution: 1.5dppx) {
  .noodle {
    background-image: url("images/noodle@1.5x.png");
    background-size: 64px 64px;
  }
}

@media
only screen and (-webkit-min-device-pixel-ratio: 2),
only screen and (min--moz-device-pixel-ratio: 2),
only screen and (-o-min-device-pixel-ratio: 2/1),
only screen and (min-device-pixel-ratio: 2),
only screen and (min-resolution: 192dpi),
only screen and (min-resolution: 2dppx) {
  .noodle {
    background-image: url("images/noodle@2x.png");
    background-size: 64px 64px;
  }
}

@media
only screen and (max-width: 480px) {
  .noodle {
    background-image: url("images/noodle@1x+480w.png");
    width: 32px;
    height: 32px;
  }
}

@media
only screen and (max-width: 480px) and (-webkit-min-device-pixel-ratio: 1.5),
only screen and (max-width: 480px) and (min--moz-device-pixel-ratio: 1.5),
only screen and (max-width: 480px) and (-o-min-device-pixel-ratio: 15/10),
only screen and (max-width: 480px) and (min-device-pixel-ratio: 1.5),
only screen and (max-width: 480px) and (min-resolution: 144dpi),
only screen and (max-width: 480px) and (min-resolution: 1.5dppx) {
  .noodle {
    background-image: url("images/noodle@1.5x+480w.png");
    background-size: 32px 32px;
  }
}

@media
only screen and (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2),
only screen and (max-width: 480px) and (min--moz-device-pixel-ratio: 2),
only screen and (max-width: 480px) and (-o-min-device-pixel-ratio: 2/1),
only screen and (max-width: 480px) and (min-device-pixel-ratio: 2),
only screen and (max-width: 480px) and (min-resolution: 192dpi),
only screen and (max-width: 480px) and (min-resolution: 2dppx) {
  .noodle {
    background-image: url("images/noodle@1x,2x+480w.png");
    background-size: 32px 32px;
  }
}
```

## Use

See `background-imager --help`

## Dependencies

background-imager.js assumes ImageMagick is installed.

On Mac OS X via brew `brew install imagemagick`

## Demo

See `test/noodle.html`, which uses `test/noodle.css` that was generated from running script against `images/`. This CSS file is also used in testing.

## Testing

```
npm test
```

Numerous BDD-style tests using Mocha, though coverage is just short of 100%.

## Known Issues

While the `x` descriptor feature should correspond to the `max-device-pixel-ratio` media query feature there is difficulty in producing multiple at-rules that work as expected. As a result all queries use `min-device-pixel-ratio`, though the codebase makes this change trivial in the case that a viable `max-device-pixel-ratio` solution is found.

## License

(The MIT License)

Copyright (c) 2013 [Hector Guillermo Parra Alvarez](https://twitter.com/hgparra)

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