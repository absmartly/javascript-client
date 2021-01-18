/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["absmartly"] = factory();
	else
		root["absmartly"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/browser.js":
/*!************************!*\
  !*** ./src/browser.js ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports.default = void 0;\n\nvar _client = _interopRequireDefault(__webpack_require__(/*! ./client */ \"./src/client.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar _default = {\n  Client: _client.default\n};\nexports.default = _default;\n\n//# sourceURL=webpack://absmartly/./src/browser.js?");

/***/ }),

/***/ "./src/client.js":
/*!***********************!*\
  !*** ./src/client.js ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports.default = void 0;\n\nvar _isomorphicUnfetch = _interopRequireDefault(__webpack_require__(/*! isomorphic-unfetch */ \"./node_modules/isomorphic-unfetch/browser.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n// eslint-disable-line no-shadow\nvar Client = /*#__PURE__*/function () {\n  function Client(opts) {\n    _classCallCheck(this, Client);\n\n    this._opts = Object.assign({\n      endpoint: undefined,\n      apiKey: undefined,\n      environment: undefined,\n      agent: \"javascript-client\",\n      application: {\n        name: \"default\",\n        version: 0\n      },\n      retries: 5,\n      timeout: 500\n    }, opts);\n\n    for (var _i = 0, _arr = [\"apiKey\", \"endpoint\", \"environment\"]; _i < _arr.length; _i++) {\n      var key = _arr[_i];\n\n      if (key in this._opts && this._opts[key] !== undefined) {\n        var value = this._opts[key];\n\n        if (typeof value !== \"string\" || value.length === 0) {\n          throw new Error(\"Invalid '\".concat(key, \"' in options argument\"));\n        }\n      } else {\n        throw new Error(\"Missing '\".concat(key, \"' in options argument\"));\n      }\n    }\n\n    this._delay = Math.max(10, this._opts.timeout / (1 << this._opts.retries));\n  }\n\n  _createClass(Client, [{\n    key: \"createContext\",\n    value: function createContext(params) {\n      var body = {\n        agent: this._opts.agent,\n        environment: this._opts.environment,\n        application: params.application || this._opts.application,\n        units: params.units\n      };\n      return this.post(\"/context\", body);\n    }\n  }, {\n    key: \"publish\",\n    value: function publish(params) {\n      var body = {\n        agent: this._opts.agent,\n        environment: this._opts.environment,\n        guid: params.guid,\n        application: params.application || this._opts.application,\n        units: params.units\n      };\n\n      if (Array.isArray(params.goals) && params.goals.length > 0) {\n        body.goals = params.goals;\n      }\n\n      if (Array.isArray(params.exposures) && params.exposures.length > 0) {\n        body.exposures = params.exposures;\n      }\n\n      if (Array.isArray(params.attributes) && params.attributes.length > 0) {\n        body.attributes = params.attributes;\n      }\n\n      return this.put(\"/context\", body);\n    }\n  }, {\n    key: \"request\",\n    value: function request(method, path, body) {\n      var _this = this;\n\n      var url = \"\".concat(this._opts.endpoint).concat(path);\n\n      var tryOnce = function tryOnce() {\n        return (0, _isomorphicUnfetch.default)(url, {\n          method: method,\n          headers: {\n            \"Content-Type\": \"application/json\",\n            \"X-API-Key\": _this._opts.apiKey\n          },\n          body: JSON.stringify(body, null, 0)\n        }).then(function (response) {\n          if (!response.ok) {\n            var bail = response.status >= 400 && response.status < 500;\n            return response.text().then(function (text) {\n              var error = new Error(text !== null && text.length > 0 ? text : response.statusText);\n              error._bail = bail;\n              return Promise.reject(error);\n            });\n          }\n\n          return response.json();\n        });\n      };\n\n      var wait = function wait(ms) {\n        return new Promise(function (resolve) {\n          setTimeout(resolve, ms);\n        });\n      };\n\n      var tryWith = function tryWith(retries, timeout) {\n        var tries = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;\n        var waited = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;\n        return tryOnce().catch(function (reason) {\n          if (reason._bail || tries >= retries || waited >= timeout) {\n            return Promise.reject(reason);\n          }\n\n          var delay = (1 << tries) * _this._delay + 0.5 * Math.random() * _this._delay;\n\n          if (waited + delay > timeout) {\n            delay = timeout - waited;\n          }\n\n          return wait(delay).then(function () {\n            return tryWith(retries, timeout, tries + 1, waited + delay);\n          });\n        });\n      };\n\n      return tryWith(this._opts.retries, this._opts.timeout);\n    }\n  }, {\n    key: \"post\",\n    value: function post(path, body) {\n      return this.request(\"POST\", path, body);\n    }\n  }, {\n    key: \"put\",\n    value: function put(path, body) {\n      return this.request(\"PUT\", path, body);\n    }\n  }]);\n\n  return Client;\n}();\n\nexports.default = Client;\n\n//# sourceURL=webpack://absmartly/./src/client.js?");

/***/ }),

/***/ "./node_modules/isomorphic-unfetch/browser.js":
/*!****************************************************!*\
  !*** ./node_modules/isomorphic-unfetch/browser.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("module.exports = self.fetch || (self.fetch = __webpack_require__(/*! unfetch */ \"./node_modules/unfetch/dist/unfetch.module.js\").default || __webpack_require__(/*! unfetch */ \"./node_modules/unfetch/dist/unfetch.module.js\"));\n\n\n//# sourceURL=webpack://absmartly/./node_modules/isomorphic-unfetch/browser.js?");

/***/ }),

/***/ "./node_modules/unfetch/dist/unfetch.module.js":
/*!*****************************************************!*\
  !*** ./node_modules/unfetch/dist/unfetch.module.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* export default binding */ __WEBPACK_DEFAULT_EXPORT__; }\n/* harmony export */ });\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(e,n){return n=n||{},new Promise(function(t,r){var s=new XMLHttpRequest,o=[],u=[],i={},a=function(){return{ok:2==(s.status/100|0),statusText:s.statusText,status:s.status,url:s.responseURL,text:function(){return Promise.resolve(s.responseText)},json:function(){return Promise.resolve(s.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([s.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var l in s.open(n.method||\"get\",e,!0),s.onload=function(){s.getAllResponseHeaders().replace(/^(.*?):[^\\S\\n]*([\\s\\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+\",\"+t:t}),t(a())},s.onerror=r,s.withCredentials=\"include\"==n.credentials,n.headers)s.setRequestHeader(l,n.headers[l]);s.send(n.body||null)})}\n//# sourceMappingURL=unfetch.module.js.map\n\n\n//# sourceURL=webpack://absmartly/./node_modules/unfetch/dist/unfetch.module.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/browser.js");
/******/ })()
.default;
});