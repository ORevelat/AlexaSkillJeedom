'use strict';

const utils = require('../libs/utils');
const res = require('../libs/responses');

module.exports = function brightnessHandler(jeedom, request) {
	const correlationToken = request.directive.header.correlationToken;
	const directive = request.directive.header.name || 'unknown';
	const payload = request.directive.payload;
	
	const endpointId = request.directive.endpoint.endpointId;

	return jeedom.getById(endpointId)
        .then((device) => changeBrightness(device, directive, payload, jeedom))
        .then((props) => res.createResponseObj(props, endpointId, correlationToken));
}

function changeBrightness(device, directive, payload, jeedom) {
	if (device.type !== 'dimlight') {
		return Promise.reject(utils.error('INVALID_VALUE', `Directive is not supported for this device: ${device.id}`));
	}

	// Set or Adjust
	let action = null;
	if (directive === 'SetBrightness') {
		action = setBrightness(device, payload, jeedom);
	}
	else if (directive === 'AdjustBrightness') {
		action = adjustBrightness(device, payload, jeedom);
	}
	else {
	  return Promise.reject(utils.error('INVALID_DIRECTIVE', `Unsupported directive: ${directive}`));
  }

  return action
  	.then((level) => {
		return [
			res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
			res.createContextProperty('Alexa.BrightnessController', 'brightness', Number(level), 1000)
		];
	});
}

function setBrightness(device, payload, jeedom) {
	return jeedom.dimLight(device, utils.clamp(payload.brightness, 0, 99))
	  		.then(() => payload.brightness);
}

function adjustBrightness(device, payload, jeedom) {
	return jeedom.getDimLevel(device)
		.then((level) => {
			const brightness = utils.clamp(Number(level) + payload.brightnessDelta, 0, 99);
			return jeedom.dimLight(device, brightness).then(() => brightness);
		});
}
