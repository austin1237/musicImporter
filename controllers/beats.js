/*jshint esnext: true */
var views = require('co-views'),
parse = require('co-body'),
request = require('co-request'),
_ = require('lodash'),
beatsClientId = "3pp9v3p4sgjea6r3uqsrut5f",
beatsClientSecret = "6kv4CZTHNRMEW5g3YNQ39cQN",
render = views(__dirname + '/../views', {
    map: { html: 'swig' }
});

module.exports.home = function *home() {
    var beatsUrl = "https://partner.api.beatsmusic.com/v1/oauth2/authorize?response_type=code&client_id="+ beatsClientId + "&redirect_uri=http://localhost:3000/token";
    this.response.redirect(beatsUrl);
};

module.exports.getAllTracks = function *token(accessToken){
    var me = {};

    me = yield whoAmI(accessToken);
    firstCall = yield makeAPICall('users/' + me + '/mymusic/tracks?limit=150', accessToken);
    tracks = yield getTheRest(me, firstCall, accessToken);

    var fs = require('fs');
    var util = require('util');
    fs.writeFileSync('./test/beatsUserData.json', util.inspect(tracks, false, null) , 'utf-8');

    return tracks;
};

function *whoAmI(accessToken){
    var response = {},
    me = {};

    response = yield makeAPICall('me', accessToken);
    response = response.body.result || me.body;
    me = response.user_context;
    return me;
}

function *getTheRest(me, firstCall, accessToken){
    var total = firstCall.body.info.total;
    var queries = [];
    var tracks = firstCall.body.data;
    var albums = {};
    var offset = 150;
    var responses = [];
    total -= 150;

    while (total > 0) {
        queries.push(makeAPICall('users/' + me + '/mymusic/tracks?limit=150&offset=' + offset, accessToken));
        offset += 150;
        total -= 150;
    }

    responses = yield(queries);
    // Strips tracks out of the response object
    _.each(responses, function(resp){
        if(resp.body.data){
            tracks = tracks.concat(resp.body.data);
        }
    });

    albums = sortIntoAlbums(tracks);
    return albums;
}



// Example Track from beats api
// { type: 'mymusic_track',
//   id: 'tr55271163',
//   title: 'Dance (A$$)',
//   disc_number: 1,
//   parental_advisory: true,
//   edited_version: false,
//   duration: 197,
//   track_position: 7,
//   popularity: 30,
//   streamable: true,
//   release_date: '2011-06-28',
//   artist_display_name: 'Big Sean',
// refs:
//   { artists: [ [Object] ],
//     album:
//      { ref_type: 'album',
//        id: 'al55271149',
//        display: 'Finally Famous' },
//artist is [ { ref_type: 'artist', id: 'ar839888', display: 'Big Sean' } ]

function sortIntoAlbums (tracks){
    var formattedTracks = [];
    var albums = {};
    _.each(tracks, function(track){
        var albumId = track.refs.album.id;
        if(track.streamable){
            if(albums[albumId]){
                albums[albumId].songs.push({trackPosition: track.track_position, name : track.title});
            }else{
                albums[albumId] = {};
                albums[albumId].title = track.refs.album.display;
                albums[albumId].artist = track.refs.artists[0].display;
                albums[albumId].songs = [{trackPosition: track.track_position, name : track.title}];
            }
        }
    });
    return albums;
}


function makeAPICall (query, accessToken){
    var authOptions = {
        url: 'https://partner.api.beatsmusic.com/v1/api/' + query,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    return request.get(authOptions);
}
