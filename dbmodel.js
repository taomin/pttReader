function ReaderDao (mongoskin){

	this.mongoskin = mongoskin;

};

ReaderDao.prototype.saveFBTimeline = function(timeline){

	var self = this;
	timeline.map(function(message){
		if (!message._id && message.id) {
			message._id = message.id;
		}
		// console.log('save message : ', message);
		self.mongoskin.collection('fb_timeline').save(message);
	});

};

ReaderDao.prototype.saveUser = function(userinfo){


	this.mongoskin.collection('users').save({'user': userinfo});

	// // verify : show what we have now
	// this.mongoskin.collection('users').find().toArray(function(err, items){
 //    console.log(JSON.stringify(items));
 //  });

};

exports.init = function(mongoskin){
	var dao = new ReaderDao(mongoskin);
	return dao;
};

