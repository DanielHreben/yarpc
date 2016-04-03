"use strict";

const Server  = require('..').Server;
const Promise = require('bluebird');

Server.init().then(server => {
    server.addHandler('wait1000', function(message) {
        return Promise.delay(1000).then(() => {
            return {
                dalay: 1000,
                timestamp: new Date().valueOf()
            };
        });
    });

    server.addHandler('wait500', function(message) {
        return Promise.delay(500).then(() => {
            return {
                dalay: 500,
                timestamp: new Date().valueOf()
            };
        });
    });
});