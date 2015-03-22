'use strict';
var beats = require('./controllers/beats'),
  compress = require('koa-compress'),
  logger = require('koa-logger'),
  serve = require('koa-static'),
  route = require('koa-route'),
  koa = require('koa'),
  path = require('path'),
  port = 3000,
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

app.listen(port);
console.log('welcomess listening on port ' + port);
