import appletsRequest, { getDefaults as getDefaults$1 } from 'applets-request';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function getDataType(val) {
    return Object.prototype.toString.call(val);
}
function isPlainObject(val) {
    if (val === null || getDataType(val) !== "[object Object]") {
        return false;
    }
    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
}
function isUndefined(val) {
    return typeof val === "undefined";
}
function merge() {
    var objs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objs[_i] = arguments[_i];
    }
    if (objs.length === 0) {
        return Object.create(null);
    }
    var result = Object.create(null);
    function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
            result[key] = merge(result[key], val);
        }
        else if (isPlainObject(val)) {
            result[key] = merge({}, val);
        }
        else if (Array.isArray(val)) {
            result[key] = merge(val);
        }
        else {
            result[key] = val;
        }
    }
    if (Array.isArray(objs[0])) {
        result = [];
    }
    else {
        result = Object.create(null);
    }
    objs.forEach(function (obj) {
        forEach(obj, assignValue);
    });
    return result;
}
/**
 * 遍历
 * @param {Object|Array} obj
 * @param fn
 */
function forEach(obj, fn) {
    if (typeof obj === "undefined" || obj === null) {
        return;
    }
    var arr = obj;
    // 如果obj是非object类型，例如：number，string等
    if (typeof obj !== "object") {
        arr = [obj];
    }
    if (Array.isArray(arr)) {
        arr.forEach(function (item, i) {
            fn.call(null, item, i, obj);
        });
        return;
    }
    Object.keys(arr).forEach(function (key) {
        fn.call(null, arr[key], key, arr);
    });
}

function getRequestOptions(config) {
    var reqConfig = {
        url: config.url || "",
        method: config.method,
        data: config.data,
        header: config.headers,
        dataType: "json",
        timeout: config.timeout,
    };
    var dataType = config.dataType || "json";
    reqConfig.dataType = dataType;
    if (config.responseType && config.responseType !== "json") {
        reqConfig.dataType = "其他";
    }
    return reqConfig;
}

/*
 * @Author: youzhao.zhou
 * @Date: 2021-02-04 16:09:10
 * @Last Modified by: youzhao.zhou
 * @Last Modified time: 2021-02-22 17:16:17
 * @Description request adapter
 *
 * 1. 执行成功需要返回IAppletsRequestResponse，执行失败即为reject返回IAppletsRequestAdapterError
 * 2. 如果取消返回IAppletsRequest.ICanceler
 */
function request(config) {
    function requestSuccess(res) {
        if (isUndefined(res) || res === null) {
            return {
                headers: {},
                status: 200,
                data: {},
                response: res,
            };
        }
        return {
            headers: res.header,
            status: res.statusCode,
            data: dataParser(res.data),
            response: res,
        };
    }
    /**
     * 获取错误类型
     * @param err
     * @param timeout
     * @returns NETWORK_ERROR | TIMEOUT
     * @example {
     *    msg: `Timeout of 2000 ms exceeded`,
     *    type: "TIMEOUT",
     *  }
     */
    function failType(err, timeout) {
        if (err &&
            (err.errMsg || "").toString().toLowerCase().includes("timeout")) {
            return {
                msg: "Timeout of " + (timeout || "") + " ms exceeded",
                type: "TIMEOUT",
            };
        }
        return {
            msg: "Network Error",
            type: "NETWORK_ERROR",
        };
    }
    /**
     * JSON parse data
     * @param data
     */
    function dataParser(data) {
        if (typeof data !== "string") {
            return data;
        }
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return data;
        }
    }
    function getReqConfig(originalConfig) {
        var tmpConfig = merge({}, originalConfig);
        tmpConfig.headers = originalConfig.header;
        delete tmpConfig.header;
        delete tmpConfig.Adapter;
        return tmpConfig;
    }
    return new Promise(function (resolve, reject) {
        var Adapter = config.Adapter;
        var reqConfig = getRequestOptions(config);
        var adapterConfig = getReqConfig(config);
        if (!Adapter) {
            throw new TypeError("Adapter is undefined or null");
        }
        var adapter = new Adapter(adapterConfig);
        var requestor = wx.request(__assign(__assign({}, reqConfig), { success: function (res) {
                adapter.resolve(requestSuccess(res), resolve);
            },
            fail: function (err) {
                var errData = failType(err, reqConfig.timeout);
                var rejectData = {
                    errMsg: errData.msg,
                    status: errData.type,
                    extra: err,
                };
                adapter.reject(rejectData, reject);
            },
            complete: function () {
                requestor = null;
            } }));
        adapter.subscribeCancelEvent(function (reason) {
            reject(reason);
            requestor.abort();
            requestor = null;
        });
        if (typeof config.getRequestTask === "function") {
            config.getRequestTask(request);
        }
    });
}

appletsRequest.defaults.adapter = request;
function getDefaults() {
    var defaults = getDefaults$1();
    defaults.adapter = request;
    return defaults;
}

/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
function getDataType$1(val) {
    return Object.prototype.toString.call(val);
}
function isArray(data) {
    return Array.isArray(data);
}
function isPlainObject$1(val) {
    if (val === null || getDataType$1(val) !== "[object Object]") {
        return false;
    }
    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
}
function assign(to, from) {
    if (isString(from)) {
        return to;
    }
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
}
function isString(val) {
    return typeof val === "string";
}
/**
 * 遍历
 * @param {Object|Array} obj
 * @param fn
 */
function forEach$1(obj, fn) {
    if (typeof obj === "undefined" || obj === null) {
        return;
    }
    var arr = obj;
    // 如果obj是非object类型，例如：number，string等
    if (typeof obj !== "object") {
        arr = [obj];
    }
    if (Array.isArray(arr)) {
        arr.forEach(function (item, i) {
            fn.call(null, item, i, obj);
        });
        return;
    }
    Object.keys(arr).forEach(function (key) {
        fn.call(null, arr[key], key, arr);
    });
}
function merge$1() {
    var objs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objs[_i] = arguments[_i];
    }
    if (objs.length === 0) {
        return Object.create(null);
    }
    var result = Object.create(null);
    function assignValue(val, key) {
        if (isPlainObject$1(result[key]) && isPlainObject$1(val)) {
            result[key] = merge$1(result[key], val);
        }
        else if (isPlainObject$1(val)) {
            result[key] = merge$1({}, val);
        }
        else if (Array.isArray(val)) {
            result[key] = merge$1(val);
        }
        else {
            result[key] = val;
        }
    }
    if (Array.isArray(objs[0])) {
        result = [];
    }
    else {
        result = Object.create(null);
    }
    objs.forEach(function (obj) {
        forEach$1(obj, assignValue);
    });
    return result;
}

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
            .then(function (res) {
            _this.hadRetry = 0;
            resolve(res);
        })
            .catch(function (err) {
            if (_this.isRetryError(err) && _this.hadRetry < _this.retryTimes) {
                _this.hadRetry += 1;
                var opts = merge$1(options, err.options || {});
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
        this.appKey = config.appKey;
        this.appCode = config.appCode;
        this.baseURL = config.baseURL;
        this.appletsRequest = appletsRequest.create(requestConfig || getDefaults());
        this.createApiItem(config.apiList);
    }
    ApiHttp.prototype.createApiItem = function (apiList) {
        if (isArray(apiList)) {
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
        if (isPlainObject$1(apiList)) {
            var fnNames = Object.keys(apiList);
            this.generateApiFn(fnNames);
            this.apiList = apiList;
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
            _this.apis[fnName] = assign(_this.apis[fnName], apiItem);
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

export default ApiHttp;
//# sourceMappingURL=applets-request-mode-list.es.js.map
