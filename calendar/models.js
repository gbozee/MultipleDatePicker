var _ = require('lodash');
var moment = require('moment');

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
}

var TimeSlot = function(time){
	_.extend(this,time);
}
TimeSlot.prototype = {
	getStartHours:function(){
		var results =  _.range(this.start_time,this.end_time);
		return _.map(results,function(r){
			return moment(r,"HH").format("ha");
		});
	},
	validStartTimes:function(range){
		var current_times = this.getStartHours();
		var that  = this;
		return _.filter(current_times,function(x){
			return moment(x,"ha").hour()+range <= that.end_time;
		});;
	},
	getEndHours:function(value){
		//format = "7am"
		var tt = moment(value,"ha").hour();
		if(tt < this.end_time){			
			var results = _.range(tt+1,this.end_time+1);
			return _.map(results,function(r){
				return moment(r,"HH").format("ha");
			})	
		}else{
			return [];
		}
	}
}

var AvailableDay = function(response){
	_.extend(this,response);
	this.times = _.map(this.times,function(t){
		return new TimeSlot(t);
	});
	this.momentDate = moment(this.date,"DD-MM-YYYY");
};
AvailableDay.prototype={
	getHours: function(){
		var result = _.map(this.times,function(x){
			return x.getStartHours();
		});
		return _.flatten(result);
	},
	monthlyStartHours:function(range){
		var r = range || 2;
		var result = _.map(this.times,function(x){
			return x.validStartTimes(r);
		});
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
		return this.monthlyStartHours(interval).length > 0
	}
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
		var working_dates;
		if(cal_type === 'hour'){			
		 working_dates=this.dates; 	
		}else{
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
	weekdayString:function(){
		return moment.weekdays()[this.date.weekday()];
	},
	isNew:	function(){
		return this.start_time === null;
	}
}

var Booking = function(){
	this.sessions = [];
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
	RemoveBooking:function(session){
		var instance = this.getIndex(session);
		if(instance > -1){
			this.sessions.splice(instance,1);
		}
	},
	RefreshBookings:function(){
		this.sessions = [];
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
