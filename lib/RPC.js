"use strict";

const amqp = require('amqplib');
const uuid = require('node-uuid');

class RPC {
    constructor(opts) {
        if (!opts) {
            opts = {};
        }

        if (!opts.outputQueue) {
            opts.outputQueue = {};
        }

        if (!opts.inputQueue) {
            opts.inputQueue = {};
        }

        if (!opts.outputQueue.name) {
            opts.outputQueue.name = `rpc_output:${this.uuid()}`;
        }

        if (!opts.inputQueue.name) {
            opts.inputQueue.name = 'rpc_input';
        }

        this._opts = opts || {};
    }

    uuid() {
        return uuid.v1();
    }

    get outputQueue() {
        return  this._opts.outputQueue;
    }

    get inputQueue() {
        return this._opts.inputQueue;
    }

    static init(opts) {
        let rpc = new this(opts);

        return rpc.init().then(() => rpc);
    }

    getConnection() {
        return Promise.resolve()
        .then(() => this._connection || amqp.connect(this._opts.url))
        .then(connection => {
            this._connection = connection;
            return connection;
        });
    }

    getChannel() {
        return Promise.resolve()
        .then(() => this._channel || this.getConnection().then( connection => connection.createChannel() ))
        .then(channel => {
            this._channel = channel;
            return channel;
        });
    }
}

module.exports = RPC;