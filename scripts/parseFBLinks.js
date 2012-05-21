var mongoskin = require('mongoskin'),
	request = require('request'),
	// need to figure out how batch script switch between dev/prod. maybe a config file.
	context = {
		dburi : 'mongodb://localhost:27017/reader-test',
		appId : '177950445641724',
		appSecret : '03f6cd1caf768e0a2660b582719334e8'
	};
context.mongodb = mongoskin.db(context.dburi);

function updateTimelineRecords(context){
	var db = context.mongodb;
	db.collection('fb_timeline').find({isRaw: true}).sort({created_time: -1}).toArray(function(err, updates){

		updates.forEach(function(update, index){
			// console.log('Handlig fb update');
			var userID = update.userID,
				accessToken = update.accessToken,
				fromUser = update.from,
				longLivedToken = null;

			// console.log('now at user:' , userID);
			db.collection('users').findOne({'_id': userID}, function(err, user){

				if (err){
					console.log('db connection error when trying to retrieve user ' + userID + '! exit');
					//forcibly terminate function
					db.close();
					return;
				}
				else if (!user){

					console.log('cannot find user in DB. trying to fetch user info: ', userID);
					//no record found for this user,
					//need to fetch user information, and update DB records

					var cb = function(error, longLivedToken){
						if (!error && longLivedToken){
							accessToken = longLivedToken.access_token;
							getUserInfo(userID, accessToken, function(err, userInfo){
								if (!err){
									db.collection('users').save(userInfo);
								}
							});
						//save user info
						// userInfo.tokenExpire = ..... calculate expire time.
							// db.collection('users').save(userInfo);
						}
						else //fail to get user token...
						{
							//does nothing.
						}
					};

					longLivedToken = getLongLivedToken(userID, accessToken, cb);

					//need to get long lived token
					// updateUserToken(context, userID, accessToken);
					// addUser(context, userID, longLivedToken);
					// processUserUpdates(c);
				} else {
					// processUserUpdates();
				}
			});



			// ignore non-user (e.g. fanpage). They will have 'category'
			// if (fromUser.category){
			// 	console.log('fan page, ignore');
			// 	return;
			// }


			// //find user info. check whether he is recorded in our db.
			// db.collection('users').findOne({'_id': fromUser.id}, function(err, user){
			// 	if (err) {
			// 		//can't find this user. Need to check with FB

			// 	}
			// });


			//check whether we need to update this user accessToken to long-live token


			//if not, check FB and update our database

			//url expansion

			//insert the results in new colleciton in mongo.

			//update records in fb_timeline, set isRaw to false;
		});

		// db.close();

	});
}

//****** Below code should be moved to dbmodel.js **********

/**
 * Update user's longlive token
 * @param  {String} userID      user who needs update accessToken
 * @param  {String} accessToken old access token
 * @param  {Function}           callback function when FB api call returns.
 *                              function params: new access token and new expiration time. Will return null when renew fails.
 */
function getLongLivedToken(userID, accessToken, callback){
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
}

function getUserInfo(userID, accessToken, callback){
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
}

updateTimelineRecords(context);
