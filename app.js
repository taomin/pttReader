
/**
 * Module dependencies.
 */

var express = require('express');
var mongoskin = require('mongoskin');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler()); 
  app.set('db-uri', 'mongodb://localhost:27017/reader-test');
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  app.set('db-uri', 'mongodb://localhost:27017/');
});


/**
 * setting up connection to mongo db 
 */
//var readerdb = mongoskin.db('localhost:27017/reader');
var readerdb = mongoskin.db(app.set('db-uri'));
/*
readerdb.collection('links').save({'link': 'http://mmdays.com'});
readerdb.collection('links').find().toArray(function(err, items){
    console.log(JSON.stringify(items));
}); 
*/

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
