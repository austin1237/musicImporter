var expect = require('chai').expect;
var _ = require('lodash');
var controller = require('../controllers/spotify');
var helper = require('../controllers/helper');
var dummyData = require('./spotify-dummy');
var beatsUserData = require('./beatsUserData');
var spotifyAlbums = require('./spotifyAlbums');
describe('testing spotify functions', function(){

    //Example from spotify API
    //Reference https://developer.spotify.com/web-api/search-item/
    //curl -X GET "https://api.spotify.com/v1/search?q=album:arrival%20artist:abba&type=album"
  it('testing the conversion of albums from beats to queries on the spotify api', function(){
    var album = dummyData.album1;
    var album2 = dummyData.album2;
    var query = controller.convertAlbumToQuery(album);
    var query2 = controller.convertAlbumToQuery(album2);
    expect(query).to.equal('search?q=album:Finally%20Famous%20artist:Big%20Sean&type=album');
    expect(query2).to.equal('search?q=album:The%20City%20artist:Madeon&type=album');
  });


  //Match off of track number instead of name (problem might be singles instead of albums);
  it('testing the matching of tracks', function(){
      console.log('lets match');
      var massagedData = controller.massageData(spotifyAlbums);
      var matched = controller.matchTracks(beatsUserData, massagedData);
      console.log('not found is', matched.notFound);
      expect(matched.found.length).to.not.equal(0);
      expect(matched.notFound.length).to.equal(0);
  });


});
