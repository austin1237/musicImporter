var expect = require('chai').expect;
var controller = require('../controllers/helper');

describe('testing helper functions', function(){

    it('testing the standarization of track names across apis', function(){
      var beats = 'icarus - live version';
      var spotify = 'icarus (live version)';
      beats = controller.standarizeNames(beats);
      spotify = controller.standarizeNames(spotify);
      expect(beats).to.equal(spotify);
    });

});
