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
    console.log('get all Tracks hit', accessToken);
    var me = {};

    me = yield whoAmI(accessToken);
    console.log('me is', me);
    firstCall = yield makeAPICall('users/' + me + '/mymusic/tracks?limit=150', accessToken);
    tracks = yield getTheRest(me, firstCall, accessToken);

    return tracks;
};

function *whoAmI(accessToken){
    var response = {},
    me = {};

    response = yield makeAPICall('me', accessToken);
    response = response.body.result || me.body;
    me = response.user_context;

    return me;
};

function *getTheRest(me, firstCall, accessToken){
    var total = firstCall.body.info.total,
        queries = [],
        tracks = firstCall.body.data,
        offset = 150,
        responses = [];
        total -= 150;

    console.log('total is', total);
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


    tracks = formatTracks(tracks);
    return tracks;

};


function formatTracks (tracks){
    console.log('tracks are', tracks.length);
    var formattedTracks = [];

    _.each(tracks, function(track){
        var obj = {};
        obj.title = track.title;
        obj.artist = track.artist_display_name;
        formattedTracks.push(tracks);
    });
    return formattedTracks;
}


function makeAPICall (query, accessToken){
    var authOptions = {
        url: 'https://partner.api.beatsmusic.com/v1/api/' + query,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    return request.get(authOptions);
}
