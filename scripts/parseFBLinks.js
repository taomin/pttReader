var mongoskin = require('mongoskin'),
	request = require('request'),
	Step = require('step'),
	dbmodel = require('../dbmodel.js'),
	context = require('../env.js').getContext('development');

	// need to figure out how batch script switch between dev/prod. maybe a config file.

// console.log('context', context);

dbmodel = dbmodel.init(context.dburi);
context.mongodb = dbmodel.db;


function updateTimelineRecords(context){
	var db = context.mongodb;

	Step(
		function getFeeds() {

			db.collection('fb_timeline').find({isRaw: true}).sort({created_time: -1}).toArray(this);
		},

		function processFeed(err, updates){
			// console.log('process feed. has updates?',  updates);

			var group = this.group();

			if (err) {
				throw err;
			}

			updates.forEach(function(update){
				processFBUpdate(update, group());
			});

		},

		function closeDB(){
			console.log('close db');
			db.close();
		}
	);
};

function processFBUpdate(update, callback){

	var db = context.mongodb,
		userID = update.userID,
		accessToken,
		fromUser = update.from,
		longLivedToken = null;

	// ignore non-user (e.g. fanpage). They will have 'category'
	if (fromUser.category){
		// console.log('fan page, ignore');
		return callback('done');
	}

	//for each thread (ok it just look like), execute below :
	//1. get user info (about who received this), including his accessToken
	//2. get 'from user' info (about who spoke this)
	//3. url expansion
	//4. insert a new record in fb_share, included digested information
	//5. update records in fb_timeline, set isRaw to false;
	Step(
		function getUserInfo(){
			db.collection('users').findOne({'_id': userID}, this);
		},
		function getFromUser(err, userInfo){
			if (err){
				throw err;
			}
			// console.log('get userInfo:', userInfo);
			accessToken = userInfo.accessToken;
			db.collection('users').findOne({'_id': fromUser.id}, this);
		},
		function checkFromUser(err, fromUserInfo){
			if (err){
				throw err;
			}

			if (!fromUserInfo){
				//can't find this user's information in db. fetching fb api
				dbmodel.getUserInfo(fromUser.id, accessToken, this);
			} else {
				return fromUserInfo;
			}

		},
		function saveFromUser(err, fromUserInfo){
			if (err){
				throw err;
			}

			// for "from user" info fetched from fb, there is no "accessToken".
			// but if this userinfo is from our db, accessToken will be included inside.
			var token = fromUserInfo.accessToken || null;
			// console.log('get user:', fromUserInfo.name);
			if (token){
				//if this user info is from our db, do nothing
				return true;
			}
			else {
				//why it failed here ? has to call mongoskin directly :(
				// dbmodel.saveUserInfo(fromUserInfo, token, this);
				db.collection('users').save(fromUserInfo, this);
			}
		},
		function urlExpansion(err){

			if (err){
				throw err;
			}

			getLongUrl(update.link, this);
		},

		function end(longurl){

			// console.log('at thread end', longurl);
			callback('done');
		}
	);


};

function getLongUrl(shorturl, callback){
	var db = context.mongodb,
		  longurl = shorturl;

	//checking protocol
	if (! /^.*:\/\//.test(shorturl)){
		shorturl = 'http://' + shorturl;
	}

	// console.log('dealing with shorturl:', shorturl);

	Step(
		function checkDBCache(){
			db.collection('shorturls').findOne({'_id': shorturl}, this);
		},
		function checkLongUrl(err, cachedUrl){
			if (err){
				throw err;
			}

			if (cachedUrl && cachedUrl.longurl){

				var mockAjaxReq = function (callback){
					callback(null, null, {cached: true, longurl: cachedUrl.longurl});
				}
				mockAjaxReq(this);

			} else {
				var url = 'http://expandurl.appspot.com/expand?url=' + encodeURIComponent(shorturl);
				console.log('talk with expand url ', url);
				request.get(url, this);
			}
		},
		function saveLongUrl(err, response, body){
			if (err){
				throw err;
			}
			if (body.cached){
				// console.log('long url : found cache');
				longurl = body.longurl;
			}
			else {
				longurlInfo = JSON.parse(body);
				//from expand url
				longurl = (longurlInfo.redirects) ? longurlInfo.end_url : shorturl;
			}

			db.collection('shorturls').save({'_id': shorturl, 'longurl': longurl}, this);
		},
		function end(err){
			if (err){
				console.log('get err when saving shorturls ?', err);
			}
			callback(longurl);
		}
	);

}

updateTimelineRecords(context);
