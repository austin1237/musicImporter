/*jshint esnext: true */
var request = require('co-request');
var _ = require('lodash');
var querystring = require('querystring');
var helper = require('../controllers/helper');


module.exports.convertLibrary = function *convertLibrary(beatsAlbums, accessToken){
    var albumIds = [];
    var spotAlbums = [];
    var spotTracks = {};
    var foundTracks = [];

    albumIds = yield getAlbumIds(beatsAlbums, accessToken);
    spotAlbums = yield getAlbums(albumIds, accessToken);
    var fs = require('fs');
    var util = require('util');
    fs.writeFileSync('./test/spotifyAlbums.json', util.inspect(spotAlbums, false, null) , 'utf-8');
    return [];
};

exports.massageData = function(albums){
    var positions = {};
    var names = {};
    var massagedData = {};
    _.each(albums, function(album){
        _.each(album.tracks.items, function(track){
            var pkey = album.name + album.artists[0].name +  track.track_number;
            pkey = helper.standarizeNames(pkey);
            positions[pkey] = track.id;
            names[helper.standarizeNames(track.name)] = track.id;
        });
    });
    massagedData.positions = positions;
    massagedData.names = names;
    return massagedData;
};

module.exports.convertAlbumToQuery = function convertAlbumToQuery(beatsAlbum){
    //q=album:arrival%20artist:abba&type=album
    //querystring.stringify({foo: 'bar', baz: 'qux'}, ';', ':')
    var query = querystring.stringify(query);
    var searchQuery = {};
    var mainQuery = '';
    searchQuery.album = beatsAlbum.title;
    searchQuery.artist = beatsAlbum.artist;
    searchQuery = querystring.stringify(searchQuery, '%20', ':');
    mainQuery = 'search?q=' + searchQuery+ '&type=album';
    return mainQuery;
};


//Getting Albums Ids via search with album title
function *getAlbumIds(beatsAlbums, accessToken){
    var responses = [];
    var promises = [];
    var albumIds = [];

    _.forEach(beatsAlbums, function(album) {
        var query = {};
        query = module.exports.convertAlbumToQuery(album);
        promises.push(makeApiCall(query, accessToken));
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
}

//Doing a call against the albums now
//max 20 albums per call
function *getAlbums(albumIds, accessToken){
    var promises = [];
    var chunks = _.chunk(albumIds, 20);
    var responses = [];
    var albums = [];


    _.each(chunks, function(ids){
        var query = 'albums/?ids=' + ids.join();
        promises.push(makeApiCall(query, accessToken));
    });

    responses = yield(promises);

    _.each(responses, function(res){
        if(res.body.albums){
            albums = albums.concat(res.body.albums);
        }
    });
    return albums;
}

//Matches first based off of albums and track positions;
 exports.matchTracks = function (beatsAlbums, massagedData){
    var spotifyPostions = massagedData.positions;
    var spotifyNames = massagedData.names;
    var names = massagedData.names;
    var found = [];
    var notFound= [];
    _.each(beatsAlbums, function(album){
        _.each(album.songs, function(song){
            var posKey = album.title + album.artist + song.trackPosition;
            var namKey = helper.standarizeNames(song.name);
            posKey = helper.standarizeNames(posKey);
            if(spotifyPostions[posKey]){
                found.push(spotifyPostions[posKey]);
            }else if(spotifyNames[namKey]){
                found.push(spotifyNames[namKey]);
            }else{
                song.artist = album.artist;
                song.album = album.title;
                notFound.push(song);
            }
        });
    });
    console.log('result is', found.length, notFound.length);
    return {found: found, notFound : notFound};
};


function makeApiCall (query, accessToken){
    var authOptions = {
        url: 'https://api.spotify.com/v1/' + query,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    return request.get(authOptions);
}
