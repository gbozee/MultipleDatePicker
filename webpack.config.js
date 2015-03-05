// var AngularPlugin = require('angular-webpack-plugin');
// var BowerWebpackPlugin = require("bower-webpack-plugin");
// var path = require('path');
// var webpack = require('webpack');
// var bowerRooot = __dirname+"bower_components";
// module.exports = {
// 	entry:{
// 		main: "./calendar/main.js",
// 		vendor:["./bower_components/angular/angular.min.js","angular-bootstrap/ui-bootstrap-tpls.min.js","lodash","moment",]
// 	},
// 	output:{
// 		path:__dirname,
// 		filename:"[name].bundle.js"
// 	},
// 	module:{
// 		loaders:[
// 			{test: /\.css$/,loader:"style!css"},
// 			{test:/\.json$/,loader:"json"},
	
// 		]
// 	},
// 	resolve:{
// 		root:[process.cwd(),path.resolve('bower_components/'),
// 		],
// 		// root:[process.cwd())],
// 		extensions: ['','.js'],
// 		alias:{
// 			'ui-bootstrap$': 'angular-bootstrap'
// 		}
// 	},
// 	plugins:[
// 		// new AngularPlugin(),
// 		new webpack.optimize.CommonsChunkPlugin('vendor',"vendor.bundle.js"),
// 		// new webpack.optimize.DedupePlugin(),
// 		// new webpack.optimize.UglifyJsPlugin({minimize:true})
// 	],
// 	externals:{
// 		"angular":"angular",
// 		"jquery":"jQuery"
// 	}
// }

var AngularPlugin = require('angular-webpack-plugin');
var BowerWebpackPlugin = require("bower-webpack-plugin");
var commonResourcePlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
var path = require('path');
var webpack = require('webpack');
var tuteria = './';
var src_dir = './js_src/';
var skill_static = tuteria;
var bowerRooot = __dirname + "/bower_components";
module.exports = {
    entry: {
        tutor_skill_profile: src_dir + "tutor_skill_calendar.js",
        vendor: ['moment', 'lodash','angular-bootstrap/ui-bootstrap-tpls.min.js']
        //bowerRooot + "/angular/angular.min.js",
    },
    output: {
        path: __dirname,
        filename: skill_static + "[name].bundle.js"
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: "style!css"},
            {test: /\.json$/, loader: "json"},

        ]
    },
    resolve: {
        root: [process.cwd(), path.resolve('bower_components/'),
        ],
        // root:[process.cwd())],
        extensions: ['', '.js'],
        alias: {
            'ui-bootstrap$': 'angular-bootstrap'
        }
    },
    plugins: [
        // new AngularPlugin(),
        new commonResourcePlugin("vendor", skill_static + "vendor.bundle.js", Infinity),
        // new webpack.optimize.DedupePlugin(),
        // new webpack.optimize.UglifyJsPlugin({minimize:true})
    ],
    externals: {
        "angular": "angular",
        "jquery": "jQuery"
    }
}