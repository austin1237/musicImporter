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
    spotTracks = extractTracks(spotAlbums);
    foundTracks = matchTracks(beatsAlbums, spotTracks);

    return foundTracks;
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
            }else{
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

function matchTracks(beatsAlbums, spotifyTracks){
    var foundTracks = [];
    var found = 0;
    var notFound = 0;
    var notFoundTracks = [];
    _.each(beatsAlbums, function(album){
        _.each(album.tracks, function(track){
            if(spotifyTracks[helper.standarizeNames(track)]){
                foundTracks.push(spotifyTracks[track]);
                found++;
            }else{
                if(album.artist.toLowerCase() === 'deadmau5'){
                    console.log('not found', track.toLowerCase());
                }

                notFoundTracks.push(track);
                notFound++;
            }
        });
    });
    //console.log('total from beats is', found + notFound);
    console.log('found', found, 'notFound', notFound);
    //console.log('not found beats tracks', notFoundTracks);
    return foundTracks;
}

function extractTracks(spotAlbums){
    var tracks = {};
    var totalTracks = 0;
    _.each(spotAlbums, function(album){
        if(album.artists[0].name.toLowerCase() === 'deadmau5'){
            console.log('somethings wrong spotify');
            _.each(album.tracks.items,function(track){
                console.log(track.name.toLowerCase());
            });
        }
        _.each(album.tracks.items,function(track){
            if(track.type === 'track'){
                tracks[helper.standarizeNames(track.name)] = track.id;
                totalTracks++;
            }
        });
    });
    //console.log('total tracks from spotify are', totalTracks);
    return tracks;
}

function makeApiCall (query, accessToken){
    var authOptions = {
        url: 'https://api.spotify.com/v1/' + query,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    return request.get(authOptions);
}
