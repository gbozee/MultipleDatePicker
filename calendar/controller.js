require('./service.js');
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
var moment = require('moment');
var Session = require('./models.js').Session;

function HelloCtrl($scope,CalendarFactory,$modal,$log,$window){
	$scope.booking_type = 'hour';
	$scope.days = [];
	$scope.month= moment().format("MMMM");
	$scope.supports_monthly = true;
	$scope.expected_hours = 16;
	$scope.selectedDays = [];
	$scope.hourlySelectedDays = [];

	var m_names = ["January", "February", "March", "April", "May", 
		"June", "July", "August", "September", "October", "November", "December"];
    var presentMonth= new Date().getMonth();
	$scope.daysOff = CalendarFactory.DaysOff(m_names[presentMonth]);
	$scope.$watch('hourlySelectedDays',function(x,v){
		console.log(x);
		console.log(v);
	},true);

	$scope.bookingType = function(b_type){
		if(b_type === 'month'){
			var bookable_days = CalendarFactory.getWeekDay(m_names[presentMonth]);
			console.log(bookable_days);
			$scope.days = CalendarFactory.weekDaysForMonth(m_names[presentMonth])
			$scope.hourlySelectedDays = [];
		}else{			
			$scope.selectedDays = [];
		}
		CalendarFactory.RefreshBookings();
		$scope.booking_type = b_type;
		$scope.daysOff = CalendarFactory.DaysOff(m_names[presentMonth],b_type);
	}


	function ModalCall(selected_item,callback1,callback2,modal_type){
		var options = {
			'hour':{ctrl:'HourlyModalCtrl',template:'myModalContent.html'},
			'month':{ctrl:'MonthlyModalCtrl',template:'monthlyModal.html'},
		}
		console.log(modal_type);
		var selection = options[modal_type]||options['hour'];
		var modalInstance = CalendarFactory.ScheduleModal(
			selected_item,selection.ctrl,selection.template);
		CalendarFactory.ModallCall(modalInstance,callback1,callback2);		
	}

	 $scope.alerts = [
	    // { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
	    // { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
	  ];

	  function addAlert(msg,alt_type) {
	    $scope.alerts.push({ type: alt_type, msg: msg });
	  };

	  $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

	 function addToSelectedDays(date){
	 	var value = date.valueOf();
	 	console.log(value);
	 	if($scope.booking_type ==='month'){
		 	if($scope.selectedDays.indexOf(value) < 0){
		 		$scope.selectedDays.push(value);
		 	}
		 	console.log($scope.selectedDays);
		 }else{
		 	if($scope.hourlySelectedDays.indexOf(value) < 0){
		 		$scope.hourlySelectedDays.push(value);
		 	}
		 }
	 }
	 function removeFromSelectedDays(date){
	 	var value = date.valueOf();
	 	var m_index =$scope.selectedDays.indexOf(value);
	 	var h_index = $scope.hourlySelectedDays.indexOf(value)
	 	if($scope.booking_type ==='month'){
		 	if(m_index > -1){
		 		$scope.selectedDays.splice(m_index,1);
		 	}
		 }else{
		 	if(h_index > -1){
		 		$scope.hourlySelectedDays.splice(h_index,1);
		 	}
		 }	
	 }
	
	$scope.toggleSelectedDay = function(index){
		var week_day = CalendarFactory.getWeekDay($scope.days[index]);
		var month_selections = CalendarFactory.firstFourDays($scope.month,week_day);
		var pending_sessions = _.map(month_selections,function(x){
			return CalendarFactory.bookings.InitializeSession(x.momentDate);
		});
		console.log(pending_sessions);
		if(month_selections){
 			ModalCall(
				{
					selections:function(){return month_selections;},
					pending_sessions:function(){return pending_sessions}
				},
				function(response){
					console.log(response.sessions);
					angular.forEach(response.sessions,function(s){
						CalendarFactory.bookings.AddBooking(s);
						$scope.$emit("BookingAdded");
						addToSelectedDays(moment(s.date));
					});
					$scope.days.splice(index,1);
				},null,'month');

		}else{
			addAlert("Sorry there are no available days on "+week_day,'danger');
			$scope.days.splice(index,1);
		}
	};

	$scope.dateClick = function(event,date){
		event.preventDefault();
		if(date.selectable){
			
		var selectedDay = CalendarFactory.bookings.InitializeSession(date);
		var isNew = selectedDay.isNew();
		ModalCall(
			{
				selectedDate:function(){return selectedDay;},
				action:function(){return $scope.booking_type;}
			},
			function(ss){			
				console.log(ss.date);
				CalendarFactory.bookings.AddBooking(ss.date);
				$scope.$emit("BookingAdded");
				if(isNew){			
					addToSelectedDays(ss.date.date)
					// date.selected= !date.selected;
				}	
			},function(err){		
				if(err==="cancel" && date.selected){
					CalendarFactory.bookings.RemoveBooking(selectedDay);
					$scope.$emit("BookingRemoved");
					removeFromSelectedDays(selectedDay.date);
				}
			}
		);			
		}
	};
	
	$scope.hoverEvent = function(event,date){
		event.preventDefault();
		if(event.type === 'mouseover'){
				}
	};			

	$scope.logMonthChanged1 = function(newMonth,oldMonth){
		var new_month= newMonth.format("MMMM");
		$scope.daysOff = CalendarFactory.DaysOff(new_month);		
	};
	$scope.logMonthChanged2 = function(newMonth,oldMonth){
		var new_month= newMonth.format("MMMM");
		$scope.month = new_month;
		$scope.days = CalendarFactory.weekDaysForMonth(new_month)
		$scope.daysOff = CalendarFactory.DaysOff(new_month,'month');		
	};
	$scope.selectedDays = [];
	 $scope.items = ['item1', 'item2', 'item3'];  
};

function HourlyModalCtrl($scope,$modalInstance,CalendarFactory,selectedDate,action){
	$scope.range = 2;
	$scope.isMonth= action === "month";
	$scope.dateInstance = CalendarFactory.getDay(selectedDate.date);
	$scope.isNew = selectedDate.isNew();
	$scope.selectedDate = selectedDate;
	$scope.selectedDate.end_time = selectedDate.end_time || 'End time';
	console.log(selectedDate);
	function validate(){
		if(action === 'hour'){
			return $scope.selectedDate.end_time !== "" && $scope.selectedDate.end_time !== null && $scope.selectedDate.end_time !== "undefined" && $scope.selectedDate.end_time !== undefined;	
		}
		return $scope.selectedDate.end_time !== null && $scope.selectedDate.end_time !== "undefined" && $scope.selectedDate.end_time !== undefined && $scope.selectedDate.end_time !== 'End time' && $scope.selectedDate.end_time !== 'Invalid date';
	}
	$scope.invalid = false;
	$scope.ok = function () {
		if(validate()){
	    	$modalInstance.close({date:$scope.selectedDate,isNewDate:selectedDate.isNew()});
		}
		else{
			$scope.invalid = true;
		}
	};

	$scope.getStartHours = function(){
		if(action === 'hour'){
			return $scope.dateInstance.getHours();
		}else{
			return $scope.dateInstance.monthlyStartHours($scope.range);
		}
	}

	$scope.cancel = function (context) {
	    $modalInstance.dismiss(context);
	};
	
	$scope.getEndHours = function(time){
		if(time){
			if(action === 'hour'){
				return $scope.dateInstance.getEndHours(time);			
			}else{
				var end_time = moment($scope.selectedDate.start_time,"ha").hour()+$scope.range;
				$scope.selectedDate.end_time =  moment(end_time,"HH").format("ha");
				return;
			}
		}
		return []
	}
}

function MonthlyModalCtrl($scope,$modalInstance,CalendarFactory,selections,pending_sessions){
	$scope.selections = selections;
	$scope.range = 2;
	$scope.pending_sessions=pending_sessions;
	$scope.getEndHours = function(dt){
		var start_time = dt.start_time;
		var end_time = moment(dt.start_time,"ha").hour()+$scope.range;
		dt.end_time = moment(end_time,"HH").format("ha");
	};

	function validate(){
		var filled = _.filter($scope.pending_sessions,function(x){
			return x.end_time === null || x.end_time === "undefined" || x.end_time === undefined || x.end_time === 'End time' || x.end_time === 'Invalid date';
		});
		console.log(filled);
		return filled.length === 0;
	}
	$scope.invalid = false;
	$scope.ok = function () {
		if(validate()){			
	    	$modalInstance.close({sessions:$scope.pending_sessions});
		}else{			
			$scope.invalid = true;
		}
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};

}


var CalenderController = angular.module('calendar.controller',['calendar.service','ui.bootstrap']);

// var App = angular.module('calendar.controller');
CalenderController.controller('HelloCtrl',	['$scope','CalendarFactory','$modal','$log','$window',HelloCtrl])
	.controller('HourlyModalCtrl',['$scope','$modalInstance','CalendarFactory','selectedDate',
			'action',HourlyModalCtrl])
	.controller('MonthlyModalCtrl',['$scope','$modalInstance','CalendarFactory','selections', 'pending_sessions',
			MonthlyModalCtrl]);
