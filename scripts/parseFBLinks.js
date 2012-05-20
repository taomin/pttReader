var mongoskin = require('mongoskin'),
	// need to figure out how batch script switch between dev/prod. maybe a config file.
	dburi = 'mongodb://localhost:27017/reader-test',
	mongodb = mongoskin.db(dburi);

mongodb.collection('fb_timeline').find({isRaw: true}).sort({created_time: -1}).toArray(function(err, results){

	results.forEach(function(update, index){
		// console.log('Handlig fb update');
		var fromUser = update.from;
		// ignore non-user (e.g. fanpage). They will have 'category'
		if (fromUser.category){
			console.log('fan page, ignore');
			return;
		}

		//find user info. check whether he is recorded in our db.

		//if not, check FB and update our database

		//url expansion

		//insert the results in new colleciton in mongo.

		//update records in fb_timeline, set isRaw to false;
	});

	mongodb.close();

});
