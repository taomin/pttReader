var mongoskin = require('mongoskin'),
	request = require('request'),
	Step = require('step'),
	dbmodel = require('../dbmodel.js'),

	// need to figure out how batch script switch between dev/prod. maybe a config file.
	context = {
		dburi : 'mongodb://localhost:27017/reader-test',
		appId : '177950445641724',
		appSecret : '03f6cd1caf768e0a2660b582719334e8'
	};
context.mongodb = mongoskin.db(context.dburi);
dbmodel = dbmodel.init(context.dburi);

function updateTimelineRecords(context){
	var db = context.mongodb,
		threadDoneCount = 0;
		threadSize = 0.
		threadDone = function (){
			threadDoneCount ++;
			console.log('thread done count: '+ threadDoneCount + ' threadsize:' + threadSize);
			if (threadDoneCount === threadSize) {
				closeDB(db);
			}
		};

	db.collection('fb_timeline').find({isRaw: true}).sort({created_time: -1}).toArray(function(err, updates){

		threadSize = updates.length;
		updates.forEach(function(update, index){

			var userID = update.userID,
				accessToken,
				fromUser = update.from,
				longLivedToken = null;

			// ignore non-user (e.g. fanpage). They will have 'category'
			if (fromUser.category){
				console.log('fan page, ignore');
				threadDone();
				return;
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
						threadDone();
					}
					// console.log('get userInfo:', userInfo);
					accessToken = userInfo.accessToken;
					db.collection('users').findOne({'_id': fromUser.id}, this);
				},
				function checkFromUser(err, fromUserInfo){
					if (err){
						throw err;
						threadDone();
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
						threadDone();
					}

					// for "from user" info fetched from fb, there is no "accessToken".
					// but if this userinfo is from our db, accessToken will be included inside.
					var token = fromUserInfo.accessToken || null;
					console.log('get user:', fromUserInfo.name);
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
				function urlExpansion(err,data){

					if (err){
						throw err;
						threadDone();
					}
					threadDone();
					return true;
				}
			);

		});

	});
}

function closeDB(db){
	console.log('close db');
	db.close();
}

updateTimelineRecords(context);
