/**
 * A single point of truth for deciding 
 * env related variables
 */

exports.useDetailedLogging = function() {
  return process.env.DETAILED_LOGS || false;
}

