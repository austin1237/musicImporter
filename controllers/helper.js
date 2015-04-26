/*jshint esnext: true */
var request = require('co-request');
var beatsController = require('./beats');
var spotifyController = require('./spotify');

//App Info
var beatsApp = {
    clientId : "3pp9v3p4sgjea6r3uqsrut5f",
    secret : "6kv4CZTHNRMEW5g3YNQ39cQN",
    tokenUrl: 'https://partner.api.beatsmusic.com/v1/oauth2/token',
    getAccessUrl: function(){
        return "https://partner.api.beatsmusic.com/v1/oauth2/authorize?response_type=code&client_id="+ this.clientId + "&redirect_uri=http://localhost:3000/token";
    },
    sessonKey: 'beatsToken'
};

var spotifyApp = {
    clientId : '5d9649bd77714522996b6b6d936ec98f',
    secret : '0c3bddcfa6384b6f828c1d76ac1024d9',
    getAccessUrl: function(){
        return 'https://accounts.spotify.com/authorize/?client_id='+ this.clientId +'&response_type=code&redirect_uri=http://localhost:3000/token&scope=user-library-modify';
    },
    tokenUrl: 'https://accounts.spotify.com/api/token',
    sessonKey: 'spotifyToken'
};


exports.getAuthorizeToken = function getAuthorizeToken(url, code, clientId, secret) {

  var authOptions = {
    url: url,
    form: {
      code: code,
      redirect_uri: 'http://localhost:3000/token',
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(clientId + ':' + secret).toString('base64'))
    },
    json: true
  };

  return request.post(authOptions);
};


module.exports.getUserAccess = function *getUserAccess(){

    if(!this.session.beatsToken){
        this.session.currentApp = 'beats';
        this.response.redirect(beatsApp.getAccessUrl());
    }else if(!this.session.spotifyToken){
        this.response.redirect(spotifyApp.getAccessUrl());
        this.session.currentApp = 'spotify';
    }else{
        var albums = yield beatsController.getAllTracks(this.session.beatsToken);
        var spotifyAlbums = yield spotifyController.convertLibrary(albums, this.session.spotifyToken);
        this.body = 'spotify album ids are' + spotifyAlbums;

    }
};

exports.token = function *token(){
    var code = this.request.query.code;
    var app = this.session.currentApp === 'beats' ? beatsApp : spotifyApp;
    var response = yield exports.getAuthorizeToken(app.tokenUrl, code, app.clientId, app.secret);
    response = response.body;
    accessToken = response.access_token;
    this.session[app.sessonKey] = accessToken;
    console.log('response is', response.body);
    console.log('cookie is', this.session);
    yield exports.getUserAccess;
};

exports.standarizeNames = function(name){
    var newName = name.replace(/(\s|-|[(]|[)])/g, '');
    return newName;
};
