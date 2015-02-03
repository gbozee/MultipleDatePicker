var AngularPlugin = require('angular-webpack-plugin');
var BowerWebpackPlugin = require("bower-webpack-plugin");
var path = require('path');
var webpack = require('webpack');
var bowerRooot = __dirname+"bower_components";
module.exports = {
	entry:{
		main: "./main.js",
		vendor:["./bower_components/angular/angular.min.js",
		"./bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js","./libs/multipleDatePicker.js"]
	},
	output:{
		path:__dirname,
		filename:"[name].bundle.js"
	},
	module:{
		loaders:[
			{test: /\.css$/,loader:"style!css"},
			{test:/\.json$/,loader:"json"},
	
		]
	},
	resolve:{
		root:[process.cwd(),path.resolve('bower_components/'),
		],
		// root:[process.cwd())],
		extensions: ['','.js'],
		alias:{
			'ui-bootstrap$': 'angular-bootstrap'
		}
	},
	plugins:[
		// new AngularPlugin(),
		new webpack.optimize.CommonsChunkPlugin("vendor.bundle.js"),
		// new webpack.optimize.DedupePlugin(),
		// new webpack.optimize.UglifyJsPlugin({minimize:true})
	],
	externals:{
		// "angular":"angular"
		"jquery":"jQuery"
	}
}