function ReaderDao (mongoskin){

	this.mongoskin = mongoskin;

};

ReaderDao.prototype.saveLink = function(linkinfo){
	
	this.mongoskin.collection('links').save({'link': linkinfo});

	// verify : show what we have now
	this.mongoskin.collection('links').find().toArray(function(err, items){
    console.log(JSON.stringify(items));
  });

};

ReaderDao.prototype.saveUser = function(userinfo){
	
	
	this.mongoskin.collection('users').save({'user': userinfo});

	// verify : show what we have now
	this.mongoskin.collection('users').find().toArray(function(err, items){
    console.log(JSON.stringify(items));
  });

};

exports.init = function(mongoskin){
	var dao = new ReaderDao(mongoskin);
	return dao;
};

