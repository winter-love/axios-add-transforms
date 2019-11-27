(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "lodash", "./utils", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var lodash_1 = require("lodash");
    var utils_1 = require("./utils");
    tslib_1.__exportStar(require("./utils"), exports);
    var Transforms = /** @class */ (function () {
        /**
         * Save Transforms options
         * @param options
         */
        function Transforms(options) {
            if (options === void 0) { options = {}; }
            /**
             *  axios interceptor request & resolve id
             */
            this._interceptorId = null;
            /**
             * matcher cache
             */
            this._cache = new Map();
            this._options = tslib_1.__assign({}, options);
        }
        Object.defineProperty(Transforms.prototype, "first", {
            /**
             * first options
             */
            get: function () {
                return this._options.first;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transforms.prototype, "final", {
            /**
             * get final options
             */
            get: function () {
                return this._options.final;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transforms.prototype, "maxCache", {
            get: function () {
                return this._options.maxCache;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transforms.prototype, "context", {
            /**
             * get context options
             * run context function and return context
             */
            get: function () {
                var _a = this._options.context, context = _a === void 0 ? function () { return ({}); } : _a;
                return context();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transforms.prototype, "matchers", {
            /**
             * get matchers options
             * make sure matchers is an array
             */
            get: function () {
                var _a = this._options.matchers, matchers = _a === void 0 ? [] : _a;
                return matchers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transforms.prototype, "margeResponse", {
            /**
             * get margeResponse options
             */
            get: function () {
                var margeResponse = this._options.margeResponse;
                return margeResponse;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Eject transform
         * eject request & response which is applied by Transforms.applyTransform
         * @param axios
         */
        Transforms.prototype.ejectTransform = function (axios) {
            if (!this._interceptorId) {
                return false;
            }
            axios.interceptors.request.eject(this._interceptorId.request);
            axios.interceptors.response.eject(this._interceptorId.response);
            this._interceptorId = null;
            return true;
        };
        /**
         * Apply transform
         * @param axios
         */
        Transforms.prototype.applyTransform = function (axios) {
            if (this._interceptorId) {
                return this._interceptorId;
            }
            // request & response transform
            var requestId = axios.interceptors
                .request.use(this._requestInterceptors());
            // error transform
            var responseId = axios.interceptors
                .response.use(function (res) { return (res); }, this._errorInterceptors(axios));
            this._interceptorId = {
                request: requestId,
                response: responseId,
            };
            return this._interceptorId;
        };
        /**
         * Add Interceptors for response & request transforms
         * @deprecated
         */
        Transforms.prototype.addInterceptors = function (axios) {
            this.applyTransform(axios);
            return axios;
        };
        /**
         * Return AxiosTransformer form response
         * @param config
         * @private
         */
        Transforms.prototype._getResponseTransforms = function (config) {
            var _a = this, margeResponse = _a.margeResponse, context = _a.context;
            var url = config.url, method = config.method;
            var transformSet = this._getTransformSet(url, method);
            // response
            var responseTransforms = [];
            if (margeResponse === 'front') {
                responseTransforms.push(transformSet.response, config.transformResponse);
            }
            else if (margeResponse === 'back') {
                responseTransforms.push(config.transformResponse, transformSet.response);
            }
            else {
                responseTransforms.push(transformSet.response);
            }
            var transformResponse = utils_1.mergeArrays(responseTransforms);
            return transformResponse.map(function (transform) { return function (data) { return (transform(data, context, config)); }; });
        };
        /**
         * Return error interceptor
         * @param axios axios instance
         * @private
         */
        Transforms.prototype._errorInterceptors = function (axios) {
            var _this = this;
            return function (error) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var config, originalConfig, status, url, method, transformSet, _error;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            config = error.config;
                            if (!config) {
                                throw error;
                            }
                            originalConfig = config.__config;
                            /* istanbul ignore if  no way to test*/
                            if (!originalConfig) {
                                throw error;
                            }
                            status = config.__status;
                            /* istanbul ignore else  no way to test*/
                            if (!status) {
                                status = { originalConfig: originalConfig };
                                config.__status = status;
                            }
                            url = originalConfig.url, method = originalConfig.method;
                            transformSet = this._getTransformSet(url, method);
                            return [4 /*yield*/, utils_1.transFormError(transformSet.error, error, this.context, status)];
                        case 1:
                            _error = _a.sent();
                            if (status.retry || _error.retry) {
                                return [2 /*return*/, Promise.resolve().then(function () {
                                        return axios(originalConfig);
                                    })];
                            }
                            // @ts-ignore
                            return [2 /*return*/, Promise.reject(_error)];
                    }
                });
            }); };
        };
        /**
         * Return request interceptor
         * @private
         */
        Transforms.prototype._requestInterceptors = function () {
            var _this = this;
            return function (config) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var context, _config, url, method, transformSet, newConfig;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            context = this.context;
                            _config = config.__config || config;
                            url = _config.url, method = _config.method;
                            // else coverage needed
                            if (!config.__config) {
                                config.__config = tslib_1.__assign(tslib_1.__assign({}, config), { __config: null, method: lodash_1.cloneDeep(config.method), data: lodash_1.cloneDeep(config.data), headers: lodash_1.cloneDeep(config.headers), params: lodash_1.cloneDeep(config.params), auth: lodash_1.cloneDeep(config.auth), proxy: lodash_1.cloneDeep(config.proxy) });
                            }
                            transformSet = this._getTransformSet(url, method);
                            return [4 /*yield*/, utils_1.transFormRequest(transformSet.request, tslib_1.__assign({}, _config), context)
                                // add  response into transformResponse to transform response after request
                            ];
                        case 1:
                            newConfig = _a.sent();
                            // add  response into transformResponse to transform response after request
                            newConfig.transformResponse = this._getResponseTransforms(tslib_1.__assign({}, _config));
                            return [2 /*return*/, newConfig];
                    }
                });
            }); };
        };
        /**
         * Manage match cache
         * @param url axios.url
         * @param method axios.method
         * @param save how to save logic function
         * @private
         */
        Transforms.prototype._saveCache = function (url, method, save) {
            var _a = this, maxCache = _a.maxCache, _cache = _a._cache;
            var key = utils_1.createCacheKey(url, method);
            var value = _cache.get(key);
            if (!value) {
                value = save();
                _cache.set(key, value);
                if (maxCache && _cache.size > 0 && maxCache <= _cache.size) {
                    _cache.delete(_cache.keys()[0]);
                }
            }
            return value;
        };
        /**
         * Find matched transforms
         * @param url axios.url
         * @param method axios.url & 'all' , 'ALL' all means all of method
         */
        Transforms.prototype._getTransformSet = function (url, 
        /* istanbul ignore next no way to test*/
        method) {
            var _this = this;
            if (url === void 0) { url = '/'; }
            if (method === void 0) { method = 'all'; }
            return this._saveCache(url, method, function () {
                var _a = _this, matchers = _a.matchers, final = _a.final, first = _a.first;
                var matchedTransforms = utils_1.getMatchedMatchers(matchers, url, method)
                    .map(function (_a) {
                    var transform = _a.transform;
                    return (transform);
                });
                var transformSet = utils_1.margeMatcher(matchedTransforms);
                if (first) {
                    transformSet = utils_1.margeMatcher([first, transformSet]);
                }
                if (final) {
                    transformSet = utils_1.margeMatcher([transformSet, final]);
                }
                return transformSet;
            });
        };
        return Transforms;
    }());
    exports.default = Transforms;
});
//# sourceMappingURL=index.js.map