'use strict';
var messages = require('./controllers/messages'),
  beats = require('./controllers/beats'),
compress = require('koa-compress'),
 logger = require('koa-logger'),
 serve = require('koa-static'),
 route = require('koa-route'),
 koa = require('koa'),
  co = require('co'),
 path = require('path'),
 app = module.exports = koa();

// Logger
app.use(logger());

app.use(route.get('/', beats.home));
app.use(route.get('/token', beats.token));




// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

//beatsV2()
app.listen(3000);
console.log('welcome')
