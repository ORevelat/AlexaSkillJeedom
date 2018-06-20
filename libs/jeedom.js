'use strict';

const utils = require('./utils');
const request = require('./request');

class Jeedom {
    constructor(cfg = {}) {
        this.Config = {
            host: cfg.config.jeedom.host,
            port: cfg.config.jeedom.port,
            path: cfg.config.jeedom.path,
            apikey: cfg.config.jeedom.apikey
        };
        this.Commands = cfg.config.cmds;
    }

    getDeviceById(deviceId) {
        for (var i = 0; i < this.Commands.length; ++i) {
            if (this.Commands[i].id == deviceId)
            return this.Commands[i];
        }

        return null;
    }

    getById(deviceId) {
        const device = this.Commands.find((c) => c.id == deviceId);
        if (!device) {
            return Promise.reject(utils.error('NO_SUCH_ENDPOINT', `The device was not found: ${deviceId}`));
        }
        return Promise.resolve(device);
    }

    getServerInfo() {
        return Promise.resolve(this.Config);
    }

    getControllerInfo() {
        return Promise.resolve(this.Commands);
    }

    getDeviceStatus(device) {
        return this.dataRequest(device.cmd.state);
    }

    turnSwitchOn(device) {
        return this.dataRequest(device.cmd.on, false);
    }

    turnSwitchOff(device) {
        return this.dataRequest(device.cmd.off, false);
    }

    dimLight(device, value) {
        return this.dataRequestSlider(device.cmd.dim, value, false);
    }

    getDimLevel(device) {
        return this.getDeviceStatus(device);
    }

    dataRequest(cmdid, json = true) {
        return this.getServerInfo()
            .then((cfg) => {
                return request({
                    host: cfg.host,
                    port: cfg.port,
                    path: cfg.path,
                    json
                    }, {
                     'apikey': cfg.apikey,
                     'type': 'cmd',
                     'id': cmdid
                    });
            });
    }
    
    dataRequestSlider(cmdid, sliderval, json = true) {
        return this.getServerInfo()
            .then((cfg) => {
                return request({
                    host: cfg.host,
                    port: cfg.port,
                    path: cfg.path,
                    json
                    }, {
                     'apikey': cfg.apikey,
                     'type': 'cmd',
                     'id': cmdid,
                     'slider': sliderval
                    });
            });
    }
}

module.exports = Jeedom;
