var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { getMatchedMatchers, margeMatcher, mergeArrays, transFormError, transFormRequest, } from './utils';
export * from './utils';
function _createCacheKey(url, method) {
    return method + ">" + url;
}
var Transforms = /** @class */ (function () {
    function Transforms(options) {
        if (options === void 0) { options = {}; }
        this._interceptorId = null;
        this._cache = new Map();
        this._options = __assign({}, options);
    }
    Object.defineProperty(Transforms.prototype, "first", {
        get: function () {
            return this._options.first;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "final", {
        get: function () {
            return this._options.final;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "context", {
        get: function () {
            var _a = this._options.context, context = _a === void 0 ? function () { return ({}); } : _a;
            return context();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "matchers", {
        get: function () {
            var _a = this._options.matchers, matchers = _a === void 0 ? [] : _a;
            return matchers;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Eject transform
     * @param axios
     */
    Transforms.prototype.ejectTransform = function (axios) {
        if (!this._interceptorId) {
            return;
        }
        axios.interceptors.request.eject(this._interceptorId.request);
        axios.interceptors.response.eject(this._interceptorId.response);
        this._interceptorId = null;
    };
    /**
     * Apply transform
     * @param axios
     * @param options
     */
    Transforms.prototype.applyTransform = function (axios, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (this._interceptorId) {
            return this._interceptorId;
        }
        var margeResponse = options.margeResponse;
        var context = this.context;
        // request & response transform
        var requestId = axios.interceptors.request.use(function (config) { return __awaiter(_this, void 0, void 0, function () {
            var _a, url, _b, method, transformSet, newConfig, responseTransforms, transformResponse;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.url, url = _a === void 0 ? '/' : _a, _b = config.method, method = _b === void 0 ? 'get' : _b;
                        transformSet = this._saveCache(url, method, function () { return (_this._getTransformSet(url, method)); });
                        return [4 /*yield*/, transFormRequest(transformSet.request, __assign({}, config), context)
                            // response
                        ];
                    case 1:
                        newConfig = _c.sent();
                        responseTransforms = [];
                        if (margeResponse === 'front') {
                            responseTransforms.push(transformSet.response, config.transformResponse);
                        }
                        else if (margeResponse === 'back') {
                            responseTransforms.push(config.transformResponse, transformSet.response);
                        }
                        else {
                            responseTransforms.push(transformSet.response);
                        }
                        transformResponse = mergeArrays(responseTransforms);
                        newConfig.transformResponse = transformResponse.map(function (transform) { return function (data) { return (transform(data, context)); }; });
                        return [2 /*return*/, newConfig];
                }
            });
        }); });
        // error transform
        var responseId = axios.interceptors.response.use(function (res) { return (res); }, function (error) { return __awaiter(_this, void 0, void 0, function () {
            var config, _a, url, _b, method, transformSet, _error;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        config = error.config;
                        if (!error.config) {
                            throw error;
                        }
                        _a = config.url, url = _a === void 0 ? '/' : _a, _b = config.method, method = _b === void 0 ? 'get' : _b;
                        transformSet = this._saveCache(url, method, function () { return (_this._getTransformSet(url, method)); });
                        error.isError = true;
                        return [4 /*yield*/, transFormError(transformSet.error, error, this.context)];
                    case 1:
                        _error = _c.sent();
                        if (_error.isError) {
                            if (_error.retry) {
                                return [2 /*return*/, Promise.resolve().then(function () { return (axios.request(_error.config)); })];
                            }
                            return [2 /*return*/, Promise.reject(_error)];
                        }
                        // @ts-ignore
                        return [2 /*return*/, Promise.resolve(_error.response)];
                }
            });
        }); });
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
    Transforms.prototype.addInterceptors = function (axios, options) {
        if (options === void 0) { options = {}; }
        this.applyTransform(axios, options);
        return axios;
    };
    Transforms.prototype._saveCache = function (url, method, save) {
        var key = _createCacheKey(url, method);
        var value = this._cache.get(key);
        if (!value) {
            var value_1 = save();
            this._cache.set(key, value_1);
            return value_1;
        }
        return value;
    };
    /**
     * Find matched transforms
     */
    Transforms.prototype._getTransformSet = function (url, method) {
        var _a = this, matchers = _a.matchers, final = _a.final, first = _a.first;
        var matchedTransforms = getMatchedMatchers(matchers, url, method)
            .map(function (_a) {
            var transform = _a.transform;
            return (transform);
        });
        var transformSet = margeMatcher(matchedTransforms);
        if (first) {
            transformSet = margeMatcher([first, transformSet]);
        }
        if (final) {
            transformSet = margeMatcher([transformSet, final]);
        }
        return transformSet;
    };
    return Transforms;
}());
export default Transforms;
//# sourceMappingURL=index.js.map