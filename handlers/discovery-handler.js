'use strict';

const utils = require('../libs/utils');
const res = require('../libs/responses');

module.exports = function discoveryHandler(jeedom) {
	return jeedom.getControllerInfo()
	  .then((results) => collectEndpoints(results))
	  .then((endpoints) => res.createDiscoveryResponseObj(endpoints));
};

function collectEndpoints(results) {
	let endpoints = [];
	
	results.forEach((device) => {
		endpoints.push(createEndpointFromDevice(device));
	});

	return endpoints.filter((e) => e);
}

function createEndpointFromDevice(device) {
	switch (device.type)
	{
		case 'dimmer':
			return createDimmerEndpoint(device);
		case 'switch':
			return createSwitchEndpoint(device);
		case 'temp':
			return createTemperatureSensorEndpoint(device);
		default:
			return null;
	}
}

function createDimmerEndpoint(device) {
	const endpoint = createStandardDeviceEndpointProps(device);
	endpoint.capabilities = [
		createDiscoveryCapability('Alexa'),
		createDiscoveryCapability('Alexa.EndpointHealth', ['connectivity']),
		createDiscoveryCapability('Alexa.PowerController', ['powerState']),
	];

	if (device.categories == 'LIGHT') {
		endpoint.capabilities.push(createDiscoveryCapability('Alexa.BrightnessController', ['brightness']));
	}
	else {
		endpoint.capabilities.push(createDiscoveryCapability('Alexa.PowerLevelController', ['powerLevel']));
	}

	// if we have temperature sensor add it
	// allow to say 
	//    alexa turn on the living room
	//    alexa what is the temperature in the living room
	if (device.cmd.temp) {
		endpoint.capabilities.push(createDiscoveryCapability('Alexa.TemperatureSensor', ['temperature']));
	}

	return endpoint;
}

function createSwitchEndpoint(device) {
	const endpoint = createStandardDeviceEndpointProps(device);
	endpoint.capabilities = [
		createDiscoveryCapability('Alexa'),
		createDiscoveryCapability('Alexa.EndpointHealth', ['connectivity']),
		createDiscoveryCapability('Alexa.PowerController', ['powerState'])
	];

	// if we have temperature sensor add it
	if (device.cmd.temp) {
		endpoint.capabilities.push(createDiscoveryCapability('Alexa.TemperatureSensor', ['temperature']));
	}
	
	return endpoint;
}

function createTemperatureSensorEndpoint(device) {
	const endpoint = createStandardDeviceEndpointProps(device);
	endpoint.capabilities = [
		createDiscoveryCapability('Alexa'),
		createDiscoveryCapability('Alexa.EndpointHealth', ['connectivity']),
		createDiscoveryCapability('Alexa.TemperatureSensor', ['temperature']),
	];

	return endpoint;
}

function createStandardDeviceEndpointProps(device) {
	return {
		endpointId: `device-${device.id}`,
		manufacturerName: 'Jeedom',
		friendlyName: sanitizeFriendlyName(device.name),
		description: device.description,
		displayCategories: [device.categories],
		cookie: {
			room: device.roomName || 'none'
		}
	};
}

function createDiscoveryCapability(iface, supported) {
	const capability = {
	  type: 'AlexaInterface',
	  interface: iface,
	  version: '3'
	};
	if (supported) {
	  capability.properties = {
		supported: supported.map((s) => ({name: s})),
		retrievable: true,
		proactivelyReported: false
	  };
	}
	return capability;
}

function sanitizeFriendlyName(name) {
	return name.replace(/[-_]/g, ' ').replace(/[^a-zA-Z0-9 ]/g, '');
}
