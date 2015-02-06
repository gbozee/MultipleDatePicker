var _ = require('lodash'),
	moment = require('moment');
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
