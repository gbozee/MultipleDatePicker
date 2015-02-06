require('./service.js');
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
var moment = require('moment');
var Session = require('./models.js').Session;

function HelloCtrl($scope,CalendarFactory,$modal,$log,$window){
	$scope.is_single = true;
	$scope.invalid = false;	
	$scope.date_selected = false;

	function validate(){
		if($scope.is_single){
			if($scope.selectedDate){
				return $scope.selectedDate.isValid($scope.selectedDate.end_time);

			}
		}
		var filled = _.reduce($scope.pending_sessions,function(sum,x){
			return sum && x.isValid(x.end_time);
		},true);
		return filled;			
		
	}
	$scope.validate = validate;
	
	$scope.cancel = function(val){
		if(val === 'cancel'){
			if($scope.is_single){
				CalendarFactory.bookings.RemoveBooking($scope.selectedDate);
				$scope.$emit("BookingRemoved");
				removeFromSelectedDays($scope.selectedDate.date);
			}
		}
		$scope.date_selected = false;
	};
	$scope.getEndHours = function(time){		
		if(time){
			if($scope.booking_type === 'hour'){
				return $scope.dateInstance.getEndHours(time);			
			}else{
				$scope.selectedDate.calculateEndTime($scope.tutor.hours_per_day);
				return;
			}
		}
		return []
	}
	$scope.getStartHours = function(){
		if($scope.dateInstance){			
			if($scope.booking_type === 'hour'){
				return $scope.dateInstance.getHours();
			}else{
				return $scope.dateInstance.getHours($scope.tutor.hours_per_day);
			}	
		}
		return [];
	}

	$scope.ok = function(){
		if(validate()){			
			if($scope.is_single){
				CalendarFactory.bookings.AddBooking($scope.selectedDate);
				$scope.$emit("BookingAdded");
				if($scope.isNew){			
					addToSelectedDays($scope.selectedDate.date)
				}
			}else{			
				angular.forEach($scope.pending_sessions,function(s){
					CalendarFactory.bookings.AddBooking(s);
					$scope.$emit("BookingAdded");
					addToSelectedDays(moment(s.date));
				});			
			}
			$scope.date_selected = false;
			$scope.invalid = false;
		}
		$scope.invalid=true;
	}
	$scope.h3 = function(){
		if ($scope.is_single){
			if($scope.selectedDate){
				return $scope.selectedDate.weekdayString()+" "+ $scope.selectedDate.ShortRepresentation();

			}
		}
		else{
			if($scope.pending_sessions){						
				var count = $scope.pending_sessions.length;
				return "We found "+count+" available "+ $scope.week_day+"s";		
			}
		}
		return ""
	}
	$scope.subheading = function(){
		if($scope.is_single){
			return "Set preferred start time and end time";
		}
		var hr = $scope.tutor.hours_per_day;
		var s = hr>1 ? "s" : "";
		return "Each session has a duration of "+hr+"hr"+s+".";
	}
	$scope.submit_text = function(){
		if($scope.is_single){
			return "Schedule Session";
		}
		return "Schedule Sessions";
	}
	$scope.error_message= "You must populate all days with start times."
	$scope.tutor = CalendarFactory.tutor;
	$scope.booking_type = 'hour';
	$scope.days = [];
	$scope.month= moment().format("MMMM");
	$scope.selectedDays = [];
	$scope.hourlySelectedDays = [];
	$scope.requiredcount = 16;
	$scope.booking = CalendarFactory.bookings;

	var m_names = ["January", "February", "March", "April", "May", 
	"June", "July", "August", "September", "October", "November", "December"];
	var presentMonth= new Date().getMonth();
	$scope.daysOff = CalendarFactory.DaysOff(m_names[presentMonth]);
	$scope.$watch('hourlySelectedDays',function(x,v){
		console.log(x);
		console.log(v);
	},true);

	$scope.canSubmit = function (){
		if ($scope.booking_type === 'month'){
			return $scope.booking.TotalBookedHours() >= $scope.tutor.expected_hours;
		}
		return $scope.booking.TotalBookedHours() > 0;
	}
	$scope.bookingType = function(b_type){
		if(b_type === 'month'){
			var bookable_days = CalendarFactory.getWeekDay(m_names[presentMonth]);
			console.log(bookable_days);
			$scope.days = CalendarFactory.weekDaysForMonth(m_names[presentMonth])
			$scope.hourlySelectedDays = [];
		}else{			
			$scope.selectedDays = [];
		} 
		$scope.can_not_submit = false;
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

	$scope.alerts = [ ];

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
			$scope.is_single = false;
			$scope.date_selected = true;
			$scope.isNew = true;
			$scope.pending_sessions = pending_sessions;
			$scope.selections = month_selections;
			$scope.week_day = week_day;
			$scope.days.splice(index,1);
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
			$scope.isNew = isNew;
			$scope.selectedDate = selectedDay;
			$scope.selectedDate.end_time = selectedDay.end_time || 'End time';
			$scope.is_single = true;
			$scope.date_selected=true;
			$scope.dateInstance = CalendarFactory.getDay(selectedDay.date);

		}
	};
	$scope.remaining_hrs = function(){
		if($scope.booking_type === 'hour'){
			return "C'mon! Book at least 1 hour with your tutor!";
		}
		var tb = $scope.booking.TotalBookedHours();
		if(tb < 1){
			return "C'mon! You are required to select at least "+$scope.tutor.expected_hours+"hrs";
		}
		var remaining = $scope.tutor.expected_hours-tb;
		return "You selected "+tb+"hrs. "+remaining+"hrs left";

	}
	$scope.can_not_submit=false;
	$scope.submitBooking = function(){
		if($scope.canSubmit()){
		}else{
			$scope.can_not_submit = true
		}
	}

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

}
var CalenderController = angular.module('calendar.controller',['calendar.service','ui.bootstrap']);

// var App = angular.module('calendar.controller');
CalenderController.controller('HelloCtrl',	['$scope','CalendarFactory','$modal','$log','$window',HelloCtrl]);