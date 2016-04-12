"use strict";

const RPC  = require('./RPC');

class Server extends RPC {
    init() {
        this._handlers = {};

        return this.getChannel()
        .then(channel => {
            return channel.assertQueue(this.inputQueue.name, this.inputQueue)
            .then(() => this._listen(channel));
        });
    }

    _listen(channel) {
        channel.consume(this.inputQueue.name, message => {
            let handlerName = message.properties.headers.handler;
            let handler     = this._handlers[ handlerName ];

            if (!handler) {
                console.error('Unknown handler', handlerName);
                return channel.nack(message);
            }

            Promise.resolve().then(() => {
                return handler(message); //TODO
            })
            .then(responseData => {
                channel.ack(message);

                let outputQueue = message.properties.replyTo;
                let buffer      = new Buffer( JSON.stringify(responseData) );

                channel.sendToQueue(outputQueue, buffer, {
                    messageId:     this.uuid(),
                    correlationId: message.properties.messageId,

                    type:            'response',
                    contentType:     'application/json',
                    timestamp:       Date.now(),

                    headers: {
                        handler: handlerName
                    }
                });
            });

        });
    }

    addHandler(handlerName, handler) {
        this._handlers[ handlerName ] = handler;
    }
}

module.exports = Server;