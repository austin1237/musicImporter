/*jshint globalstrict: true*/
/*jshint node: true */
/*jshint esnext: true */

'use strict';
var compress = require('koa-compress'),
  session = require('koa-session'),
  logger = require('koa-logger'),
  serve = require('koa-static'),
  route = require('koa-route'),
  koa = require('koa'),
  path = require('path'),
  port = 3000,
  beats = require('./controllers/beats'),
  helper = require('./controllers/helper'),
  app = module.exports = koa();

  app.keys = ['tokens'];
  app.use(session(app));

// Logger
app.use(logger());
app.use(route.get('/', helper.getUserAccess));
app.use(route.get('/token', helper.token, helper.getUserAccess));


// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

//beatsV2()

app.listen(port);
console.log('welcomess listening on port ' + port);


//todos
//Get both tokens from beats spotify
//Get Tracks/Format them from beats
//Insert them into spotifiy

//Real Nice Figure out a way to hold both token for a single user.
