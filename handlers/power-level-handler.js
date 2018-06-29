'use strict';

const utils = require('../libs/utils');
const res = require('../libs/responses');

module.exports = function powerLevelHandler(jeedom, request) {
	const correlationToken = request.directive.header.correlationToken;
	const directive = request.directive.header.name || 'unknown';
	const payload = request.directive.payload;
	
	const [endpointType, endpointId] = request.directive.endpoint.endpointId.split('-');

	return jeedom.getById(endpointId)
        .then((device) => changePower(device, directive, payload, jeedom))
        .then((props) => res.createResponseObj(props, endpointId, correlationToken));
}

function changePower(device, directive, payload, jeedom) {
	if (device.type !== 'dimmer') {
		return Promise.reject(utils.error('INVALID_VALUE', `Directive is not supported for this device: ${device.id}`));
	}

	// Set or Adjust
	let action = null;
	if (directive === 'SetPowerLevel') {
		action = setPowerLevel(device, payload, jeedom);
	}
	else if (directive === 'AdjustPowerLevel') {
		action = adjustPowerLevel(device, payload, jeedom);
	}
	else {
	  return Promise.reject(utils.error('INVALID_DIRECTIVE', `Unsupported directive: ${directive}`));
  }

  return action
  	.then((level) => {
		return [
			res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
			res.createContextProperty('Alexa.PowerLevelController', 'powerLevel', Number(level), 1000)
		];
	});
}

function setPowerLevel(device, payload, jeedom) {
	return jeedom.dimLight(device, utils.clamp(payload.powerLevel, 0, 99))
	  		.then(() => payload.brightness);
}

function adjustPowerLevel(device, payload, jeedom) {
	return jeedom.getDimLevel(device.cmd.dim)
		.then((level) => {
			const powerLevel = utils.clamp(Number(level) + payload.powerLevelDelta, 0, 99);
			return jeedom.dimLight(device, powerLevel).then(() => powerLevel);
		});
}
