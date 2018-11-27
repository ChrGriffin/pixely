<p align="center">
<img src="https://app.codeship.com/projects/8d0df2d0-d4a2-0136-e629-3eca7593b0b3/status?branch=master" alt="Build Status">
<img src="https://img.shields.io/github/license/chrgriffin/pixely.svg" alt="License">
<img src="https://img.shields.io/npm/v/pixely.svg" alt="NPM Version">
</p>

# Pixely
Convert images to pure CSS. Even animated GIFs!

## Installation

Install Pixely with NPM:

```
npm install pixely
```

If you're only interested in the CLI functionality, you may wish to install globally.

## Usage

You can import Pixely into your project and instantiate it with:

```
var { Pixely } = require('pixely');
```

A new Pixely instance accepts four arguments:

1. The path to the image to convert (required)
2. The path to the output folder (optional, defaults to 'output')
3. The animation duration in seconds (optional, defaults to 1, ignored if image is not animated)
4. The scale of the image (optional, defaults to 1, defines that 1 image pixel = ? CSS pixels)

Once instantiated, you can run the conversion process with the `make()` method.

```
var pixely = new Pixely('path/or/url/to/image', 'path/to/output/folder', 2, 2);
pixely.make();
```

If you need more fine-grain control over when specific steps in the process occur, the class is broken up into five main methods:

```
pixely.getImage().then(() => { // read the image file (returns a promise)
	pixely.buildHtml(); // build the HTML string
	pixely.buildCss(); // build the CSS string
	pixely.exportHtml(); // save the HTML string to the configured filepath
	pixely.exportCss(); // save the CSS string to the configured filepath
});
```


## CLI Usage

Once installed, you should be able to use Pixely from the command line using the `pixely` command:

```
pixely 'path/or/url/to/image'
```

By default, Pixely will output the HTML and CSS files to `/output/index.<html|css>`. You can change the output folder with the `--folder` option:

```
pixely 'path/or/url/to/image' --folder=path/to/output/folder
pixely 'path/or/url/to/image' -f path/to/output/folder
```

Also by default, Pixely will generate CSS for a 1-second animation if the image is an animated GIF. You can alter the animation time in the CSS directly, or you can define an animation time (in seconds) with the `--duration` option:

```
pixely 'path/or/url/to/image' --duration=4
pixely 'path/or/url/to/image' -d 4
```

Also by default, Pixely will scale the image to a 1-to-1 scale (1 image pixel = 1 CSS pixel). You can change the scale by setting the `font-size` attribute of the wrapper div in the CSS directly, or you can specify your own scale with the `--scale` option (whole numbers are recommended):

```
pixely 'path/or/url/to/image' --scale=2
pixely 'path/or/url/to/image' -s 2
```

## Under the Hood

Pixely first reads a given image file to determine whether it is a static or animated image. From there it arranges the pixel information into a series of 'frames' (or a single frame if the image is static). Finally, it takes these frames and constructs a grid of pixels using the box-shadow method explained [here by CSS-Tricks.](https://css-tricks.com/fun-times-css-pixel-art/#article-header-id-6).
