var _ = require('lodash'),
	moment = require('moment');

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

var Day = function(dd){
	_.extend(this,dd)
	this.cancelled = false;
	this.times = new TimeSlot({start:this.start,end:this.end});
	this.momentDate = moment(this.date,"DD-MM-YYYY");
}
Day.prototype = {	
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

TutorSchedule.prototype={
	getDayInstance:function(md){
		return _.find(free.dates,function(d){
			return md.isSame(d.momentDate,'day');
		})
	},
	getDayIndex:function(dd,obj){
		return _.findIndex(obj,{date:dd.date});
	},
	CancelDay:function(date){
		var day = this.getDayInstance(date);
		if(this.getDayIndex(day,this.cancelled)<0){
			day.cancelled = true;
			this.cancelled.push(day)			
		}
	},
	UpdateDay:function(date){
		var day = this.getDayInstance(date);
		if(this.getDayIndex(day,this.updates) < 0){
			day.old_start=day.start;
			day.start = date.start;
			day.end = date.end;
			this.updates.push(day);
		}
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
	GetDaysOff:function(){
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
