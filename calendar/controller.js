require('./service.js');
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
var moment = require('moment');
var Session = require('./models.js').Session;

function HelloCtrl($scope,CalendarFactory,$modal,$log,$window){
	$scope.booking_type = 'hourly';
	$scope.days = [];
	$scope.supports_monthly = true;

	var m_names = ["January", "February", "March", "April", "May", 
		"June", "July", "August", "September", "October", "November", "December"];
    var presentMonth= new Date().getMonth();
	$scope.daysOff = CalendarFactory.DaysOff(m_names[presentMonth]);
	$scope.bookingType = function(b_type){
		if(b_type === 'month'){
			var bookable_days = CalendarFactory.getWeekDay(m_names[presentMonth]);
			console.log(bookable_days);
			$scope.days = CalendarFactory.weekDaysForMonth(m_names[presentMonth])
		}
		$scope.booking_type = b_type;
		$scope.daysOff = CalendarFactory.DaysOff(m_names[presentMonth],b_type);
	}

	function modalInstanceCall(selected_item,callback1,callback2){
		var successCallback = callback1 || function(){};
		var errorCallback = function (err) {
	      $log.info('Modal dismissed at: ' + new Date());
	      var tt = callback2 || function(){};
	      // if(err==="backdrop click"){
	      	tt(err);	
	    };
		var modalInstance = CalendarFactory.ScheduleModal(selected_item);
		modalInstance.result.then(successCallback,errorCallback);
	}
	
	$scope.toggleSelectedDay = function(index){

		modalInstanceCall(
			{
				items:function(){return $scope.items;},
				action:function(){return 'populate';}
			},
			function(selectedItem){
				$scope.selected = selectedItem;      
				$scope.days.splice(index,1);
			});
	};

	$scope.logInfos = function(event,date){
		event.preventDefault();
		console.log(date);
		var selectedDay = CalendarFactory.bookings.InitializeSession(date);
		console.log(selectedDay);
		modalInstanceCall(
			{
				selectedDate:function(){return selectedDay;},
				action:function(){return 'toggle';}
			},
			function(ss){				
				CalendarFactory.bookings.AddBooking(ss.date);
				if(ss.isNewDate){			
					date.selected= !date.selected;
				}	
			},function(err){		
				if(err==="cancel" && date.selected){
					CalendarFactory.bookings.RemoveBooking(selectedDay);
					date.selected= !date.selected;
				}
			}
		);
	};
	$scope.hoverEvent = function(event,date){
		event.preventDefault();
		if(event.type === 'mouseover'){
				}
	};			
	$scope.$watch('selectedDays',function(e,v){
		console.log(e);
		console.log(v);
	},true);

	$scope.logMonthChanged = function(newMonth,oldMonth){
		var new_month= newMonth.format("MMMM");
		console.log(new_month);
		$scope.daysOff = CalendarFactory.DaysOff(new_month);		
		console.log($scope.daysOff);
	};
	$scope.selectedDays = [];
	 $scope.items = ['item1', 'item2', 'item3'];  
};

function ModalInstanceCtrl($scope,$modalInstance,CalendarFactory,selectedDate,action){
	$scope.dateInstance = CalendarFactory.getDay(selectedDate.date);
	$scope.selectedDate = selectedDate;
	$scope.ok = function () {
	    $modalInstance.close({date:$scope.selectedDate,isNewDate:selectedDate.isNew()});
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
}


var CalenderController = angular.module('calendar.controller',['calendar.service','ui.bootstrap']);

// var App = angular.module('calendar.controller');
CalenderController.controller('HelloCtrl',	['$scope','CalendarFactory','$modal','$log','$window',HelloCtrl])
	.controller('ModalInstanceCtrl',['$scope','$modalInstance','CalendarFactory','selectedDate',
			'action',ModalInstanceCtrl]);
