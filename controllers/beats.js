 /*jshint esnext: true */
var views = require('co-views'),
  parse = require('co-body'),
  request = require('co-request'),
  _ = require('lodash'),
  beatsClientId = "3pp9v3p4sgjea6r3uqsrut5f",
  beatsClientSecret = "6kv4CZTHNRMEW5g3YNQ39cQN",
  accessToken,
  render = views(__dirname + '/../views', {
    map: { html: 'swig' }
  });



module.exports.home = function *home() {
  var beatsUrl = "https://partner.api.beatsmusic.com/v1/oauth2/authorize?response_type=code&client_id="+ beatsClientId + "&redirect_uri=http://localhost:3000/token";
  this.response.redirect(beatsUrl);
};


module.exports.getAllTracks = function *token(accessToken){
    console.log('get all Tracks hit', accessToken);
    var me = {};

    me = yield whoAmI(accessToken);
    return me;
};


function *getChunkOfTracks (accessToken) {

};


function *whoAmI(accessToken){
    console.log('whoAmI hit', accessToken);
    var query = 'users/' + me + '/mymusic/tracks?limit=150',
        response = {},
        me = {};

    response = yield makeAPICall('me', accessToken);
    console.log('response is', response);
    response = response.body.result || me.body;
    me = response.user_context;
    return me;
};

//Something is fucked up in this chain
module.exports.token = function *token(){
  var formattedTracks = [];
  var code = this.request.query.code,
    queries =[],
    tracks = [],
    response,
    me,
    clientId,
    firstCall,
    total;

  me = yield makeAPICall('me');
  me = me.body.result || me.body;
  me = me.user_context;
  //users/:user_id/mymusic/tracks
  firstCall = yield makeAPICall('users/' + me + '/mymusic/tracks?limit=150');
  total = firstCall.body.info.total;
  total -= 150;
  tracks = firstCall.body.data;

  //Beats only allows a maximum of 150 tracks per call
  //If more tracks are needed then the remainder is called in sets of 150
  var offset = 150;
    while (total > 0) {
      queries.push(makeAPICall('users/' + me + '/mymusic/tracks?limit=150&offset=' + offset));
      offset += 150;
      total -= 150;
    }

    var responses = yield(queries);


  //Strips tracks out of the response object
  _.each(responses, function(resp){
    tracks = tracks.concat(resp.body.data);
  });


  _.each(tracks, function(track){
    var obj = {};
    obj.title = track.title;
    obj.artist = track.artist_display_name;
    formattedTracks.push(obj);
  });

  this.body = formattedTracks;
};

function formatTracks (tracks){
  var formattedTracks = [];

  _.each(tracks, function(track){
    var obj = {};
    obj.title = track.title;
    obj.artist = track.artist_display_name;
    formattedTracks.push(tracks);
  });
}

function makeAPICall (query, accessToken){
    console.log('make API call hit');
  var authOptions = {
    url: 'https://partner.api.beatsmusic.com/v1/api/' + query,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };
  return request.get(authOptions);
}
