var expect = require('chai').expect;
var controller = require('../controllers/spotify');
var dummyData = require('./spotify-dummy');

describe('testing spotify functions', function(){

    //Example from spotify API
    //Reference https://developer.spotify.com/web-api/search-item/
    //curl -X GET "https://api.spotify.com/v1/search?q=album:arrival%20artist:abba&type=album"
  it('testing the conversion of albums from beats to queries on the spotify api', function(){
    var album = dummyData.album;
    var query = controller.convertAlbumToQuery(album);
    expect(query).to.equal('search?q=album:Finally%20Famous%20artist:Big%20Sean&type=album');
  });

});
