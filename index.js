'use strict';

const config = require('./libs/config');
const utils = require('./libs/utils');
const responses = require('./libs/responses');
const Jeedom = require('./libs/jeedom');

const discoveryHandler = require('./handlers/discovery-handler');
const reportStateHandler = require('./handlers/reportstate-handler');
const powerHandler = require('./handlers/power-handler');
const brightnessHandler = require('./handlers/brightness-handler');

exports.handler = function (request, context, cb) {

	function callback(err, res) {
		utils.log('DEBUG', `Response: ${JSON.stringify(res)}`);
		cb(err, res);
	}

	const jeedom = new Jeedom( {
		config
	});

	const namespace = request.directive.header.namespace || 'unknown';
	const directive = request.directive.header.name || 'unknown';

	utils.log('DEBUG', `${namespace}::${directive} Request: ${JSON.stringify(request)}`);

	let handler = null;

	if (namespace === 'Alexa.Discovery' && directive === 'Discover') {
		handler = discoveryHandler(jeedom, request, context, callback);
	}
	else if (namespace === 'Alexa' && directive === 'ReportState') {
		handler = reportStateHandler(jeedom, request, context, callback);
	}
	else if (namespace === 'Alexa.PowerController' && ['TurnOn', 'TurnOff'].indexOf(directive) !== -1) {
		handler = powerHandler(jeedom, request, context, callback);
	}
	else if (namespace === 'Alexa.BrightnessController' && ['SetBrightness', 'AdjustBrightness'].indexOf(directive) !== -1) {
		handler = brightnessHandler(jeedom, request, context, callback);
	}
   else {
		handler = Promise.reject( 
			utils.error('INVALID_DIRECTIVE', `Unsupported namespace/directive: ${namespace}/${directive}`)
		);
	}

	handler
		.then((response) => callback(null, response))
		.catch((err) => {
			const correlationToken = request.directive.header.correlationToken;
			const endpointId = request.directive.endpoint && request.directive.endpoint.endpointId;
			callback(null, responses.createErrorResponse(err, correlationToken, endpointId));
		});
};
