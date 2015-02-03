var _ = require('lodash');
var moment = require('moment');
var Models = require('./models.js')
var Schedule = Models.Schedule,
	Booking = Models.Booking,
	Session = Models.Session,
	getDaysArray = Models.getDaysArray;

var Services = angular.module('calendar.service',[]);


Services.factory('CalendarFactory',['$rootScope','$modal',function($rootScope,$modal){
	var json = require("./server.json");
	var hourly_calendar = new Schedule(json.monthly,'month');
	var monthly_calendar = new Schedule(json.hourly,'hour');
	var cal__t = {hour:hourly_calendar,month:monthly_calendar};
	var selections = new Booking();


	function getMonth(month_name,cal_type){
		var c_type = cal_type || "hour";
		return cal__t[c_type].getMonth(month_name);		
	}	
	function getAvailableWeekDay(month_name,cal_type){
		var month = getMonth(month_name,cal_type);
		if (month){
			return month.getWorkingDaysOfWeek();
		}
		return [];
	}
	function DaysOff(month,cal_type){
		var existingMonth = getMonth(month,cal_type);
		if(existingMonth){
			return existingMonth.getDaysOff();
		}
		var all_days = getDaysArray(month);
		return _.map(all_days,function(dd){
			return dd.valueOf();
		});
	}
	
	function weekDaysForMonth(month){
		var weekdays = moment.weekdays();
		var weekshort = moment.weekdaysShort();
		var selected = getAvailableWeekDay(month,'month').map(function(wd){
			return weekdays.indexOf(wd);
		});
		return weekshort.filter(function(v,index){
			return selected.indexOf(index) > -1;
		})
	}
	
	function getDay(momentDate){
		var month_instance = monthly_calendar.getMonth(momentDate.format("MMMM"));
		return month_instance.getDayInstance(momentDate);
	}
	// var u = getDay(moment("2015-02-09","YYYY-MM-DD"));
	// console.log(u.getHours());
	// var vv = _.map(u.getHours(),function(xxx){
	// 	return u.getEndHours(xxx);
	// });
	// console.log(vv);
	
	function getFirstFourDays(month_name,weekday_name){
		return monthly_calendar.getFirstFourDays(month_name,weekday_name);
	}
	
	function getModal(resloverFunction){
		return $modal.open({
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      size: 'size',
	      resolve: resloverFunction
	    });
	}

	return{
		response:json,
		getMonth:getMonth,
		getWeekDay:getAvailableWeekDay,
		DaysOff:DaysOff,
		weekDaysForMonth:weekDaysForMonth,
		firstFourDays:getFirstFourDays,
		ScheduleModal:getModal,
		getDay:getDay,
		bookings:selections
	}
}]);