const mtgapi = require('../support/mtgapicust');
const assert = require('assert');

// TODO expanded test coverage
describe('mtgapicust', function() {
  describe('#getCards', function() {
    describe('#where', function() {
      it('should handle random fetching via basic mtgapi params', function() {
        // fluent promise assertions? see chai as promised
        return mtgapi.getCards.where({
          page: 1,
          pageSize: 10,
          random: true,
        }).then(res => {
          assert.equal(res.cards.length, 10);
        })
      })
    });
  });
});
