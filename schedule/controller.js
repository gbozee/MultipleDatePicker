require("./service.js");
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
var moment = require('moment');
require('moment-range');

function TutorCalendarCtrl($scope,TutorSchedule){
	$scope.daysOff = TutorSchedule.schedule.GetDaysOff();
	$scope.cancelled = [];
	$scope.action = 'create';
	$scope.news = [];
	$scope.updates = [];
	$scope.date_selected = false;
	$scope.h3 = function(){
		if($scope.selectedDate){			
			return $scope.dateInstance.weekdayString()+" "+ $scope.dateInstance.ShortRepresentation();
		}
	}
	$scope.getStartHours = function(){
		if($scope.selectedDate){	
			return $scope.dateInstance.getHours();	
		}
	}
	$scope.getEndHours = function(time){		
		if(time){
			if($scope.dateInstance){
				return $scope.dateInstance.getEndHours(time);			
			}
		}
		return []
	}

	function validate(){
		if($scope.dateInstance){
			return $scope.dateInstance.isValid($scope.selectedDate.end_time);		

		}
	}
	$scope.new_occurrences = function(){
		return _.reduce($scope.news,function(sum,x){
			return sum+x.reoccur_count;
		},0)
	}

	$scope.ok = function(action){
		if(validate()){
			if(action === 'update') {
				console.log("marked for update");
				$scope.selectedDate.date.updated=true;
				console.log($scope.updates);
				if(getIndex($scope.selectedDate,$scope.updates)<0){
					$scope.updates.push($scope.selectedDate);
				}

				if($scope.selectedDate.date.cancel){
					var index= getIndex($scope.selectedDate,$scope.cancelled);
					$scope.cancelled.splice(index,1);
					$scope.selectedDate.date.cancel=false;
				}
			}
			if(action === 'create'){
				$scope.selectedDate.date.is_new = true;
				if(getIndex($scope.selectedDate,$scope.news)<0){
					if($scope.selectedDate.reoccur){
						var presnt_date = $scope.selectedDate.date.format("DD-MM-YYYY");
						var first_four_months = getDaysforFourMonths($scope.selectedDate.date);
						$scope.selectedDate.date = moment(presnt_date,"DD-MM-YYYY");
						$scope.selectedDate.reoccur_count = first_four_months.length;						
					}
					else{
						$scope.selectedDate.reoccur_count = 1;
					}
					$scope.news.push($scope.selectedDate);	
				}
				console.log("add new date");	
			}
			console.log($scope.news);
			console.log($scope.updates);
			console.log($scope.cancelled);
			$scope.date_selected = false;			
		}
		else{
			$scope.invalid = true;
		}
	}
	
	$scope.subheading = function(){
		return ""
	}
	function check(){
			if($scope.selectedDate.date.updated){
				var index= getIndex($scope.selectedDate,$scope.updates);
				$scope.updates.splice(index,1);
				$scope.selectedDate.date.updated=false;
				console.log("revert to selected from updated");			
			}
			if($scope.selectedDate.date.is_new){;
				var index2 = getIndex($scope.selectedDate,$scope.news)
				$scope.news.splice(index2,1)
				$scope.selectedDate.date.is_new=false;
				console.log("revert to deselected");
			}
	}
	$scope.cancel = function(x){
		if(x==='cancel'){
				console.log("marked for cancel");
				if(getIndex($scope.selectedDate,$scope.cancelled)<0){					
					$scope.cancelled.push($scope.selectedDate);				
				}
				$scope.selectedDate.date.cancel=true;				
				check();
		}else{			
			if($scope.selectedDate.date.cancel ){	
				console.log("revert cancel");
				var index = getIndex($scope.selectedDate,$scope.cancelled);
				$scope.cancelled.splice(index,1);
				$scope.selectedDate.date.cancel = false;
				console.log("revert to selected from cancel");
			}
			check();
			// if($scope.selectedDate.date.updated){
			// 	var index= getIndex($scope.selectedDate.date,$scope.updates);
			// 	$scope.updates.splice(index,1);
			// 	TutorSchedule.schedule.updates.splce(index,1);
			// 	$scope.selectedDate.date.updated=false;
			// 	console.log("revert to selected from updated");			
			// }
			// if($scope.selectedDate.date.is_new){;
			// 	var index2 = getIndex($scope.selectedDate.date,$scope.news)
			// 	$scope.news.splice(index2,1)
			// 	$scope.selectedDate.date.is_new=false;
			// 	console.log("revert to deselected");
			// }
		}
		$scope.date_selected = false;
		console.log($scope.cancelled);
		console.log($scope.updates);
		console.log($scope.news);
	}
	console.log($scope.daysOff);
	function getIndex(day,array){
		return _.findIndex(array,function(x){
			return x.date.isSame(day.date,'day');
		});
	}
	function isUndefined(x){
		return x === "undefined" ||x===undefined;
	}
	function cancelOccurrence(date){		

	}
	function updateOccurrence(date){
	}
	function getDaysforFourMonths(date,format){
		var f = format || 'week'
		var start = date.format("DD-MM-YYYY");
		var end = date.month(4).format("DD-MM-YYYY");
		var start_range = moment(start,"DD-MM-YYYY");
		var end_range = moment(end,"DD-MM-YYYY");
		var range = moment.range(start_range,end_range)
		var result = [];
		range.by(f,function(x){
			result.push(x);
		})
		return result;
	}
	$scope.availableDays = TutorSchedule.schedule.GetAvailableDays();
	$scope.dateClick = function(event,date){
		event.preventDefault();
		if(date.selectable){
			var day_instance;			
			$scope.selectedDate = {date:date}
			if(date.selected){	
				if(date.cancel){
					var index = getIndex($scope.selectedDate,$scope.cancelled);
					if(index>-1){
						$scope.selectedDate = $scope.cancelled[index];
					}
				}
				if(date.updated){
					var index2 = getIndex($scope.selectedDate,$scope.updates);
					if(index2>-1){
						$scope.selectedDate = $scope.updates[index2]
					};
				}
				if(date.is_new){
					var index3 = getIndex($scope.selectedDate,$scope.news);
					if(index3>-1){
						$scope.selectedDate = $scope.news[index3]
					};	
				}
				day_instance = TutorSchedule.schedule.getDayInstance(date);
				$scope.selectedDate.start_time = day_instance.getStartTime();
				$scope.selectedDate.end_time = day_instance.getEndTime();		
			}else{
				day_instance = TutorSchedule.schedule.InitializeDayInstance(date)
			}
			$scope.dateInstance = day_instance;
			$scope.date_selected = true;
			$scope.isNew = day_instance.isNew();
		}
	}
	$scope.hoverEvent = function(event,date){

	}
	$scope.logMonthChanged = function(new_month,oldMonth){

	}
}

var ScheduleCtrl = angular.module('schedule.controller',['schedule.service','ui.bootstrap']);

ScheduleCtrl.controller('TutorCalendarCtrl',['$scope','TutorSchedule',TutorCalendarCtrl])