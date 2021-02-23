"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var applets_request_weapp_1 = require("applets-request-weapp");
var utils_1 = require("./helpers/utils");
var ApiItem = /** @class */ (function () {
    function ApiItem(config, request) {
        this.hadRetry = 0;
        this.retryTimes = 2;
        this.interval = 2000;
        this.baseURL = "";
        this.url = "";
        this.fnName = "";
        var retryTimes = config.retryTimes, interval = config.interval;
        this.baseURL = config.baseURL;
        this.url = config.url;
        this.fnName = config.fnName;
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
            _this.request(options || {}, resolve, reject);
        });
    };
    ApiItem.prototype.request = function (options, resolve, reject) {
        var _this = this;
        Promise.resolve(options)
            .then(function (reqConfig) { return _this.appletsRequest(reqConfig); })
            .then(function (res) { return resolve(res); })
            .then(function () {
            _this.hadRetry = 0;
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
        this.apis = Object.create(null);
        this.apiList = config.apiList;
        this.appKey = config.appKey;
        this.appCode = config.appCode;
        this.baseURL = config.baseURL;
        this.appletsRequest = applets_request_weapp_1.default.create(requestConfig || applets_request_weapp_1.getDefaults());
        this.createApiItem();
    }
    ApiHttp.prototype.createApiItem = function () {
        if (utils_1.isArray(this.apiList)) {
            var tmpApiList_1 = Object.create(null);
            this.apiList.forEach(function (item) {
                tmpApiList_1[item.fnName] = item;
            });
            var fnNames = this.apiList.map(function (item) { return item.fnName; });
            this.apiList = tmpApiList_1;
            this.generateApiFn(fnNames);
            return;
        }
        if (utils_1.isPlainObject(this.apiList)) {
            var fnNames = Object.keys(this.apiList);
            this.generateApiFn(fnNames);
        }
    };
    ApiHttp.prototype.generateApiFn = function (fnNames) {
        var _this = this;
        fnNames.forEach(function (fnName) {
            var apiConfig = _this.apiList[fnName];
            var apiItem = new ApiItem({
                baseURL: _this.baseURL,
                fnName: fnName,
                url: apiConfig.apiUrl,
                interval: apiConfig.interval,
                retryTimes: apiConfig.retryTimes,
            }, _this.appletsRequest);
            _this.apis[fnName] = apiItem.http.bind(apiItem);
            _this.apis[fnName] = utils_1.assign(_this.apis[fnName], apiItem);
        });
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
//# sourceMappingURL=index.js.map