/**
 * A single point of truth for deciding 
 * env related variables
 */
const HIGH_LOG_ALIASES = ['high', 'detailed', 'verbose'];
const LOG_LEVEL = process.env.LOGGING_LEVEL || 'standard';

exports.useDetailedLogging = function() {
  return HIGH_LOG_ALIASES.includes(LOG_LEVEL);
}

