var mongoskin = require('mongoskin');

function ReaderDao (dburi){

	this.db = mongoskin.db(dburi);

};

ReaderDao.prototype.saveFBTimeline = function(timeline, userID, accessToken){

	var self = this;
	timeline.forEach(function(message){
		if (!message._id && message.id) {
			message._id = message.id;
		}

		message.isRaw = true,
		message.userID = userID,
		message.accessToken = accessToken;
		//convert created_time and updated_time to timestamp
		message.created_time = new Date(message.created_time);
		message.updated_time = new Date(message.updated_time);
		self.db.collection('fb_timeline').save(message);
	});

};

ReaderDao.prototype.saveUser = function(userinfo){


	this.db.collection('users').save({'user': userinfo});

	// // verify : show what we have now
	// this.mongoskin.collection('users').find().toArray(function(err, items){
 //    console.log(JSON.stringify(items));
 //  });

};

exports.init = function(dburi){
	var dao = new ReaderDao(dburi);
	return dao;
};

