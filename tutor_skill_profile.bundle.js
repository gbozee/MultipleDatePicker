webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var angular = __webpack_require__(3);
	var app = __webpack_require__(4);

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = angular;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	var multipleDatePicker = __webpack_require__(8);
	var myApp = angular.module('myApp', ['calendar.controller','multipleDatePicker','calendar.filters',
		'schedule.controller']);



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
	__webpack_require__(1)
	var moment = __webpack_require__(10);
	var Session = __webpack_require__(12).Session;

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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	function isUndefined(no){
	  return no === "undefined" || no === undefined;
	}
	function isObject(A){
	 return (typeof A === "object") && (A !== null);
	}

	function currencyFilter($locale) {
	  var formats = $locale.NUMBER_FORMATS;
	  return function(amount, currencySymbol, fractionSize) {
	    if (isUndefined(currencySymbol)) {
	      currencySymbol = formats.CURRENCY_SYM;
	    }

	    if (isUndefined(fractionSize)) {
	      // TODO: read the default value from the locale file
	      fractionSize = 2;
	    }

	    // if null or undefined pass it through
	    return (amount == null)
	        ? amount
	        : formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize).
	            replace(/\u00A4/g, currencySymbol);
	  };
	}

	var DECIMAL_SEP = '.';
	function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
	  if (!isFinite(number) || isObject(number)) return '';

	  var isNegative = number < 0;
	  number = Math.abs(number);
	  var numStr = number + '',
	      formatedText = '',
	      parts = [];

	  var hasExponent = false;
	  if (numStr.indexOf('e') !== -1) {
	    var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
	    if (match && match[2] == '-' && match[3] > fractionSize + 1) {
	      numStr = '0';
	      number = 0;
	    } else {
	      formatedText = numStr;
	      hasExponent = true;
	    }
	  }

	  if (!hasExponent) {
	    var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

	    // determine fractionSize if it is not specified
	    if (isUndefined(fractionSize)) {
	      fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
	    }

	    // safely round numbers in JS without hitting imprecisions of floating-point arithmetics
	    // inspired by:
	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
	    number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

	    if (number === 0) {
	      isNegative = false;
	    }

	    var fraction = ('' + number).split(DECIMAL_SEP);
	    var whole = fraction[0];
	    fraction = fraction[1] || '';

	    var i, pos = 0,
	        lgroup = pattern.lgSize,
	        group = pattern.gSize;

	    if (whole.length >= (lgroup + group)) {
	      pos = whole.length - lgroup;
	      for (i = 0; i < pos; i++) {
	        if ((pos - i) % group === 0 && i !== 0) {
	          formatedText += groupSep;
	        }
	        formatedText += whole.charAt(i);
	      }
	    }

	    for (i = pos; i < whole.length; i++) {
	      if ((whole.length - i) % lgroup === 0 && i !== 0) {
	        formatedText += groupSep;
	      }
	      formatedText += whole.charAt(i);
	    }

	    // format fraction part.
	    while (fraction.length < fractionSize) {
	      fraction += '0';
	    }

	    if (fractionSize && fractionSize !== "0") formatedText += decimalSep + fraction.substr(0, fractionSize);
	  } else {

	    if (fractionSize > 0 && number > -1 && number < 1) {
	      formatedText = number.toFixed(fractionSize);
	    }
	  }

	  parts.push(isNegative ? pattern.negPre : pattern.posPre);
	  parts.push(formatedText);
	  parts.push(isNegative ? pattern.negSuf : pattern.posSuf);
	  return parts.join('');
	}
	angular.module('calendar.filters',[]).filter('specialCurrency',['$locale',currencyFilter]);

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(9);
	var Day = __webpack_require__(13).Day
	__webpack_require__(1)
	var moment = __webpack_require__(10);
	var _= __webpack_require__(2);
	__webpack_require__(15);

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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
	  Creator: Maelig GOHIN For ARCA-Computing - www.arca-computing.fr
	  Date: July 2014
	  Version: 1.1.5

	  Description:  MultipleDatePicker is an Angular directive to show a simple calendar allowing user to select multiple dates.
	          A callback is called everytime a de/selection is done.
	          Css style can be changed by editing less or css stylesheet.
	          See scope declaration below for options you can pass through html directive.
	          Feel free to edit and share this piece of code, our idea is to keep simple ;)
	 */
	var moment = __webpack_require__(10);
	angular.module('multipleDatePicker', [])
	  .directive('multipleDatePicker', ['$log', function($log){
	  "use strict";
	  return {
	    restrict: 'AE',
	    scope: {
	      /*
	      * Type: function(timestamp, boolean)
	      * Will be called when un/select a date
	      * Param timestamp will be the date at midnight
	      * */
	      directiveScope:'=',
	      callback: '&',
	      dayClick: '=?',
	      dayHover: '=?',
	      /*
	      * Type: function(newMonth, oldMonth)
	      * Will be called when month changed
	      * Param newMonth/oldMonth will be the first day of month at midnight
	      * */
	      monthChanged: '=?',
	      /*
	      * Type: array of milliseconds timestamps
	      * Days already selected
	      * */
	      daysSelected: '=?',
	      /*
	      * Type: array of integers
	      * Recurrent week days not selectables
	      * /!\ Sunday = 0, Monday = 1 ... Saturday = 6
	      * */
	      weekDaysOff: '=?',
	      /*
	      * Type: array of milliseconds timestamps
	      * Days not selectables
	      * */
	      daysOff: '=?',
	      /*
	      * Type: boolean
	      * Set all days off
	      * */
	      allDaysOff: '=?',
	      /*
	      * Type: boolean
	      * Sunday be the first day of week, default will be Monday
	      * */
	      sundayFirstDay: '=?',
	      /*
	       * Type: boolean
	       * if true can't go back in months before today's month
	       * */
	      disallowBackPastMonths: '=',
	      /*
	       * Type: boolean
	       * if true can't go in futur months after today's month
	       * */
	      disallowGoFuturMonths: '='
	    },
	    template: '<div class="multiple-date-picker">'+
	            '<div class="picker-top-row">'+
	              '<div class="text-center picker-navigate picker-navigate-left-arrow" ng-class="{\'disabled\':disableBackButton}" ng-click="previousMonth()"><i class="glyphicon glyphicon-chevron-left"></i></div>'+
	              '<div class="text-center picker-month">{{month.format(\'MMMM YYYY\')}}</div>'+
	              '<div class="text-center picker-navigate picker-navigate-right-arrow" ng-class="{\'disabled\':disableNextButton}" ng-click="nextMonth()"><i class="glyphicon glyphicon-chevron-right"></i></div>'+
	            '</div>'+
	            '<div class="picker-days-week-row">'+
	              '<div class="text-center" ng-repeat="day in daysOfWeek">{{day}}</div>'+
	            '</div>'+
	            '<div class="picker-days-row">'+
	              '<div class="text-center picker-day picker-empty" ng-repeat="x in emptyFirstDays">&nbsp;</div>'+
	              '<div class="text-center picker-day" ng-repeat="day in days" ng-click="toggleDay($event, day)" ng-mouseover="hoverDay($event, day)" ng-mouseleave="dayHover($event, day)" ng-class="{\'picker-selected\':day.selected,\'picker-cancel\':day.cancel,\'picker-update\':day.updated,\'picker-new\':day.is_new, \'picker-off\':!day.selectable, \'today\':day.today}">{{day ? day.format(\'D\') : \'\'}}</div>'+
	              '<div class="text-center picker-day picker-empty" ng-repeat="x in emptyLastDays">&nbsp;</div>'+
	            '</div>'+
	          '</div>',
	    // templateUrl:"/templates/mdp.html",
	    link: function(scope){

	      /*utility functions*/
	      var checkNavigationButtons = function(){
	        var today = moment(),
	          previousMonth = moment(scope.month).subtract(1, 'month'),
	          nextMonth = moment(scope.month).add(1, 'month');
	        scope.disableBackButton = scope.disallowBackPastMonths && today.isAfter(previousMonth, 'month');
	        scope.disableNextButton= scope.disallowGoFuturMonths && today.isBefore(nextMonth, 'month');
	      },
	      getDaysOfWeek = function(){
	        /*To display days of week names in moment.lang*/
	        var momentDaysOfWeek = moment().localeData()._weekdaysMin,
	          days = [];
	        
	        for(var i = 1; i < 7; i++){
	          days.push(momentDaysOfWeek[i]);
	        }

	        if(scope.sundayFirstDay){
	          days.splice(0, 0, momentDaysOfWeek[0]);
	        }else{
	          days.push(momentDaysOfWeek[0]);
	        }
	        
	        return days;
	      };

	      /*scope functions*/
	      scope.$watch('daysSelected', function(newValue) {
	        if(newValue){
	          var momentDates = [];
	          newValue.map(function(timestamp){
	            momentDates.push(moment(timestamp));
	          });
	          scope.convertedDaysSelected = momentDates;
	          scope.generate();
	        }
	      }, true);

	      scope.$watch('weekDaysOff', function() {
	        scope.generate();
	      }, true);


	      scope.$watch('daysOff', function() {
	        scope.generate();
	      }, true);

	      scope.$watch('allDaysOff', function() {
	        scope.generate();
	      }, true);

	      //default values      
	      scope.directiveScope= scope;
	      scope.month = scope.month || moment().startOf('day');
	      scope.days = [];
	      scope.convertedDaysSelected = scope.convertedDaysSelected || [];
	      scope.weekDaysOff = scope.weekDaysOff || [];
	      scope.daysOff = scope.daysOff || [];
	      scope.disableBackButton = false;
	      scope.disableNextButton = false;      
	      scope.daysOfWeek = getDaysOfWeek();
	      scope.newDays = scope.newDays || [];
	      scope.cancelledDays = scope.cancelledDays || [];
	      scope.updatedDays = scope.updatedDays || [];

	      /**
	       * Called when user clicks a date
	       * @param Event event the click event
	       * @param Moment momentDate a moment object extended with selected and isSelectable booleans 
	       * @see #momentDate
	       * @callback dayClick
	       * @callback callback deprecated
	       */
	      scope.toggleDay = function(event, momentDate){
	        event.preventDefault();

	        var prevented = false;

	        event.preventDefault = function() {
	          prevented = true;
	        };

	        if(typeof scope.dayClick == 'function') {
	          scope.dayClick(event, momentDate);
	        }

	        if(momentDate.selectable && !prevented){
	          momentDate.selected = !momentDate.selected;

	          if(momentDate.selected) {
	            scope.convertedDaysSelected.push(momentDate);
	          } else {
	            scope.convertedDaysSelected.filter(function(date) {
	              return date.valueOf() === momentDate.valueOf();
	            });
	          }

	          if(typeof(scope.callback) === "function"){
	            $log.warn('callback option deprecated, please use dayClick');
	            scope.callback({timestamp:momentDate.valueOf(), selected:momentDate.selected});
	          }
	        }
	      };

	      /**
	       * Hover day
	       * @param Event event
	       * @param Moment day
	       */
	      scope.hoverDay = function(event, day) {
	        event.preventDefault();
	        var prevented = false;

	        event.preventDefault = function() {
	          prevented = true ;
	        };

	        if(typeof scope.dayHover == 'function') {
	          scope.dayHover(event, day);
	        }

	        if(!prevented) {
	          day.hover = event.type === 'mouseover' ? true : false;
	        }
	      };

	      /*Navigate to previous month*/
	      scope.previousMonth = function(){
	        if(!scope.disableBackButton){
	          var oldMonth = moment(scope.month);
	          scope.month = scope.month.subtract(1, 'month');
	          if(typeof scope.monthChanged == 'function') {
	            scope.monthChanged(scope.month, oldMonth);
	          }
	          scope.generate();
	        }
	      };

	      /*Navigate to next month*/
	      scope.nextMonth = function(){
	        if(!scope.disableNextButton){
	          var oldMonth = moment(scope.month);
	          scope.month = scope.month.add(1, 'month');
	          if(typeof scope.monthChanged == 'function') {
	            scope.monthChanged(scope.month, oldMonth);
	          }
	          scope.generate();
	        }
	      };

	      /*Check if the date is off : unselectable*/
	      scope.isDayOff = function(scope, date){
	        return scope.allDaysOff ||
	          (angular.isArray(scope.weekDaysOff) && scope.weekDaysOff.some(function(dayOff){
	            return date.day() === dayOff;
	          })) || 
	          (angular.isArray(scope.daysOff) && scope.daysOff.some(function(dayOff){
	            return date.isSame(dayOff, 'day');
	          }));
	      };

	      /*Check if the date is selected*/
	      scope.isSelected = function(scope, date){
	        return scope.convertedDaysSelected.some(function(d){
	          return date.isSame(d, 'day');
	        });
	      };

	      scope.isNew = function(scope,date){
	       return scope.newDays.some(function(d){
	         return date.isSame(d,'day');
	       });

	      }
	      scope.isCancelled = function(scope,date){
	        return scope.cancelledDays.some(function(d){
	          return date.isSame(d,'day');
	        }) 
	      }
	      scope.isUpdated = function(scope,date){
	        return scope.updatedDays.some(function(d){
	          return date.isSame(d,'day');
	        }) 
	      }

	      /*Generate the calendar*/
	      scope.generate = function(){
	        var previousDay = moment(scope.month).date(0),
	          firstDayOfMonth = moment(scope.month).date(1),
	          days = [],
	          now = moment(),
	          lastDayOfMonth = moment(firstDayOfMonth).endOf('month'),
	          maxDays = lastDayOfMonth.date();

	        scope.emptyFirstDays = [];

	        var emptyFirstDaysStartIndex;
	        if(firstDayOfMonth.day() === 0){
	          emptyFirstDaysStartIndex = scope.sundayFirstDay ? 0 : 6;
	        }else{
	          emptyFirstDaysStartIndex = firstDayOfMonth.day() - (scope.sundayFirstDay ? 0 : 1);
	        }
	        for (var i = emptyFirstDaysStartIndex; i > 0; i--) {
	          scope.emptyFirstDays.push({});
	        }

	        for (var j = 0; j < maxDays; j++) {
	          var date = moment(previousDay.add(1, 'days'));
	          date.selectable = !scope.isDayOff(scope, date);
	          date.selected = scope.isSelected(scope, date);
	          date.is_new= scope.isNew(scope,date);
	          date.cancel = scope.isCancelled(scope,date);
	          date.updated= scope.isUpdated(scope,date);
	          date.today = date.isSame(now, 'day');
	          days.push(date);
	        }

	        scope.emptyLastDays = [];
	        var emptyLastDaysStartIndex = scope.sundayFirstDay ? 6 : 7;
	        if(lastDayOfMonth.day() === 0 && !scope.sundayFirstDay){
	          emptyLastDaysStartIndex = 0;
	        }else{
	          emptyLastDaysStartIndex -= lastDayOfMonth.day();          
	        }
	        for (var k = emptyLastDaysStartIndex; k > 0; k--) {
	          scope.emptyLastDays.push({});
	        }
	        scope.days = days;
	        checkNavigationButtons();
	      };

	      scope.generate();
	    }
	  };
	}]);

	// var multipleDatePicker = angular.module('libs.multipleDatePicker',['multipleDatePicker']);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Models =__webpack_require__(13),
		Schedule = Models.TutorSchedule;

	var Services = angular.module('schedule.service',[]);

	Services.factory('TutorSchedule',[function(){
		var json = __webpack_require__(16)
		var tutor_schedule = new Schedule(json);
		console.log(tutor_schedule);
		return {
			schedule:tutor_schedule
		}
	}])



/***/ },
/* 10 */,
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);
	var moment = __webpack_require__(10);
	var Models = __webpack_require__(12)
	var Schedule = Models.Schedule,
		Booking = Models.Booking,
		Session = Models.Session,
		getDaysArray = Models.getDaysArray;

	var Services = angular.module('calendar.service',[]);


	Services.factory('CalendarFactory',['$rootScope','$modal','$log',function($rootScope,$modal,$log){
		var json = __webpack_require__(16);
		var hourly_calendar = new Schedule(json.monthly,'month');
		var monthly_calendar = new Schedule(json.hourly,'hour');
		var cal__t = {hour:hourly_calendar,month:monthly_calendar};
		
		var tutor ={
			max_student:4,
			supports_monthly:true,
			expected_hours:16,
			hours_per_day:2,
			price:3000,
			// discount:0
			discount:15
		}
		_.extend(tutor,{student_range:function(){return _.range(1,this.max_student+1)},
			dicounted_price:function(){return this.price*this.discount/100}});
		console.log(tutor);
		var selections = new Booking(tutor.price,tutor.discount);



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
		function TotalBookedHours(){
			return selections.TotalBookedHours();
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
			TotalBookedHours:TotalBookedHours,
			tutor:tutor,
		}
	}]);



/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);
	var moment = __webpack_require__(10);
	var TS = __webpack_require__(13),
		TimeSlot = TS.TimeSlot;
	var months = moment.months();

	var getDaysArray = function(month) {
		var intMonth = months.indexOf(month);
	  var date = new Date(moment().year(), intMonth, 1);
	  var result = [];
	  while (date.getMonth() == intMonth) {
	    result.push(moment(date));
	    date.setDate(date.getDate()+1);
	  }
	  return result;
	};

	var TimeSlotCalendarMixin = {
		validStartTimes:function(range){
			var current_times = this.getStartHours();
			var that  = this;
			return _.filter(current_times,function(x){
				return moment(x,"ha").hour()+range <= that.end_time;
			});;
		},
	}
	_.extend(TimeSlot.prototype,TimeSlotCalendarMixin)

	var AvailableDay = function(response){
		_.extend(this,response);
		this.times = _.map(this.times,function(t){
			return new TimeSlot(t);
		});
		this.momentDate = moment(this.date,"DD-MM-YYYY");
	};
	AvailableDay.prototype={
		getHours: function(range){
			var callback;
			if(range){
				callback = function(x){return x.validStartTimes(range);}
			}else{
				callback = function(x){return x.getStartHours();}
			}
			var result = _.map(this.times,callback);
			return _.flatten(result);
		},
		getEndHours:function(v){
			var result = _.map(this.times,function(x){
				return x.getEndHours(v);
			}).filter(function(x){return x.length > 0});

			return result[0];
		},
		end_time:function(value,interval){
			var exists = _.findIndex(this.times,function(tt){
				var hours = t.getStartHours();
				return hours.indexOf(value) > -1
			});
		},
		validMonthDate:function(interval){
			return this.getHours(interval).length > 0
		},
	}


	var Month = function(jsonResponse){
		_.extend(this,jsonResponse);
		this.dates = _.map(jsonResponse.dates,function(monthSchedule){
			return new AvailableDay(monthSchedule);
		});
	}

	Month.prototype = {
		getWorkingDaysOfWeek:function(){
			var result = _.map(this.dates,function(date){
				return date.weekday
			})
			return _.uniq(result);
		},
		getDaysOff:function(cal,inter){
			var interval = inter || 1;
			var cal_type = cal || 'hour';

			var working_dates=this.dates; 	
			if(cal_type !== 'hour'){
				working_dates = _.filter(this.dates,function(x){
					return x.validMonthDate(interval)
				});
			}
			var available_days = _.map(working_dates,function(x){return x.momentDate.date()});
			var all_days = getDaysArray(this.month);
			return all_days.filter(function(dd){
				return available_days.indexOf(dd.date()) < 0;
			}).map(function(x){return x.valueOf()});
			
		},
		getDayInstance:function(md){
			return _.find(this.dates,function(d){
				return md.isSame(d.momentDate,'day');
			})
		}

	}
	var Schedule = function(jsonResponse,cal_type){
		// BaseSchedule.call(this,jsonResponse);
		var month_groups = _.chain(jsonResponse)
			.groupBy("month")
			.pairs()
			.map(function (currentItem) {
				return _.object(_.zip(["month", "dates"], currentItem));
			})
			.value();
		this.calendar_typ = cal_type;
		this.months = _.map(month_groups,function(month){
			return new Month(month);
		});
		var wd = _.map(this.months,function(m){
			return m.getWorkingDaysOfWeek();
		});
		this.weekdays = _.uniq(_.flatten(wd));
	}
	Schedule.prototype = {
		getMonth :function(month_name) {
			return _.find(this.months,{month:month_name});
		},
		getFirstFourDays:function(currentMonth,weekDay){
			if (this.weekdays.indexOf(weekDay) < 0){
				return null;
			}
			var cr = _.find(this.months,{month:currentMonth});
			var month_index = _.findIndex(this.months,{month:currentMonth});
			//month does not exist or is not currently available
			if(month_index < 0){
				return null;
			}
			//last month and the days are not up to 4
			if(month_index === this.months.length-1 && cr.dates.length < 4){
				return null;
			}
			var remaining_months= this.months.slice(month_index,this.months.length)
				.map(function(x){
					return x.dates;
				});
			//flattens array and removes those days not specified by the weekday
			var av_days = _.flatten(remaining_months).filter(function(dd){
				return dd.weekday === weekDay;
			});

			//Days are not up to 4 
			if(av_days.length < 3){
				return null;
			}
			if(av_days.length === 3){
				return av_days
			}
			return av_days.slice(0,4);
		}
	}

	var Session = function(dateInstance){
		//fields are date,start_time and end_time
		_.extend(this,dateInstance);

	}
	Session.prototype = {
		StringRepresentation:function(format){
			var f = format || "YYYY-MM-DD";
			return this.date.format(f);		
		},
		ShortRepresentation:function(){	
			var str = moment.monthsShort()[this.date.month()]+" "+this.date.date()+", "+this.date.year();
			console.log(str);
			return str;

		},
		weekdayString:function(){
			return moment.weekdays()[this.date.weekday()];
		},
		isNew:	function(){
			return this.start_time === null;
		},
		hours:function(){
			return moment(this.end_time,"ha").hours() - moment(this.start_time,"ha").hours();
		},
		calculateEndTime:function(hours_per_day){
			var end_time = moment(this.start_time,"ha").hour()+hours_per_day;
			this.end_time = moment(end_time,"HH").format("ha");
		},	
		isValid:function(new_val){
			var array = ["",null,"undefined",undefined,'Invalid date','End time']
			var options = _.filter(array,function(x){
				return new_val === x;
			});
			var toTrue = _.map(options,function(){return false});
			return _.reduce(toTrue,function(sum,x){
				return sum && x;
			},true)
		}
	}

	var Booking = function(price,discount){
		this.sessions = [];
		this.students = 1;
		this.tutor_price=price;
		this.discount = discount || 0;
	};

	Booking.prototype = {
		getIndex:function(x){
			console.log(x);
			return _.findIndex(this.sessions,function(s){
				return s.StringRepresentation() ===  x.StringRepresentation();
			})
		},
		AddBooking:function(session){
			//Add or update
			var instance = this.getIndex(session);
			if(instance > -1){
				this.sessions[instance] = session;
			}else{
				this.sessions.push(session);
			}
		},
		TotalBookedHours:function(){
			return _.reduce(this.sessions,function(sum,s){
				return sum+s.hours();
			},0);
		},
		Summary:function(){
			var has_s = this.students >1 ? "s":"";		
			var booked_hours = this.TotalBookedHours();
			var hr_s = booked_hours >1 ?"s":"";
			return "\u20A6"+this.tutor_price+" x "+booked_hours+"hour"+hr_s+" x "+this.students+" student"+has_s;
		},
		Total:function(){
			return (this.tutor_price*this.TotalBookedHours())*((100*this.students)-(this.discount*this.students)+this.discount)/100;
		},
		BookingFeePercent:function(){
			var total = this.Total();
			var fee = 5;
			if(total>=20000 && total < 50000){
				fee = 4;
			}
			if(total>=50000){
				fee = 3;
			}
			return fee;	
		},
		BookingFee:function(){
			return this.BookingFeePercent() *this.Total()/100;
		},
		TotalPayment:function(){
			return this.BookingFee()+this.Total();
		},
		RemoveBooking:function(session){
			var instance = this.getIndex(session);
			if(instance > -1){
				this.sessions.splice(instance,1);
			}
		},
		InitializeSession:function(date){
			var instance = _.findIndex(this.sessions,function(x){
				var sameDay = date.isSame(x.date,'day'),
					sameMonth = date.isSame(x.date,'month'),
					sameYear = date.isSame(x.date,'year');
				return sameDay && sameMonth && sameYear;
			});
			if(instance > -1){
				console.log(this.sessions[instance]);
				return this.sessions[instance];
			}
			return new Session({date:date,start_time:null,end_time:null});
			
		}
	};

	exports.Schedule=Schedule;
	exports.Booking = Booking;
	exports.getDaysArray = getDaysArray;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2),
		moment = __webpack_require__(10);
	function momenttime(x){
		var y = x;
		if (typeof x === "string"){
			y= moment(x,"hh:mm A").hour();;
		}
		return y;
	}
	var TimeSlot = function(time){
		_.extend(this,time);
		this.start = this.start_time||this.start;
		this.end = this.end_time || this.end;
	}
	TimeSlot.prototype = {
		getMomentStartTime:function(){
			return momenttime(this.start)
		},
		getMomentEndTime:function(){
			return momenttime(this.end);
		},
		getStartHours:function(){
			var x = this.getMomentStartTime();
			var y = this.getMomentEndTime();
			var results =  _.range(x,y);
			return _.map(results,function(r){
				return moment(r,"HH").format("ha");
			});
		},	
		getEndHours:function(value){
			//format = "7am"
			var end = this.getMomentEndTime();
			var tt = moment(value,"ha").hour();
			if(tt < end){			
				var results = _.range(tt+1,end+1);
				return _.map(results,function(r){
					return moment(r,"HH").format("ha");
				})	
			}else{
				return [];
			}
		}
	}

	var Day = function(dd){
		_.extend(this,dd)
		if(this.is_new){
			this.start = 1;
			this.end = 23;
		}
		this.cancelled = false;	
		this.times = new TimeSlot({start:this.start,end:this.end});
		this.momentDate = moment(this.date,"DD-MM-YYYY");
	}
	Day.prototype = {	
		getMomentInstance:function(){
			var x = this.date;
			if(typeof this.date === "string"){
				x = this.momentDate
			}
			return x;
		},
		ShortRepresentation:function(){	
			var x = this.getMomentInstance()
			var str = moment.monthsShort()[x.month()]+" "+x.date()+", "+x.year();
			return str;

		},
		weekdayString:function(){
			return moment.weekdays()[this.getMomentInstance().weekday()];
		},
		getEndHours:function(value){
			return this.times.getEndHours(value);
		},
		getStartTime:function(){
			return moment(this.times.start,"hh:mm A").format("ha");
		},
		getEndTime:function(){
			return moment(this.times.end,"hh:mm A").format("ha");
		},
		getHours:function(){
			return this.times.getStartHours();
		},
		isNew:function(){
			return this.is_new === true;
		},
		isValid:function(new_val){
			var array = ["",null,"undefined",undefined,'Invalid date','End time']
			var options = _.filter(array,function(x){
				return new_val === x;
			});
			var toTrue = _.map(options,function(){return false});
			return _.reduce(toTrue,function(sum,x){
				return sum && x;
			},true)
		}
	};
	var TutorSchedule = function(jsonResponse){
		this.free = _.map(jsonResponse.free,function(x){
			return new Day(x);
		});
		this.booked = _.map(jsonResponse.booked,function(x){
			return new Day(x);
		})
		this.cancelled = [];
		this.updates = [];
		this.new_dates = [];
	}
	function toOriginalTimeFormat(x){
		return moment(x,"ha").format("hh:mm A");
	}
	TutorSchedule.prototype={
		getDayInstance:function(md){
			var dd = _.find(this.free,function(d){
				return md.isSame(d.momentDate,'day');
			})
			return dd;
		},
		getGenericDayInstance:function(md){
			return _.find(this.new_dates,function(d){
				return md.isSame(d.momentDate,'day');
			})

		},
		SyncNewDays:function(days_to_sync){
			this.new_dates = _.map(days_to_sync,function(x){
				var dd = new Day(x);
				dd.is_new = true;
				return dd;
			})
		},
		InitializeDayInstance:function(md){
			var inst = this.getGenericDayInstance(md);
				if(inst){
					return inst;
				}
				return new Day({date:md,start:1,end:24,is_new:true});
		},
		getDayIndex:function(dd,obj){
			return _.findIndex(obj,{date:dd.date});
		},
		CancelDay:function(date){
			var day = this.getDayInstance(date.date);
			if(this.getDayIndex(day,this.cancelled)<0){
				day.cancelled = true;
				this.cancelled.push(day)			
			}
		},
		SyncUpdateDays:function(arr){
			for (var i = arr.length - 1; i >= 0; i--) {
				this.UpdateDay(arr[i]);
			};
			console.log(this.updates);
		},
		UpdateDay:function(date){
			var day = this.getDayInstance(date.date);
			if(this.getDayIndex(day,this.updates) < 0){
				day.old_start=day.start;
				day.start = toOriginalTimeFormat(date.start_time);
				day.end = toOriginalTimeFormat(date.end_time);
				this.updates.push(day);
			}
		},
		getUpdatedDayInstance:function(day){
			return _.find(this.updates,function(x){

			})
		},
		AddNewDay:function(date){
			var tuteriad_date = new Day(date);
			if(this.getDayIndex(tuteriad_date,this.free) < 0){
				this.new_dates.push(tuteriad_date)
			}
		},
		GetAvailableDays:function(){
			return _.map(this.free,function(x){
				return x.momentDate.valueOf();
			})
		},
		CurrentlyBookedDates:function(){
			var today = moment();
			var previousDays = _.map(_.range(1,today.date()+1),function(x){
				var d = x+"-"+(today.month()+1)+"-"+today.year();
				return moment(d,"DD-MM-YYYY").valueOf();
			});
			var booked =  _.map(this.booked,function(x){
				return x.momentDate.valueOf();
			});
			return _.union(previousDays,booked);
		},
		ProcessSubmission:function(){
			var occurrences = this.updates.concat(this.cancelled)
			if(this.new_dates.length > 0 || occurrences > 0){			
				return {
					events:this.new_dates,
					occurrences:occurrences
				}	
			}
			return null;
		}
	};
	exports.TutorSchedule = TutorSchedule;
	exports.TimeSlot = TimeSlot;
	exports.Day = Day

/***/ },
/* 14 */,
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	(function(root, factory) {
	    if(true) {
	        module.exports = factory(__webpack_require__(10));
	    }
	    else if(typeof define === 'function' && define.amd) {
	        define(['moment'], factory);
	    }
	    else {
	        root.moment = factory(root.moment);
	    }
	}(this, function(moment) {
	var DateRange, INTERVALS;

	INTERVALS = {
	  year: true,
	  month: true,
	  week: true,
	  day: true,
	  hour: true,
	  minute: true,
	  second: true
	};

	/**
	  * DateRange class to store ranges and query dates.
	  * @typedef {!Object}
	*
	*/


	DateRange = (function() {
	  /**
	    * DateRange instance.
	    *
	    * @param {(Moment|Date)} start Start of interval
	    * @param {(Moment|Date)} end   End of interval
	    *
	    * @constructor
	  *
	  */

	  function DateRange(start, end) {
	    this.start = moment(start);
	    this.end = moment(end);
	  }

	  /**
	    * Determine if the current interval contains a given moment/date/range.
	    *
	    * @param {(Moment|Date|DateRange)} other Date to check
	    *
	    * @return {!boolean}
	  *
	  */


	  DateRange.prototype.contains = function(other) {
	    if (other instanceof DateRange) {
	      return this.start <= other.start && this.end >= other.end;
	    } else {
	      return (this.start <= other && other <= this.end);
	    }
	  };

	  /**
	    * @private
	  *
	  */


	  DateRange.prototype._by_string = function(interval, hollaback) {
	    var current, _results;
	    current = moment(this.start);
	    _results = [];
	    while (this.contains(current)) {
	      hollaback.call(this, current.clone());
	      _results.push(current.add(1, interval));
	    }
	    return _results;
	  };

	  /**
	    * @private
	  *
	  */


	  DateRange.prototype._by_range = function(range_interval, hollaback) {
	    var i, l, _i, _results;
	    l = Math.floor(this / range_interval);
	    if (l === Infinity) {
	      return this;
	    }
	    _results = [];
	    for (i = _i = 0; 0 <= l ? _i <= l : _i >= l; i = 0 <= l ? ++_i : --_i) {
	      _results.push(hollaback.call(this, moment(this.start.valueOf() + range_interval.valueOf() * i)));
	    }
	    return _results;
	  };

	  /**
	    * Determine if the current date range overlaps a given date range.
	    *
	    * @param {!DateRange} range Date range to check
	    *
	    * @return {!boolean}
	  *
	  */


	  DateRange.prototype.overlaps = function(range) {
	    return this.intersect(range) !== null;
	  };

	  /**
	    * Determine the intersecting periods from one or more date ranges.
	    *
	    * @param {!DateRange} other A date range to intersect with this one
	    *
	    * @return {!DateRange|null}
	  *
	  */


	  DateRange.prototype.intersect = function(other) {
	    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
	    if (((this.start <= (_ref1 = other.start) && _ref1 < (_ref = this.end)) && _ref < other.end)) {
	      return new DateRange(other.start, this.end);
	    } else if (((other.start < (_ref3 = this.start) && _ref3 < (_ref2 = other.end)) && _ref2 <= this.end)) {
	      return new DateRange(this.start, other.end);
	    } else if (((other.start < (_ref5 = this.start) && _ref5 < (_ref4 = this.end)) && _ref4 < other.end)) {
	      return this;
	    } else if (((this.start <= (_ref7 = other.start) && _ref7 < (_ref6 = other.end)) && _ref6 <= this.end)) {
	      return other;
	    } else {
	      return null;
	    }
	  };

	  /**
	    * Subtract one range from another.
	    *
	    * @param {!DateRange} other A date range to substract from this one
	    *
	    * @return {!DateRange[]}
	  *
	  */


	  DateRange.prototype.subtract = function(other) {
	    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
	    if (this.intersect(other) === null) {
	      return [this];
	    } else if (((other.start <= (_ref1 = this.start) && _ref1 < (_ref = this.end)) && _ref <= other.end)) {
	      return [];
	    } else if (((other.start <= (_ref3 = this.start) && _ref3 < (_ref2 = other.end)) && _ref2 < this.end)) {
	      return [new DateRange(other.end, this.end)];
	    } else if (((this.start < (_ref5 = other.start) && _ref5 < (_ref4 = this.end)) && _ref4 <= other.end)) {
	      return [new DateRange(this.start, other.start)];
	    } else if (((this.start < (_ref7 = other.start) && _ref7 < (_ref6 = other.end)) && _ref6 < this.end)) {
	      return [new DateRange(this.start, other.start), new DateRange(other.end, this.end)];
	    }
	  };

	  /**
	    * Iterate over the date range by a given date range, executing a function
	    * for each sub-range.
	    *
	    * @param {(!DateRange|String)} range     Date range to be used for iteration
	    *                                        or shorthand string (shorthands:
	    *                                        http://momentjs.com/docs/#/manipulating/add/)
	    * @param {!function(Moment)}   hollaback Function to execute for each sub-range
	    *
	    * @return {!boolean}
	  *
	  */


	  DateRange.prototype.by = function(range, hollaback) {
	    if (typeof range === 'string') {
	      this._by_string(range, hollaback);
	    } else {
	      this._by_range(range, hollaback);
	    }
	    return this;
	  };

	  /**
	    * Date range in milliseconds. Allows basic coercion math of date ranges.
	    *
	    * @return {!number}
	  *
	  */


	  DateRange.prototype.valueOf = function() {
	    return this.end - this.start;
	  };

	  /**
	    * Date range toDate
	    *
	    * @return {!Array}
	  *
	  */


	  DateRange.prototype.toDate = function() {
	    return [this.start.toDate(), this.end.toDate()];
	  };

	  /**
	    * Determine if this date range is the same as another.
	    *
	    * @param {!DateRange} other Another date range to compare to
	    *
	    * @return {!boolean}
	  *
	  */


	  DateRange.prototype.isSame = function(other) {
	    return this.start.isSame(other.start) && this.end.isSame(other.end);
	  };

	  /**
	    * The difference of the end vs start.
	    *
	    * @param {number} unit Unit of difference, if no unit is passed in
	    *                      milliseconds are returned. E.g.: `"days"`,
	    *                      `"months"`, etc...
	    *
	    * @return {!number}
	  *
	  */


	  DateRange.prototype.diff = function(unit) {
	    if (unit == null) {
	      unit = void 0;
	    }
	    return this.end.diff(this.start, unit);
	  };

	  return DateRange;

	})();

	/**
	  * Build a date range.
	  *
	  * @param {(Moment|Date)} start Start of range
	  * @param {(Moment|Date)} end   End of range
	  *
	  * @this {Moment}
	  *
	  * @return {!DateRange}
	*
	*/


	moment.fn.range = function(start, end) {
	  if (start in INTERVALS) {
	    return new DateRange(moment(this).startOf(start), moment(this).endOf(start));
	  } else {
	    return new DateRange(start, end);
	  }
	};

	/**
	  * Build a date range.
	  *
	  * @param {(Moment|Date)} start Start of range
	  * @param {(Moment|Date)} end   End of range
	  *
	  * @this {Moment}
	  *
	  * @return {!DateRange}
	*
	*/


	moment.range = function(start, end) {
	  return new DateRange(start, end);
	};

	/**
	  * Check if the current moment is within a given date range.
	  *
	  * @param {!DateRange} range Date range to check
	  *
	  * @this {Moment}
	  *
	  * @return {!boolean}
	*
	*/


	moment.fn.within = function(range) {
	  return range.contains(this._d);
	};

	    return moment;
	}));


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		"monthly": [
			{
				"cancelled": false,
				"date": "10-02-2015",
				"times": [
					{
						"start_time": 8,
						"end_time": 16
					}
				],
				"weekday": "Tuesday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "13-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "16-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "19-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "20-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "23-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "26-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "27-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "02-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "05-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "06-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "09-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "12-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "13-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "16-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "19-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "20-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "23-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "26-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "27-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "30-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "02-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "03-04-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "06-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "09-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "10-04-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "13-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "16-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "17-04-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "20-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "23-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "27-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "30-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "04-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "07-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "11-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "14-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "18-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "21-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "25-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "28-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "01-06-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "June"
			},
			{
				"cancelled": false,
				"date": "04-06-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "June"
			},
			{
				"cancelled": false,
				"date": "06-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "09-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 8
					},
					{
						"start_time": 12,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "February"
			}
		],
		"hourly": [
			{
				"cancelled": false,
				"date": "10-02-2015",
				"times": [
					{
						"start_time": 8,
						"end_time": 16
					}
				],
				"weekday": "Tuesday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "13-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "16-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "19-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "20-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "23-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "26-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "27-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "02-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "05-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "06-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "09-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "12-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "13-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "16-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "19-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "20-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "23-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "26-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "27-03-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "30-03-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "March"
			},
			{
				"cancelled": false,
				"date": "02-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "03-04-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "06-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "09-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "10-04-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "13-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "16-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "17-04-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "20-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "23-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "27-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "30-04-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "April"
			},
			{
				"cancelled": false,
				"date": "04-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "07-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "11-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "14-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "18-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "21-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "25-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "28-05-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "May"
			},
			{
				"cancelled": false,
				"date": "01-06-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "June"
			},
			{
				"cancelled": false,
				"date": "04-06-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 14
					}
				],
				"weekday": "Thursday",
				"month": "June"
			},
			{
				"cancelled": false,
				"date": "06-02-2015",
				"times": [
					{
						"start_time": 21,
						"end_time": 23
					}
				],
				"weekday": "Friday",
				"month": "February"
			},
			{
				"cancelled": false,
				"date": "09-02-2015",
				"times": [
					{
						"start_time": 7,
						"end_time": 8
					},
					{
						"start_time": 12,
						"end_time": 20
					}
				],
				"weekday": "Monday",
				"month": "February"
			}
		],
		"booked": [
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 9,
				"end": "02:00 PM",
				"date": "06-02-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "09-02-2015"
			}
		],
		"free": [
			{
				"cancelled": false,
				"start": "08:00 AM",
				"event_id": 21,
				"end": "04:00 PM",
				"date": "10-02-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "13-02-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "16-02-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "19-02-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "20-02-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "23-02-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "26-02-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "27-02-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "02-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "05-03-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "06-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "09-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "12-03-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "13-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "16-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "19-03-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "20-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "23-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "26-03-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "27-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "30-03-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "02-04-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "03-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "06-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "09-04-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "10-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "13-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "16-04-2015"
			},
			{
				"cancelled": false,
				"start": "09:30 PM",
				"event_id": 2,
				"end": "11:30 PM",
				"date": "17-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "20-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "23-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "27-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "30-04-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "04-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "07-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "11-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "14-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "18-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "21-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "25-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "28-05-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 18,
				"end": "08:00 PM",
				"date": "01-06-2015"
			},
			{
				"cancelled": false,
				"start": "07:00 AM",
				"event_id": 20,
				"end": "02:00 PM",
				"date": "04-06-2015"
			}
		]
	}

/***/ }
]);