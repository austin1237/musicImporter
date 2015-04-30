var expect = require('chai').expect;
var controller = require('../controllers/helper');

describe('testing helper functions', function(){

    it('testing the standarization of track names across apis', function(){
      var beats = 'icarus - live version';
      var spotify = 'icarus (live version)';
      var spotWithFeat = 'finale (feat. nicholas petricca) [netsky remix]';
      var beatsWithoutFeat = 'finale - netsky remix';
      var testSpecial ="ghosts 'n' stuff (feat. rob swire) [nero mix]";
      var testSpecial2 = 'ghosts ‘n’ stuff - nero remix';

      beats = controller.standarizeNames(beats);
      spotify = controller.standarizeNames(spotify);
      spotWithFeat = controller.standarizeNames(spotWithFeat);
      beatsWithoutFeat = controller.standarizeNames(beatsWithoutFeat);
      testSpecial2 = controller.standarizeNames(testSpecial2);
      testSpecial = controller.standarizeNames(testSpecial);
      expect(beats).to.equal(spotify);
      expect(spotWithFeat).to.equal(spotWithFeat);
      expect(testSpecial).to.equal(testSpecial2);
    });

});
