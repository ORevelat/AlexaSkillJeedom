'use strict';
const utils = require('../libs/utils');
const res = require('../libs/responses');

module.exports = function powerHandler(jeedom, request) {
    const correlationToken = request.directive.header.correlationToken;
    const directive = request.directive.header.name || 'unknown';

    const endpointId = request.directive.endpoint.endpointId;

    return jeedom.getById(endpointId)
        .then((device) => changePower(device, directive, jeedom))
        .then((props) => res.createResponseObj(props, endpointId, correlationToken));
};

function changePower(device, directive, jeedom) {
    let action = null;
    if (directive === 'TurnOn') {
        action = jeedom.turnSwitchOn(device).then(() => 1);
    }
    else if (directive === 'TurnOff') {
        action = jeedom.turnSwitchOff(device).then(() => 0);
    }
    else {
        return Promise.reject(utils.error('INVALID_DIRECTIVE', `Unsupported directive: ${directive}`));
    }

    return action
        .then((state) => {
            console.log('state: ' + state);
            return [
                res.createContextProperty('Alexa.EndpointHealth', 'connectivity', {value: 'OK'}),
                res.createContextProperty('Alexa.PowerController', 'powerState', Number(state) === 1 ? 'ON' : 'OFF', 1000)
            ];
    });
}
