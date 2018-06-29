'use strict';

const utils = require('../libs/utils');
const res = require('../libs/responses');

module.exports = function reportStateHandler(jeedom, request) {
	const correlationToken = request.directive.header.correlationToken;

	const [endpointType, endpointId] = request.directive.endpoint.endpointId.split('-');
	
	return jeedom.getById(endpointId)
		.then((device) => reportState(device, jeedom))
		.then((props) => res.createResponseObj(props, endpointId, correlationToken, 'Alexa', 'StateReport'));
};

function reportState(device, jeedom) {
	if (device.cmd.state) {
		if (device.cmd.temp) {
			return Promise.all([jeedom.getDeviceStatus(device.cmd.state), jeedom.getDeviceStatus(device.cmd.temp)])
				.then(([dStatus, dTemp]) => createDeviceStateContextProps(device, dStatus, dTemp));
		}
		else {
			return jeedom.getDeviceStatus(device.cmd.state)
				.then((dStatus) => createDeviceStateContextProps(device, dStatus));
		}
	}

	return Promise.reject(utils.error('NO_SUCH_ENDPOINT', `Unknown cmd state for device id=${device.id}`));
}

function createDeviceStateContextProps(device, status, temp) {
	switch (device.type) {
		case 'dimmer': return createDimmerContextProps(device, status, temp);
		case 'switch': return createSwitchContextProps(device, status, temp);
		case 'temp': return createTemperatureSensorContextProps(device, status);
		default: return [];
	}
}

function createDimmerContextProps(device, status, temp) {
	let context = [
		res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
		res.createContextProperty('Alexa.PowerController', 'powerState', Number(status) > 0 ? 'ON' : 'OFF'),
	];

	if (device.categories == 'LIGHT') {
		res.createContextProperty('Alexa.BrightnessController', 'brightness', Number(status));
	}
	else {
		res.createContextProperty('Alexa.PowerLevelController', 'powerLevel', Number(status));
	}

	if (temp) {
		const temperature = {value: Number(temp), scale: 'CELSIUS'};
		context.push(res.createContextProperty('Alexa.TemperatureSensor', 'temperature', temperature));
	}

	return context;
}

function createSwitchContextProps(device, status, temp) {
	let context = [
		res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
		res.createContextProperty('Alexa.PowerController', 'powerState', Number(status) > 0 ? 'ON' : 'OFF')
	];

	if (temp) {
		const temperature = {value: Number(temp), scale: 'CELSIUS'};
		context.push(res.createContextProperty('Alexa.TemperatureSensor', 'temperature', temperature));
	}

	return context;
}

function createTemperatureSensorContextProps(device, status) {
	const temperature = {value: Number(status), scale: 'CELSIUS'};

	return [
		res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
		res.createContextProperty('Alexa.TemperatureSensor', 'temperature', temperature)
	];
}
