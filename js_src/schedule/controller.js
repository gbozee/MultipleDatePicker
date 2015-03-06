require("./service.js");
var Day = require('./models.js').Day
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
var moment = require('moment');
var _= require('lodash');
require('moment-range');

function TutorCalendarCtrl($scope,$timeout,TutorSchedule){
	$scope.current_scheduled_dates = TutorSchedule.schedule.CurrentlyBookedDates();
	function valueDate(){
		return _.map(this.allDates(),function(x){
			return x.valueOf();
		});
	}
	function mDates(){
		return _.map(this,function(x){
			return x.date;
		})
	}
	$scope.cancelled = [];
	_.extend($scope.cancelled,{status:'cancelled',allDates:mDates,valueDates:valueDate})
	$scope.action = 'create';
	$scope.news = [];
	function getDaysWithCount(date,count){
		var result = []
		for(var i=0;i<count;i++){
			var temp= date.clone();
			result.push(temp.add(7*i,'days'))
		}
		return result;
	}
	_.extend($scope.news,{status:'new',valueDates:valueDate,allDates:function(){
		var completeDays = [];
		for (var i = 0, len = this.length; i < len; i++) {
			var dd = getDaysWithCount(this[i].date.clone(),this[i].reoccur_count);
			completeDays = completeDays.concat(dd);
		}
		return completeDays;
	}})
	$scope.updates = [];
	_.extend($scope.updates,{status:'updated',allDates:mDates,valueDates:valueDate})
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
				updateNewDates();
				$scope.ds.generate();
				TutorSchedule.schedule.SyncNewDays($scope.news);
			}
			console.log($scope.news);
			console.log($scope.updates);
			console.log($scope.cancelled);

			console.log($scope.news.allDates());
			$scope.date_selected = false;			
			
		}
		else{
			$scope.invalid = true;
		}
	}
	$scope.hasBeenSelected=function(md){
		var md_string= md.format("DD-MM-YYYY");
		var selectedDays = $scope.news.map(function(x){
			return x.date;
		});
		console.log(selectedDays);
		return _.findIndex(selectedDays,function(x){
			var x_string = x.format("DD-MM-YYYY");
			return x_string === md_string; 
		});
	}
	$scope.updateCalendar= function(){
		console.log(moment(this.news[0]));
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
		}

		updateNewDates();						
		$scope.ds.generate();
		TutorSchedule.schedule.SyncNewDays($scope.news);
		$scope.date_selected = false;
		console.log($scope.cancelled);
		console.log($scope.updates);
		console.log($scope.news);
		console.log($scope.news.allDates());

	}
	console.log($scope.current_scheduled_dates);
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
		var start = date;
		var end = date.clone().add(4,'month');
		var range = moment.range(start,end)
		var result = [];
		range.by(f,function(x){
			result.push(x);
		})
		return result;
	}
	$scope.availableDays = TutorSchedule.schedule.GetAvailableDays();
	$scope.noneAvailableDays= TutorSchedule.schedule.CurrentlyBookedDates();
	$scope.ds= {};

	console.log("NonAVailable");
	console.log($scope.noneAvailableDays);

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
				console.log(day_instance);
				if(day_instance){						
					$scope.selectedDate.start_time = day_instance.getStartTime();
					$scope.selectedDate.end_time = day_instance.getEndTime();					

					$scope.date_selected = true;
				}else{					
					
				}
			}else{	
				// var index4 = _.findIndex($scope.news,function(x){
				// 	return x.date.format("DD-MM-YYYY") == date.format("DD-MM-YYYY")
				// })
				// console.log(index4);
				// if(index4 > -1){
				// 	var val= $scope.news[index4];
				// 	_.extend(val,{is_new:true});
				// 	day_instance = new Day(val);

				// 	$scope.date_selected = true;
				// }	
				// else{

				// 	$scope.date_selected = false;
				// }	
				day_instance = TutorSchedule.schedule.InitializeDayInstance(date)	

				console.log(day_instance);		
				$scope.selectedDate = day_instance;
				$scope.date_selected = true;				
				date.is_new=true;
			}
			if(day_instance){				
				$scope.dateInstance = day_instance;
				$scope.isNew = day_instance.isNew();
				console.log($scope.dateInstance);	
			}
			

		}
	}
	$scope.hoverEvent = function(event,date){
	}

	function updateNewDates(){
		$scope.ds.newDays = $scope.news.allDates();
		$scope.ds.cancelledDays = $scope.cancelled.allDates();
		$scope.ds.updatedDays = $scope.updates.allDates();
	}
	
	$scope.logMonthChanged = function(new_month,oldMonth){
		updateNewDates();
		$scope.ds.generate();		
	}
	$scope.$watch('ds',function(x){
		console.log(x.convertedDaysSelected);
		console.log(x.daysOff);
	});

}

var ScheduleCtrl = angular.module('schedule.controller',['schedule.service','ui.bootstrap']);

ScheduleCtrl.controller('TutorCalendarCtrl',['$scope','$timeout','TutorSchedule',TutorCalendarCtrl])