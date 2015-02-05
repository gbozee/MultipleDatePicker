require('./calendar/controller.js');
require('./calendar/filter.js');
require('./schedule/controller.js');
var multipleDatePicker = require('./libs/multipleDatePicker.js')
var myApp = angular.module('myApp', ['calendar.controller','multipleDatePicker','calendar.filters',
	'schedule.controller'
	]);

