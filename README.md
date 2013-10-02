# background-imager.js

background-imager takes image files with [micro media queries](https://gist.github.com/hparra/6789798/) and produces responsive CSS classes. It is particularly helpful when dealing with a large number of CSS classes with 2 or more image versions each.

## Example

A directory with the following images...

```
noodle@1x,2x^480w.png
noodle@1x^480w.png
noodle@2x.png
```

...produces similar proceeding CSS output:


```css
.noodle {
  background-image: url("test/images/noodle@1x,2x^480w.png");
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
    background-image: url("test/images/noodle@1x^480w.png");
    width: 28px;
    height: 28px;
  }
}

@media only screen and (max-width: 480px) and (min-device-pixel-ratio: 2) {
  .noodle {
    background-image: url("test/images/noodle-small@1x,2x^480w.png");
    background-size: 28px 28px;
  }
}
```

Actual output contains several media queries per media rule to ensure cross-platform device-pixel-ratio support. They were removed here for brevity. Please see `test/noodle.css` for actual output.

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

## TODO

* Add support for both GraphicsMagick and ImageMagick
* Fork and use code base to produce `<img srcset>` and `<picture>`

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