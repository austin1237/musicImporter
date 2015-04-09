/*jshint esnext: true */
var request = require('co-request');
var _ = require('lodash');
var querystring = require('querystring');
var helper = require('../controllers/helper');
var clientId = '5d9649bd77714522996b6b6d936ec98f';
var secret = '0c3bddcfa6384b6f828c1d76ac1024d9';


module.exports.getAlbums = function *getAlbums(albums, accessToken){
    var responses = {};
    var promises = [];
    var albumIds = [];

    _.forEach(albums, function(album) {
        var query = {};
        query.q = album.title;
        query.type = 'album';
        query = query;
        query = querystring.stringify(query);
        promises.push(makeApiCall('search?'+query, accessToken));
    });

    responses = yield(promises);
    _.each(responses, function(resp){
        if(resp.body){
            var albums = resp.body.albums;
            if(albums.items.length){
            albumIds = albumIds.concat(albums.items[0].id);
            }
        }
    });
    return albumIds;
    // response = yield makeAPICall('me', accessToken);
    // response = response.body.result || me.body;
    // me = response.user_context;
    //
    // return me;
};

function makeApiCall (query, accessToken){
    var authOptions = {
        url: 'https://api.spotify.com/v1/' + query,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    return request.get(authOptions);
}
