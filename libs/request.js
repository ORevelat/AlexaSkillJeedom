'use strict';

const querystring = require('querystring'); 
const https = require('https');

/**
 * Send an HTTPS request and receive a response
 */
module.exports = function request(opts, queryParams) {
	return new Promise((resolve, reject) => {

		var postData = querystring.stringify(queryParams);

		opts.method = 'POST';
		opts.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		};
		opts.agent = new https.Agent({keepAlive: true});

		const req = https.request(opts, (res) => {
			let body = '';
			res.on('data', (d) => {
				body += d;
			});
			res.on('end', () => {
				if (res.statusCode !== 200) 
					return reject(new Error(`Unsuccessful request [${res.statusCode}]`));
				return (opts.json) ? resolve(JSON.parse(body)) : resolve(body);
			});
			res.on('error', (err) => {
				return reject(err);
			});
		});
		
		req.on('error', (err) => {
			return reject(err);
		});
		req.write(postData);
		req.end();

	});
};
