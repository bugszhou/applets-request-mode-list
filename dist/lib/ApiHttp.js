"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var applets_request_all_1 = require("applets-request-all");
var utils_1 = require("./helpers/utils");
var ApiItem = /** @class */ (function () {
    function ApiItem(config, request) {
        this.hadRetry = 0;
        this.retryTimes = 2;
        this.interval = 2000;
        this.baseURL = "";
        this.url = "";
        this.fnName = "";
        this.method = "GET";
        var retryTimes = config.retryTimes, interval = config.interval;
        this.baseURL = config.baseURL;
        this.url = config.url;
        this.fnName = config.fnName;
        this.method = config.method || this.method;
        this.retryTimes = this.getValidNumber(this.retryTimes, retryTimes);
        this.interval = this.getValidNumber(this.interval, interval);
        this.appletsRequest = request;
    }
    ApiItem.prototype.getValidNumber = function (originalVal, val) {
        return !val && val !== 0 ? originalVal : val;
    };
    ApiItem.prototype.http = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.request(__assign(__assign({}, (options || {})), { url: _this.url, method: _this.method }), resolve, reject);
        });
    };
    ApiItem.prototype.request = function (options, resolve, reject) {
        var _this = this;
        Promise.resolve(options)
            .then(function (reqConfig) { return _this.appletsRequest(reqConfig); })
            .then(function (res) {
            _this.hadRetry = 0;
            resolve(res);
        })
            .catch(function (err) {
            if (_this.isRetryError(err) && _this.hadRetry < _this.retryTimes) {
                _this.hadRetry += 1;
                var opts = utils_1.merge(options, err.options || {});
                _this.request(opts, resolve, reject);
                return;
            }
            if (_this.isIntervalRetryError(err) && _this.hadRetry < _this.retryTimes) {
                setTimeout(function () {
                    _this.hadRetry += 1;
                    _this.request(options, resolve, reject);
                }, _this.interval);
                return;
            }
            reject(_this.isRetryError(err) ? err.originalErr : err);
        });
    };
    ApiItem.prototype.isRetryError = function (err) {
        if (!err) {
            return false;
        }
        return err.errCode === "RETRY_ERROR";
    };
    ApiItem.prototype.isIntervalRetryError = function (err) {
        if (!err) {
            return false;
        }
        return err.status === "NETWORK_ERROR" || err.status === "TIMEOUT";
    };
    return ApiItem;
}());
var ApiHttp = /** @class */ (function () {
    function ApiHttp(config, requestConfig) {
        this.apiList = {};
        this.apis = Object.create(null);
        this.baseURL = config.baseURL;
        this.appletsRequest = applets_request_all_1.default.create(__assign(__assign({}, utils_1.merge(applets_request_all_1.getDefaults(), requestConfig || {})), { baseURL: this.baseURL }));
        this.createApiItem(config.apiList);
    }
    ApiHttp.prototype.createApiItem = function (apiList) {
        if (utils_1.isArray(apiList)) {
            var tmpApiList_1 = Object.create(null);
            apiList.forEach(function (item) {
                if (item.fnName) {
                    tmpApiList_1[item.fnName] = item;
                }
            });
            var fnNames = apiList.map(function (item) { return item.fnName; });
            this.apiList = tmpApiList_1;
            this.generateApiFn(fnNames);
            return;
        }
        if (utils_1.isPlainObject(apiList)) {
            this.apiList = apiList;
            var fnNames = Object.keys(apiList);
            this.generateApiFn(fnNames);
        }
    };
    ApiHttp.prototype.generateApiFn = function (fnNames) {
        var _this = this;
        fnNames.forEach(function (fnName) {
            var apiConfig = _this.apiList[fnName];
            var apiInfo = {
                baseURL: _this.baseURL,
                fnName: fnName,
                method: apiConfig.method,
                url: apiConfig.apiUrl,
                interval: apiConfig.interval,
                retryTimes: apiConfig.retryTimes,
            };
            if (typeof _this.apis[fnName] === "function") {
                throw new Error(fnName + " already exists in apiList");
            }
            _this.apis[fnName] = function (options) {
                var apiItem = new ApiItem(apiInfo, _this.appletsRequest);
                var opts = __assign(__assign({}, (options || {})), { apiConfig: apiConfig });
                return apiItem.http(opts);
            };
            _this.apis[fnName] = utils_1.assign(_this.apis[fnName], apiInfo);
        });
    };
    ApiHttp.prototype.addApiList = function (apiList) {
        this.createApiItem(apiList);
    };
    ApiHttp.prototype.createRetryError = function (originalErr, options) {
        return {
            errCode: "RETRY_ERROR",
            originalErr: originalErr,
            options: options,
        };
    };
    ApiHttp.prototype.addRequestInterceptor = function (fulfilled, rejected) {
        this.appletsRequest.interceptors.request.use(fulfilled, rejected);
    };
    ApiHttp.prototype.addResponseInterceptor = function (fulfilled, rejected) {
        this.appletsRequest.interceptors.response.use(fulfilled, rejected);
    };
    ApiHttp.prototype.createCancelToken = function () {
        return new this.appletsRequest.CancelToken();
    };
    ApiHttp.prototype.transformConfig = function (executor) {
        this.appletsRequest.defaults.transformConfig = executor;
    };
    return ApiHttp;
}());
exports.default = ApiHttp;
//# sourceMappingURL=ApiHttp.js.map