'use strict';

/**
 * Standard log format
 */
function log(title, msg) {
  console.log(`[${title}] - ${msg}`);
}

/**
 * Generate a UUID
 * https://gist.github.com/jed/982883 DWTFYW public license
 */
function uuid(fmt) {
  return fmt ? (fmt ^ (Math.random() * 16 >> fmt / 4)).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function error(type, message, validRange) {
  const err = new Error(message);
  err.type = type;
  err.validRange = validRange;
  return err;
}

module.exports = {
    log,
    uuid,
    clamp,
    error,
};
