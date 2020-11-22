const PRODUCTION_ALIASES = ['prod', 'production'];
const TEST_ALIASES = ['test'];
const current_env = process.env.ENV;

exports.isProdEnv = function () {
  return PRODUCTION_ALIASES.includes(current_env.toLowerCase());
}

exports.isTestEnv = function () {
  return TEST_ALIASES.includes(current_env.toLowerCase());
}