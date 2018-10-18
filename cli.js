#!/usr/bin/env node

const { Pixely } = require('./Pixely.js');
const { Spinner } = require('cli-spinner');
const program = require('commander');

const spinner = new Spinner('Working... %s');
spinner.setSpinnerString('||//--\\\\');

program.arguments('<image>')
	.option('-f, --folder <folder>', 'The folder to output the HTML and CSS to. [output]')
	.option('-d, --duration <duration>', 'If the image is an animated GIF, how many seconds the animation should take. [1]')
	.option('-s, --scale <scale>', 'The scale at which to generate the image. A whole number is recommended. [1]')
	.action(function (image) {
		spinner.start();
		(new Pixely(image, program.folder, program.duration, program.scale))
			.make()
			.then(() => {
				spinner.stop(true);
				console.log('Done!');
			});
	})
	.parse(process.argv);