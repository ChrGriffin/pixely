"use strict";

var getPixels = require('get-pixels');
var ndArrayUnpack = require('ndarray-unpack');
var fs = require('fs-extra');

/**
 * Class to convert an image to CSS.
 *
 * @prop {string}  source
 * @prop {int}     scale
 * @prop {int}     animationSeconds
 * @prop {bool}    animated
 * @prop {string}  className
 * @prop {string}  html
 * @prop {string}  css
 * @prop {array}   frames
 */
class Pixely
{
	/**
	 * PixelArt constructor.
	 *
	 * @param {string} source
	 * @param {string} directory
	 * @param {float} animationDuration
	 * @param {float} scale
	 * @return {void}
	 */
	constructor(source, directory, animationDuration, scale)
	{
		this.source = source;
		this.animationSeconds = 1;
		this.animated = false;
		this.html = '';
		this.css = '';
		this.frames = [];
		this.className = 'pixely-' + Math.floor((Math.random() * 10000) + 1);

		if(this._isString(directory)) {
			this.directory = directory;
		}
		else {
			this.directory = 'output';
		}

		if(typeof animationDuration == 'undefined') {
			this.animationDuration = 1;
		}
		else {
			this.animationDuration = parseFloat(animationDuration);
		}

		if(typeof scale == 'undefined') {
			this.scale = 1;
		}
		else {
			this.scale = parseFloat(scale);
		}

		return this;
	}

	/**
	 * Perform the full set of functions to convert an image to CSS.
	 *
	 * @return {Promise}
	 */
	make()
	{
		const _this = this;
		return new Promise(function(resolve, reject) {
			_this.getImage().then(() => {
				_this.buildHtml();
				_this.buildCss();
				_this.exportHtml();
				_this.exportCss();
				resolve();
			});
		});
	}

	/**
	 * Retrieve image data for the given image.
	 *
	 * @return {Promise}
	 */
	getImage()
	{
		const _this = this;
		return new Promise(function(resolve, reject) {
			getPixels(_this.source, function(error, pixels)
			{
				if(error) {
					reject(error);
					return;
				}

				if(pixels.shape.length === 4) { // animated
					_this.animated = true;
					_this.frames = _this._convertAnimatedImage(pixels);
					resolve();
					return;
				}
				else if(pixels.shape.length === 3) { // not animated
					_this.animated = false;
					_this.frames = [_this._convertFrame(ndArrayUnpack(pixels))];
					resolve();
					return;
				}

				reject('Unsupported image shape.');
				return;
			})
		});
	}

	/**
	 * Build HTML markup for the image.
	 *
	 * @return {void}
	 */
	buildHtml()
	{
		let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" type="text/css" href="pixely.css"></head>';
		html += '<body><div class="' + this.className + '"></div></body></html>';

		this.html = html;
	}

	/**
	 * Build CSS styles for the image.
	 *
	 * @return {void}
	 */
	buildCss()
	{
		let css = '';

		// size the element to the image dimensions
		css += '.' + this.className
			+ '{width:' + (this.frames[0].pixelRows[0].length * this.scale) + 'px;'
			+ 'height:' + (this.frames[0].pixelRows.length * this.scale) + 'px;'
			+ 'position:relative;}';

		// pseudo element that will contain our box shadow animation
		css += '.' + this.className + '::after'
			+ '{content:"";width:' + this.scale + 'px;height:' + this.scale + 'px;display:block;left:-' + this.scale + 'px;position:absolute;'
			+ '-webkit-backface-visibility:hidden !important;';

		// if the image is animated, we'll be applying an animation with this name later
		if(this.animated) {
			css += '-webkit-animation:' + this.className + '-frames ' + this.animationDuration + 's step-end infinite;'
			    + 'animation:' + this.className + '-frames ' + this.animationDuration + 's step-end infinite;'
		}

		// give the element a series of box-shadows that emulate the pixels of the image
		css += 'box-shadow:'
		    + this._writeFrameCss(this.frames[0]);

		css = css.slice(0, -1); // remove trailing comma
		css += ';}';

		// if the image is animated, add the rest of the frames as an animation
		if(this.animated) {
			css += '@-webkit-keyframes ' + this.className + '-frames{';

			let animationStep = 100 / this.frames.length;
			for(let frame = 0; frame < this.frames.length; frame++) {
				css += (animationStep * frame) + '%{box-shadow:'
				    + this._writeFrameCss(this.frames[frame]);

				css = css.slice(0, -1); // remove trailing comma
				css += ';}';
			}

			css += '100%{box-shadow:'
			    + this._writeFrameCss(this.frames[0]);

			css = css.slice(0, -1); // remove trailing comma
			css += ';}}';
		}

		this.css = css;
	}

	/**
	 * Export HTML markup to an HTML file.
	 *
	 * @return {void}
	 */
	exportHtml()
	{
		fs.outputFile(this.directory + '/pixely.html', this.html, function(error)
		{
			if(error) {
				console.log(error);
				return;
			}

			return;
		});
	}

	/**
	 * Export CSS files to a CSS file.
	 *
	 * @return {void}
	 */
	exportCss(path)
	{
		fs.outputFile(this.directory + '/pixely.css', this.css, function(error)
		{
			if(error) {
				console.log(error);
				return;
			}

			return;
		});
	}

	/**
	 * Check whether a given variable is a string.
	 *
	 * @param {mixed} var
	 * @return {bool}
	 */
	_isString(varToCheck)
	{
		return (
			(
				(typeof varToCheck != "undefined")
				&& (typeof varToCheck.valueOf() == "string")
			) && (varToCheck.length > 0));
	}

	/**
	 * Convert an ndArray of an animated GIF to a usable array of frames.
	 *
	 * @param {ndArray} ndArray
	 * @return {array}
	 */
	_convertAnimatedImage(ndArray)
	{
		// unpack the ndArray into a usable format
		let frames = ndArrayUnpack(ndArray);

		for(let f = 0; f < frames.length; f++) {
			frames[f] = this._convertFrame(frames[f]);
		}

		return frames;
	}

	/**
	 * Convert an ndArray of an animated GIF to a usable array of frames.
	 *
	 * @param {ndArray} ndArray
	 * @return {array}
	 */
	_convertFrame(frame)
	{
		// transpose the array of pixels since each array represents a column, not a row
		frame = this._transposePixels(frame);

		for(let row = 0; row < frame.length; row++) {
			for(let pixel = 0; pixel < frame[row].length; pixel++) {

				let rgba = [
					frame[row][pixel][0],
					frame[row][pixel][1],
					frame[row][pixel][2],
					frame[row][pixel][3] / 255
				];

				let className = 'p-' + row + '-' + pixel;

				frame[row][pixel] = {
					rgba: rgba,
					className: className
				};
			}
		}

		frame = {
			pixelRows: frame,
			className: 'frame' + (new Date()).getMilliseconds()
		}

		return frame;
	}

	/**
	 * Transpose frame pixels (rotate the image).
	 *
	 * @param {array} frame
	 * @return {array}
	 */
	_transposePixels(frame)
	{
		return frame[0]
			.map((col, i) => frame
				.map(row => row[i])
			);
	}

	/**
	 * Write the box-shadow property for a given frame.
	 *
	 * @param {array} frame
	 * @return {string}
	 */
	_writeFrameCss(frame)
	{
		let css = '';
		for(let row = 0; row < frame.pixelRows.length; row++) {
			for(let pixel = 0; pixel < frame.pixelRows[row].length; pixel++) {
				if(frame.pixelRows[row][pixel].rgba[3] > 0) {
					css += (pixel * this.scale) + 'px ' + (row * this.scale) + 'px rgba('
						+ frame.pixelRows[row][pixel].rgba[0] + ','
						+ frame.pixelRows[row][pixel].rgba[1] + ','
						+ frame.pixelRows[row][pixel].rgba[2] + ','
						+ frame.pixelRows[row][pixel].rgba[3] + '),';
				}
			}
		}
		return css;
	}
}

module.exports.Pixely = Pixely;