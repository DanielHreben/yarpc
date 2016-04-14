"use strict";

const RPC  = require('./RPC');

class Client extends RPC {
    init() {
        this._callbacks = [];

        return this.getChannel().then(channel => {
            return Promise.all([
                channel.assertQueue(this.inputQueue.name, this.inputQueue),
                channel.assertQueue(this.outputQueue.name, this.outputQueue)
            ])
            .then(() => this._listen(channel));
        });

    }

    _listen(channel) {
        channel.consume( this.outputQueue.name, message => {

            let requestId = message.properties.correlationId;
            let callback  = this._callbacks[ requestId ];

            if (!callback) {
                console.error('Unknown response', requestId);
                return channel.nack(message);
            }

            let responseData = JSON.parse( message.content.toString() );
            channel.ack(message);

            return callback.resolve(responseData);
        });
    }

    call(handlerName, requestData) {
        let requestId = this.uuid();

        return this.getChannel().then(channel => {
            let buffer = new Buffer( JSON.stringify(requestData) );

            channel.sendToQueue(this.inputQueue.name, buffer, {
                replyTo:       this.outputQueue.name,
                messageId:     requestId,

                type:            'request',
                contentType:     'application/json',
                timestamp:       Date.now(),

                headers: {
                    handler: handlerName
                }
            });

            return new Promise((resolve, reject) => {
                this._callbacks[ requestId ] = {
                    resolve: resolve,
                    reject: reject
                };
            });
        });
    }
}

module.exports = Client;