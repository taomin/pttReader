var mongoskin = require('mongoskin'),
	request = require('request'),
	context = require('./env.js').getContext('development');

function ReaderDao (dburi){

	this.db = mongoskin.db(dburi);

};

ReaderDao.prototype.saveFBTimeline = function(timeline, userID){

	var self = this;
	timeline.forEach(function(message){
		if (!message._id && message.id) {
			message._id = message.id;
		}

		message.isRaw = true,
		message.userID = userID,

		//convert created_time and updated_time to timestamp
		message.created_time = new Date(message.created_time);
		message.updated_time = new Date(message.updated_time);
		self.db.collection('fb_timeline').save(message);
	});

};

ReaderDao.prototype.saveUserInfo = function(userInfo, accessToken){

	var self = this,
		currentDate = new Date();
	if (!userInfo._id && userInfo.id) {
		userInfo._id = userInfo.id;
	}

	self.getLongLivedToken(accessToken, function(error, response){

		if (!error && response){

			userInfo.accessToken = response.access_token;
			userInfo.tokenExpiration = new Date(currentDate.getTime()
												+ parseInt(response.expires) * 1000);
			self.db.collection('users').save(userInfo);
		}
		else {
			console.log('failed to get long lived token for ', userInfo.username);
		}
	});

};


/**
 * Update user's longlive token
 * @param  {String} accessToken old access token
 * @param  {Function}           callback function when FB api call returns.
 *                              function params: new access token and new expiration time. Will return null when renew fails.
 */
ReaderDao.prototype.getLongLivedToken = function(accessToken, callback){

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

		    callback(null, config);
		}
		else {
			console.log('get error when updating accessToken: ', accessToken);
			console.log('error message received : ', body);
			callback(true);
		}
	});
};

/**
 * Get any FB user info
 * @param  {String}   userID      user that your want to fetch information
 * @param  {String}   accessToken token used for authentication
 * @param  {Function} callback
 */
ReaderDao.prototype.getUserInfo = function(userID, accessToken, callback){

	var url = 'https://graph.facebook.com/' + userID + '?access_token=' + accessToken;
	request.get(url, function(err, response, body){

		if (!err && response.statusCode == 200) {
			var user = JSON.parse(body);
			if (!user._id && user.id){
				user._id = user.id;
			}
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

