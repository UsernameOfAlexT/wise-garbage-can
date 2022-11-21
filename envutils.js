/**
 * A single point of truth for deciding 
 * env related variables
 */
const HIGH_LOG_ALIASES = ['high', 'detailed', 'verbose'];
const LOG_LEVEL = process.env.LOGGING_LEVEL || 'standard';
const GUILD_ID = process.env.GUILD_ID || '';

exports.setupEnvVars = () => {
  try {
    require('dotenv').config();
    console.log('dotenv found. loading from .env');
  } catch(e) {
    console.info('dotenv not found. Environment variables should be set by other methods');
  }
}

exports.useDetailedLogging = function() {
  return HIGH_LOG_ALIASES.includes(LOG_LEVEL);
}

/**
 * Get a guild id to update slash commands on, if it exists.
 * Otherwise return an empty string (so it resolves falsey)
 * 
 * @returns guild id for slash cmd updating, if it exists. 
 * Empty string toherwise
 */
exports.getCmdUpdateGuildId = function() {
  return GUILD_ID.trim();
}
