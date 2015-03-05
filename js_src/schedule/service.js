var Models =require('./models.js'),
	Schedule = Models.TutorSchedule;

var Services = angular.module('schedule.service',[]);

Services.factory('TutorSchedule',[function(){
	var json = require('./../calendar/server.json')
	var tutor_schedule = new Schedule(json);
	console.log(tutor_schedule);
	return {
		schedule:tutor_schedule
	}
}])

