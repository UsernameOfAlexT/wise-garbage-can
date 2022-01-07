const axios = require('axios');
const MTGENDPOINT_V1 = "https://api.magicthegathering.io/v1/";
const DEF_TIMEOUT = 5000; //in ms
const RATE_WARN_THRESHOLD = 100; // Perhaps make this env bound
/**
 * A very barebones collection of ways to interact with the mtgapi endpoints
 * Just supports a small slice of the endpoints.
 * 
 * Used to more nicely wrap the results from the endpoint
 */
module.exports = {
  getCards: query('cards')
}

/**
 *  Return an object to interact with the given endpoint
 * 
 * @param {String} endpoint mtg endpoint to make a request to
 * @returns an object containing some functions that can be used to interact
 *          with the given endpoint
 */
function query(endpoint) {
  const ENDPOINT_URL = MTGENDPOINT_V1 + endpoint;
  return {
    /**
     * Make basic GET requests based on some parameter
     * @param {Object} req the request. See magicthegathering.io for documentation
     * @param {Number} timeout req timeout
     * @returns promise returning an array of card results
     *          when fulfilled and passing up errors when rejected
     */
    where: function (req, timeout = DEF_TIMEOUT) {
      return axios.get(MTGENDPOINT_V1 + endpoint, {
        params: req,
        timeout: timeout,
      })
        .then(res => {
          const { "ratelimit-remaining": ratelimitLeft } = res.headers;
          if (!ratelimitLeft) {
            console.log("No rate limit in mtgapi response!");
          }
          if (ratelimitLeft < RATE_WARN_THRESHOLD) {
            console.log("Note: Approaching mtg api rate limit: " + ratelimitLeft);
          }

          // strip out extra data when passing onward
          return res.data.cards;
        })
        .catch(err => {
          throw requestErrorLogger(err, ENDPOINT_URL);
        });
    }
  }
}

/**
 * Add info on the given errors and return an Error with relevant info
 * 
 * @param {*} error err response
 * @param {String} endpointUrl endpoint call was made to
 */
function requestErrorLogger(error, endpointUrl) {
  // TODO needs much more detail
  const { "response": res } = error;
  error.message +=  ` - endpoint: ${endpointUrl}`;
  if (res) {
    const { status = "No Status", "statusText": statusMsg = "No Status Reason" } = res;
    error.message += `\nResponse: ${status}: ${statusMsg}`;
  }
  return error;
}
