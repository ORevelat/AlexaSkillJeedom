'use strict';

const utils = require('./utils');

function createContextProperty(namespace, name, value, uncertaintyMs = 0) {
    const property = {
        namespace,
        name,
        value,
        timeOfSample: new Date().toISOString(),
        uncertaintyInMilliseconds: uncertaintyMs
    };
    return property;
}

function createErrorResponse(err, correlationToken, endpointId) {
    const errType = err.type || 'INTERNAL_ERROR';
    utils.log(errType, err.message + (err.stack || ''));
    const response = {
        event: {
            header: {
                namespace: 'Alexa',
                name: 'ErrorResponse',
                messageId: utils.uuid(),
                payloadVersion: '3'
            },
            payload: {
                type: errType,
                message: err.message
            }
        }
    };
    if (correlationToken) {
        response.event.header.correlationToken = correlationToken;
    }
    if (endpointId) {
        response.event.endpoint = {endpointId};
    }
    if (err.validRange) {
        response.event.payload.validRange = err.validRange;
    }
    return response;
}

function createResponseObj(props, endpointId, correlationToken, namespace = 'Alexa', name = 'Response') {
    const response = {
        context: {
            properties: props
        },
        event: {
            header: {
                namespace,
                name,
                payloadVersion: '3',
                messageId: utils.uuid()
            },
            endpoint: {
                endpointId
            },
            payload: {}
        }
    };
    
    if (correlationToken) {
        response.event.header.correlationToken = correlationToken;
    }
    
    return response;
}

function createDiscoveryResponseObj(endpoints) {
    return {
      event: {
        header: {
          namespace: 'Alexa.Discovery',
          name: 'Discover.Response',
          payloadVersion: '3',
          messageId: utils.uuid()
        },
        payload: {
          endpoints: endpoints || []
        }
      }
    };
  }

  module.exports = {
    createContextProperty,
    createErrorResponse,
    createResponseObj,
    createDiscoveryResponseObj
  };


  