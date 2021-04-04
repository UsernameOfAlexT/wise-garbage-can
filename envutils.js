/**
 * A single point of truth for deciding 
 * env related variables
 */
const HIGH_LOG_ALIASES = ['high', 'detailed', 'verbose'];
const LOG_LEVEL = process.env.LOGGING_LEVEL || 'standard';

exports.useDetailedLogging = function() {
  return HIGH_LOG_ALIASES.includes(LOG_LEVEL);
}

// TODO convert to just have a function that handles logging levels instead of
// having to do the check all the time

/**
 * Logs the given to console if the logging level is at least
 * at the 'detailed' level
 * 
 * @param {String} message  string to log to console
 */
exports.logDetail = function(message) {
  if (exports.useDetailedLogging()) {
    console.log(message);
  }
} 
