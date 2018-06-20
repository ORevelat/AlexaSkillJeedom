'use strict';

const config = require('./libs/config');
const Jeedom = require('./libs/jeedom');
const responses = require('./libs/responses');

const discoveryHandler = require('./handlers/discovery-handler');
const reportStateHandler = require('./handlers/reportstate-handler');
const powerHandler = require('./handlers/power-handler');
const brightnessHandler = require('./handlers/brightness-handler');

const jeedom = new Jeedom( {
    config,
});

var callback = function(e, m) {
    console.log(JSON.stringify(m));
};

let request = { 
    directive: {
        header: {
            correlationToken: 'the-token-aabb',
            name: 'AdjustBrightness'
        },
        endpoint: {
            endpointId: 51
        },
        payload: {
            brightnessDelta: -10
        }
    }
};
let context = null;

//let handler = discoveryHandler(jeedom, request, context, callback);
let handler = reportStateHandler(jeedom, request, context, callback);
//let handler = powerHandler(jeedom, request, context, callback);
//let handler = brightnessHandler(jeedom, request, context, callback);

handler.then((response) => callback(null, response))
        .catch((err) => {
            const correlationToken = request.directive.header.correlationToken;
            const endpointId = request.directive.endpoint && request.directive.endpoint.endpointId;
            callback(null, responses.createErrorResponse(err, correlationToken, endpointId));
});
