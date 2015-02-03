var _ = require('lodash');
var moment = require('moment');
var Models = require('./models.js')
var Schedule = Models.Schedule,
	Booking = Models.Booking,
	Session = Models.Session,
	getDaysArray = Models.getDaysArray;

var Services = angular.module('calendar.service',[]);


Services.factory('CalendarFactory',['$rootScope','$modal','$log',function($rootScope,$modal,$log){
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
			return existingMonth.getDaysOff(cal_type);
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
	function getWeekDay(val){
		var weekdays= moment.weekdaysShort();
		var indexx = weekdays.indexOf(val);
		return moment.weekdays()[indexx];
	}
	
	function getDay(momentDate){
		var month_instance = monthly_calendar.getMonth(momentDate.format("MMMM"));
		return month_instance.getDayInstance(momentDate);
	}
	
	function getFirstFourDays(month_name,weekday_name){
		return monthly_calendar.getFirstFourDays(month_name,weekday_name);
	}
	
	function getModal(resloverFunction,modalCtrl,modalTemplate){
		return $modal.open({
	      templateUrl: modalTemplate,
	      controller: modalCtrl,
	      size: 'size',
	      resolve: resloverFunction
	    });
	}
	$rootScope.$on('BookingAdded',function(event,data){
		console.log(selections.sessions);
	});
	$rootScope.$on('BookingRemoved',function(event,data){
		console.log(selections.sessions);
	})
	function RefreshBookings(){
		selections.sessions = [];
	}
 	function ModallCall(modalInstance,callback1,callback2){
		var successCallback = callback1 || function(){};
		var errorCallback = function (err) {
	      $log.info('Modal dismissed at: ' + new Date());
	      var tt = callback2 || function(){};
	      // if(err==="backdrop click"){
	      	tt(err);	
	    };		
		modalInstance.result.then(successCallback,errorCallback);
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
		bookings:selections,
		ModallCall:ModallCall,
		getWeekDay:getWeekDay,
		RefreshBookings:RefreshBookings,
	}
}]);