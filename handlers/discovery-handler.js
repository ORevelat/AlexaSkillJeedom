'use strict';

const utils = require('../libs/utils');
const config = require('../libs/config');
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
        case 'light':
            return createDimmerEndpoint(device);
        default:
            return null;
    }
}

function createDimmerEndpoint(device) {
    console.log(`[DEBUG] Jeedom adding light device id=${device.id} / name=${device.name}`);

    const endpoint = createStandardDeviceEndpointProps(device);
    endpoint.capabilities = [
        createDiscoveryCapability('Alexa'),
        createDiscoveryCapability('Alexa.EndpointHealth', ['connectivity']),
        createDiscoveryCapability('Alexa.PowerController', ['powerState']),
    ];

    if (device.type == 'dimlight')
        endpoint.capabilities.push(createDiscoveryCapability('Alexa.BrightnessController', ['brightness']));
    else
        endpoint.capabilities.push(createDiscoveryCapability('Alexa.PowerLevelController', ['powerLevel']));
    
    return endpoint;
}

function createStandardDeviceEndpointProps(device) {
    return {
        endpointId: `${device.id}`,
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
