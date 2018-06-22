'use strict';

const utils = require('../libs/utils');
const res = require('../libs/responses');

module.exports = function reportStateHandler(jeedom, request) {
	const correlationToken = request.directive.header.correlationToken;
	const endpointId = request.directive.endpoint.endpointId;
	
	return jeedom.getById(endpointId)
		.then((device) => reportState(device, jeedom))
		.then((props) => res.createResponseObj(props, endpointId, correlationToken, 'Alexa', 'StateReport'));
};

function reportState(device, jeedom) {
	if (device.cmd.temp && device.cmd.state) {
		return jeedom.getDeviceStatusAndTemperature(device)
			.then(([dStatus, dTemp]) => createDeviceStateContextProps(device, dStatus, dTemp));
	}
	else if (device.cmd.state) {
		return jeedom.getDeviceStatus(device)
			.then((dStatus) => createDeviceStateContextProps(device, dStatus));
	}

	return Promise.reject(utils.error('NO_SUCH_ENDPOINT', `Unknown cmd state for device id=${device.id}`));
}

function createDeviceStateContextProps(device, status, temp) {
	switch (device.type) {
		case 'dimlight': return createDimmerContextProps(device, status, temp);
		case 'light': return createSwitchContextProps(device, status, temp);
		case 'temp': return createTemperatureSensorContextProps(device, status);
		default: return [];
	}
}

function createDimmerContextProps(device, status, temp) {
	let context = [
		res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
		res.createContextProperty('Alexa.PowerController', 'powerState', Number(status) > 0 ? 'ON' : 'OFF'),
		res.createContextProperty('Alexa.BrightnessController', 'brightness', Number(status))
	];

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
