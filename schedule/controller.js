require("./service.js");
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
var moment = require('moment');

function TutorCalendarCtrl($scope,TutorSchedule){
	$scope.daysOff = TutorSchedule.schedule.GetDaysOff();
	$scope.cancelled = [];
	$scope.news = [];
	$scope.updates = [];
	console.log($scope.daysOff);
	function getIndex(day,array){
		return _.findIndex(array,function(x){
			return x.isSame(day,'day');
		});
	}
	function isUndefined(x){
		return x === "undefined" ||x===undefined;
	}
	function cancelOccurrence(date){

	}
	function updateOccurrence(date){
		
	}
	$scope.availableDays = TutorSchedule.schedule.GetAvailableDays();
	$scope.dateClick = function(event,date){
		event.preventDefault();
		if(date.selected){			
			if(date.cancel ){	
				var index = getIndex(date,$scope.cancelled);
				$scope.cancelled.splice(index,1);
				date.cancel = false;
				console.log("revert to selected from cancel");
			}
			else if(date.updated){
				var index= getIndex(date,$scope.updates);
				$scope.updates.splice(index,1);
				date.updated=false;
				console.log("revert to selected from updated");
			}else{
				console.log("marked for cancel");
				//cancel or update
				$scope.cancelled.push(date);			
				date.cancel=true;

		}
	}else{
		if(date.is_new){;
			var index2 = getIndex(date,$scope.news)
			$scope.news.splice(index2,1)
			date.is_new=false;
			console.log("revert to deselected");
		}else{
			date.is_new = true;
			$scope.news.push(date);
			console.log("add new date");	
		}

	}

}
$scope.hoverEvent = function(event,date){

}
$scope.logMonthChanged = function(new_month,oldMonth){

}
}

var ScheduleCtrl = angular.module('schedule.controller',['schedule.service','ui.bootstrap']);

ScheduleCtrl.controller('TutorCalendarCtrl',['$scope','TutorSchedule',TutorCalendarCtrl])