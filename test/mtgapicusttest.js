"use strict";
const mtgapi = require('../support/mtgapicust');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

// TODO should be mocking the externals
describe('mtgapicust', function () {
  this.timeout(6000);
  this.slow(500);
  describe('#getCards', function () {
    describe('#where', function () {
      it('should handle random fetching via basic mtgapi params', function () {
        return mtgapi.getCards.where({
          page: 1,
          pageSize: 10,
          random: true,
        }).should.eventually.be.an.instanceOf(Array).and.have.lengthOf(10);
      });
      it('should allow filtering of results', function () {
        return mtgapi.getCards.where({
          page: 1,
          pageSize: 3,
          layout: "transform",
          random: true,
        }).should.eventually.have.length(3).and.satisfy(cards => {
          return cards.every(card => {
            return card instanceof Object && card.layout === "transform";
          })
        });
      });
      it('should return empty results if given nonsense filter params', function () {
        return mtgapi.getCards.where({
          page: 1,
          pageSize: 10,
          rarity: "something-not-possible",
        }).should.eventually.be.empty;
      });
      it('should ignore properties that do not correspond to anything', function () {
        return mtgapi.getCards.where({
          page: 1,
          pageSize: 4,
          nonsense: "nonsense",
        }).should.eventually.be.an.instanceOf(Array).and.have.lengthOf(4);
      });
      it('should reject timeouts and propagate a wrapped error', function () {
        // absurdly low timeout so the promise will certainly be rejected
        const TEST_TIMEOUT = 1;
        return mtgapi.getCards.where({
          page: 1,
          pageSize: 1,
        }, TEST_TIMEOUT).should.be.rejectedWith(Error);
      });
    });
  });
});
