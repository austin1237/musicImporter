/**
 * Created by austin on 2/15/15.
 */

var views = require('co-views'),
  parse = require('co-body'),
  request = require('co-request'),
  _ = require('lodash'),
  beatsClientId = "3pp9v3p4sgjea6r3uqsrut5f",
  beatsClientSecret = "6kv4CZTHNRMEW5g3YNQ39cQN",
  accessToken;
var render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

module.exports.home = function *home() {
var beatsUrl = "https://partner.api.beatsmusic.com/v1/oauth2/authorize?response_type=code&client_id="+ beatsClientId + "&redirect_uri=http://localhost:3000/token";
  this.response.redirect(beatsUrl);
};


//Something is fucked up in this chain
module.exports.token = function *token(){
  var formattedTracks = [];
  var code = this.request.query.code,
    response,
    me,
    clientId,
    myTracks;

  response = yield getAuthorizeToken(code);
  response = response.body;

  accessToken = response.access_token;
  me = yield makeAPICall('me');
  me = me.body.result || me.body;
  me = me.user_context;
  //users/:user_id/mymusic/tracks
  myTracks = yield makeAPICall('users/' + me + '/mymusic/tracks?limit=150');
  _.each(myTracks.body.data, function(track){
    var obj = {};
    obj.title = track.title;
    obj.artist = track.artist_display_name;
    formattedTracks.push(obj);
  });

  this.body = formattedTracks;
};

function getAuthorizeToken(code) {

  var authOptions = {
    url: 'https://partner.api.beatsmusic.com/v1/oauth2/token',
    form: {
      code: code,
      redirect_uri: 'http://localhost:3000/token',
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(beatsClientId + ':' + beatsClientSecret).toString('base64'))
    },
    json: true
  };

  return request.post(authOptions);
}



//Tidbits limit there track count to 150
function makeAPICall (query){
  var authOptions = {
    url: 'https://partner.api.beatsmusic.com/v1/api/' + query,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };
  return request.get(authOptions);
}

