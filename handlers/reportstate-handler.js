'use strict';

const utils = require('../libs/utils');
const config = require('../libs/config');
const res = require('../libs/responses');

module.exports = function reportStateHandler(jeedom, request) {
    const correlationToken = request.directive.header.correlationToken;
    const endpointId = request.directive.endpoint.endpointId;
    
    return jeedom.getById(endpointId)
        .then((device) => reportState(device, jeedom))
        .then((props) => res.createResponseObj(props, endpointId, correlationToken, 'Alexa', 'StateReport'));
};

function reportState(device, jeedom) {
    if (device.cmd.state) {
        return jeedom.getDeviceStatus(device)
            .then((dStatus) => createDeviceStateContextProps(device, dStatus));
    }

    return Promise.reject(utils.error('NO_SUCH_ENDPOINT', `Unknown cmd state for device id=${device.id}`));
}

function createDeviceStateContextProps(device, status) {
    switch (device.type) {
        case 'light': return createSwitchContextProps(device, status);
        default: return [];
    }
}

function createSwitchContextProps(device, status) {
    return [
        res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
        res.createContextProperty('Alexa.PowerController', 'powerState', Number(status) > 0 ? 'ON' : 'OFF')
    ];
}
  