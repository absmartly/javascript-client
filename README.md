# A/B Smartly Client [![npm version](https://badge.fury.io/js/%40absmartly%2Fjavascript-client.svg)](https://badge.fury.io/js/%40absmartly%2Fjavascript-client)

A/B Smartly - JavaScript client for the A/B Smartly Collector.

**Note:** This package implements a low-level interface to the A/B Smartly Collector Service and is intended to be a building block for higher-level SDKs.
If you are looking for the higher-level SDKs, please have a look at one of the following:

- [JavaScript SDK](https://www.github.com/absmartly/javascript-sdk)
- [PHP SDK](https://www.github.com/absmartly/php-sdk)

## Compatibility

The A/B Smartly Javascript Client is an isomorphic library for Node.js (CommonJS and ES6) and browsers (UMD).

It's supported on Node.js version 6.x and npm 3.x or later.

It's supported on IE 10+ and all the other major browsers.

**Note**: IE 10 does not natively support Promises.
If you target IE 10, you must include a polyfill like [es6-promise](https://www.npmjs.com/package/es6-promise) or [rsvp](https://www.npmjs.com/package/rsvp).

## Installation

#### npm

```shell
npm install @absmartly/javascript-client --save
```

#### Import in your Javascript application
```javascript
const absmartly = require('@absmartly/javascript-client');
// OR with ES6 modules:
import absmartly from '@absmartly/javascript-client';
```


#### Directly in the browser
You can include an optimized and pre-built package directly in your HTML code through [unpkg.com](https://www.unpkg.com).

Simply add the following code to your `head` section to include the latest published version.
```html
    <script src="https://unpkg.com/@absmartly/javascript-client/dist/absmartly.min.js"></script>
```

## Getting Started

Please follow the [installation](#installation) instructions before trying the following code:

#### Initialization
```javascript
// somewhere in your application initialization code
const client = new absmartly.Client({
    endpoint: 'https://sandbox-api.absmartly.com/v1',
    apiKey: process.env.ABSMARTLY_API_KEY,
    environment: process.env.NODE_ENV,
    application: process.env.APPLICATION_NAME,
});
```

## About A/B Smartly
**A/B Smartly** is the leading provider of state-of-the-art, on-premises, full-stack experimentation platforms for engineering and product teams that want to confidently deploy features as fast as they can develop them.
A/B Smartly's real-time analytics helps engineering and product teams ensure that new features will improve the customer experience without breaking or degrading performance and/or business metrics.

### Have a look at our growing list of clients and SDKs:
- [JavaScript SDK](https://www.github.com/absmartly/javascript-sdk)
- [PHP SDK](https://www.github.com/absmartly/php-sdk)
