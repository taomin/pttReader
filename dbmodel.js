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


/**
 * Update user's longlive token
 * @param  {String} userID      user who needs update accessToken
 * @param  {String} accessToken old access token
 * @param  {Function}           callback function when FB api call returns.
 *                              function params: new access token and new expiration time. Will return null when renew fails.
 */
ReaderDao.prototype.getLongLivedToken = function(userID, accessToken, callback){
	var	url = 'https://graph.facebook.com/oauth/access_token?'
			  + 'client_id=' + context.appId
			  + '&client_secret=' + context.appSecret
			  + '&grant_type=fb_exchange_token'
			  + '&fb_exchange_token=' + accessToken;

	request.get(url, function(err, response, body){

		if (!err && response.statusCode == 200) {
		    var params = body.split('&'),
		    	kvpairs,
		    	config = {};
		    params.forEach(function(param){
		    	kvpairs = param.split('=');
		    	config[kvpairs[0]] = kvpairs[1];
		    });

		    // console.log('return config :', config);
		    callback(null, config);
		}
		else {
			console.log('get error when updating user token. Keep using old one. User:', userID);
			console.log('error message : ', body);
			callback(true);
		}
	});
};

ReaderDao.prototype.getUserInfo = function(userID, accessToken, callback){
	var url = 'https://graph.facebook.com/' + userID + '?access_token=' + accessToken;
	request.get(url, function(err, response, body){
		// console.log('url ', url);
		// console.log('body', body);
		if (!err && response.statusCode == 200) {
			var user = JSON.parse(body);
			user._id = user.id;
			// console.log('user is ' + JSON.stringify(user));
		    callback(null, user);
		}
		else {
			console.log('get error when fetching user info. User:', userID);
			console.log('error message : ', body);
			callback(true);
		}
	});
};

exports.init = function(dburi){
	var dao = new ReaderDao(dburi);
	return dao;
};

