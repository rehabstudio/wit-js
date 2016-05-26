'use strict';

let qs = require('querystring');
let fetch = require('node-fetch');
let Events = require('promise-events');

class WitClient {
    constructor(opts) {
        this.opts = Object.assign({
            apiToken: '',
            apiRoot: 'https://api.wit.ai',
            apiVersion: '20160516'
        }, opts);
        this._makeHeaders();
        this._events = new Events();
    }

    on(event, ...args) {
        return this._events.on(event, ...args);
    }

    emit(event, ...args) {
        return this._events.emit(event, ...args);
    }

    message(message, context) {
        return this._request({
            path: '/message',
            method: 'GET',
            params: {
                'q': message,
                'context': context
            }
        });
    }

    converse(session, message, context) {
        let params = {'session_id': session};

        if (message) {
            params.q = message;
        }
        return this._request({
            path: '/converse',
            method: 'POST',
            params: params,
            body: context
        });
    }

    run(session, message, context) {
        return this.converse(session, message, context)
        .then((response) => {
            let event = response.type;

            if (event === 'action') {
                event += ':' + response.action;
            }

            return this.emit(event, response, context)
            .then(() => {
                if (event === 'error' || event === 'stop') {
                    return context;
                } else {
                    return this.run(session, null, context);
                }
            });
        });
    }

    _makeHeaders() {
        this.headers = {
            'Authorization': 'Bearer ' + this.opts.apiToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

    _request(opts) {
        let params = Object.assign(
            {v: this.opts.apiVersion},
            opts.params
        );
        let url = `${this.opts.apiRoot}${opts.path}?${qs.stringify(params)}`;
        let body = opts.body ? JSON.stringify(opts.body) : null;

        return fetch(url, {
            method: opts.method,
            headers: this.headers,
            body: body
        })
        .then((response) => Promise.all([
            response.status,
            response.json()
        ]))
        .then(([status, data]) => {
            if (data instanceof Error) {
                throw data;
            }

            if (status !== 200) {
                throw `${status}: ${data.body}`;
            }

            return data;
        })
        .catch((err) => console.log('ERROR: ', err));
    }
}

module.exports = {
    Client: WitClient
};
