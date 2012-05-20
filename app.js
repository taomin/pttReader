
/**
 * Module dependencies.
 */

var express = require('express'),
    dbmodel = require('./dbmodel.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.set('db-uri', 'mongodb://localhost:27017/reader-test');
  app.use(express.errorHandler());
});

app.configure('development', function(){
});

app.configure('production', function(){
  app.set('db-uri', 'mongodb://localhost:27017/reader');
});


/**
 * setting up connection to mongo db
 */

dbmodel = dbmodel.init(app.set('db-uri'));

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.post('/saveFBTimeline', function(req, res){

  var userID = req.body.userID,
      accessToken = req.body.accessToken,
      timeline = req.body.timeline;

  // dbmodel.saveUser(user);
  dbmodel.saveFBTimeline(timeline, userID, accessToken);

  //should render successful json response.
  res.send('OK', 200);
});


// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
