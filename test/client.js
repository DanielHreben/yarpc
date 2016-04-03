"use strict";

const Client = require('..').Client;

Client.init().then(client => {
    return Promise.all([
        client.call('wait1000', {a: 1}),
        client.call('wait500',  {a: 2}),
    ]);
})
.then(response => {
    console.log(response);
});