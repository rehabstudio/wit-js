# Node integration for Wit.ai [![npm](https://img.shields.io/npm/v/wit-js.svg)](https://www.npmjs.com/package/wit-js)

`wit-js` is an alternative Node integration for [Wit.ai](https://wit.ai) using
Promises and Events.

## Install

In your Node.js project, run:

```bash
npm install --save wit-js
```

## Quickstart

Run in your terminal:

```js
let Wit = require('wit-js');

client = new Wit.Client({apiToken: '<your-api-token>'});

client.message('Hello!', {})
    .then((response) => {
        console.log(response.entities);
    })
    .catch((err) => {
        console.error(err);
    });
```

## API


### Overview

The Wit module provides a Client class with the following methods:
* `message` - the Wit 
[message](https://wit.ai/docs/http/20160330#get-intent-via-text-link) API
* `converse` - the low-level Wit 
[converse](https://wit.ai/docs/http/20160330#converse-link) API
* `run` - a higher-level method to the Wit converse API
* `on` - a simple method to bind to events fired by the client

### Client class

The Client constructor requires a single options paramter, which may contain 
the following values:

* `apiToken` - the access token of your Wit instance, _**required**_
* `apiVersion` - the version of the Wit API you wish to targer, _**optional**_
* `apiRoot` - the base URL for the API, useful for proxying or targeting other 
implementations _**optional**_


#### .message(...)

The Wit [message](https://wit.ai/docs/http/20160330#get-intent-via-text-link) 
API.

Takes the following parameters:
* `message` - the text you want Wit.ai to extract the information from
* `context` - (optional) the object representing the session state

Example:
```js
client.message('Hello!', {})
    .then((response) => {
        console.log('Wit responded!');
        console.log(response.entities);
    })
    .catch((err) => {
        console.error(err);
    });
});
```

#### .run(...)

A higher-level method to the Wit converse API.

Takes the following parameters:
* `session` - a unique identifier describing the user session
* `message` - the text received from the user
* `context` - the object representing the session state

This method runs recursively and acts upon actions retrieved from the API, 
fire the relevant events where necessary. Use the `.on` method of the client to subscribe to events.

Example:
```js
client.on('msg', (data, context) => {
    console.log(`Wit said: ${data.msg}`);
});
client.run('my-session-id', 'what is the weather in London?', {});
```

#### .on(...)

Bind a listener to a Wit event. This interface is functionally identical to 
Node's EventEmitter.

Takes the following parameters:
* `event` - the name of the event to which to bind
* `listener` - the function to be called when the event is emitted

There are a total of 4 default events that will be emitted by the Client, they
are:
* `merge` - emitted as the first step of every bot action
* `msg` - emitted when the bot engine "says" something
* `stop` - the final action of the bot's "conversation", use this for any clean up
* `error` - emitted if the bot engine encounters a problem

On top of these four, any actions configured within the bot engine will be 
emitted in the format `action:<action-name>`, for example 
`action:fetch-weather`.

Examples:
```js
client.on('merge', (data, context) => {
    console.log(context);
});
client.on('action:query-database', (data, context) => {
    // maybe you are querying a mongo collection
    myCollection.find(context.query);
});
```

#### .converse(...)

The low-level Wit [converse](https://wit.ai/docs/http/20160330#converse-link) 
API.

Takes the following parameters:
* `session` - a unique identifier describing the user session
* `message` - the text received from the user
* `context` - the object representing the session state

Example:
```js

client.run('my-session-id', 'what is the weather in London?', {})
    .then((response) => {
        console.log('Wit responded!');
        console.log(response.entities);
    })
    .catch((err) => {
        console.error(err);
    });
```