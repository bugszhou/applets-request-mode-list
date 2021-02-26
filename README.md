# applets-request-mode-list

小程序接口请求库

## Introduction

基于`Promise`，声明式创建接口请求对象集合，支持微信小程序、支付宝小程序、百度小程序、抖音/头条小程序

## Features

- 支持 Promise API
- Interceptor request and response
- Transform request and response data
- Transform Config
- Cancel requests
- Automatic transforms for JSON data
- 在`TIMEOUT`和`NETWORK_ERROR`错误下，默认会自动重试 2 次，每隔 2000ms 重试一次

## Platform

- Wechat
- Alipay
- Swan
- Bytedance

## Installing

Using npm:

```shell
npm install applets-request-mode-list
```

Using yarn:

```shell
yarn add applets-request-mode-list
```

## Example

假如需要创建一个获取博客文章的 GET 请求：

首先，声明接口：

```javascript
const apiList = {
  // key为方法调用名
  getArticle: {
    apiUrl: "/article/get",
    method: "GET",
    /**
     * 每隔多少ms重试一次
     */
    interval: 3000,
    /**
     * 重试次数，设置为0时，将不执行重试
     */
    retryTimes: 2,
    desc: "获取单篇文章",
  },
};
```

然后，创建请求对象：

```javascript
import ApiHttp from "applets-request-mode-list";

const apiHttp = new ApiHttp({
  baseUrl: "https: //xxx.com",
  apiList: apiList,
});

// 执行请求接口，发送请求获取数据
apiHttp.apis
  .getArticle({
    data: {
      articleId: 1,
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });
```

## 声明接口

```javascript
const apiList = {
  functionName: {
    /**
     * 服务端接口pathurl
     */
    apiUrl: string;
    method: "POST" | "GET" | "PUT" | "post" | "get" | "put";
    /**
     * 每隔多少ms重试一次
     */
    interval?: number;
    /**
     * 重试次数
     */
    retryTimes?: number;
    /**
     * 接口描述
     */
    desc?: string;
    /**
     * 方法名称，Array时有效
     */
    fnName?: string;
    /**
     * 接口query请求参数的类型声明，typescript有效
     */
    paramsTyping?: string;
    /**
     * 接口body请求参数的类型声明，typescript有效
     */
    dataTyping?: string;
    /**
     * 接口返回值的类型声明，typescript有效
     */
    resTyping?: string;
  }
}
```

## Api

### ApiHttp

type: `class`

## Methods And Properties

### `constructor(config, [appletsRequestConfig])`

构造函数

#### `config`

Type: `Object` Required

- `config.baseUrl` Type: `string`
- `config.apiLIst` Type: `Object` 接口声明

#### `appletsRequestConfig`

Type: `Object<IAppletsRequestConfig>` Optional

- [点击查看`IAppletsRequestConfig`支持的配置](https://github.com/bugszhou/applets-request-all#request-config)

#### `constructor` Example

```javascript
const apiList = {
  // key为方法调用名
  getArticle: {
    apiUrl: "/article/get",
    method: "GET",
    /**
     * 每隔多少ms重试一次
     */
    interval: 3000,
    /**
     * 重试次数，设置为0时，将不执行重试
     */
    retryTimes: 2,
    desc: "获取单篇文章",
  },
};

const config = {
  baseUrl: "https://xxx.com",
  apiList: apiList,
};

const appletsRequestConfig = {
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
};

const apiHttp = new ApiHttp(config, appletsRequestConfig);
```

### `baseUrl`(Property)

Type: `string`

example: https://xxx.com

### `apis`(Property)

接口列表集合

Type: `(reqConfig?: IAppletsRequestConfig): Promise<Data>`

Return: `Promise`

#### reqConfig

Type: `Object<IAppletsRequestConfig>` Optional

- [点击查看`IAppletsRequestConfig`支持的配置](https://github.com/bugszhou/applets-request-all#request-config)

#### `apis` Example

```javascript
apiHttp.apis
  .getArticle({
    // body data
    data: {
      token: "token",
    },
    // query data
    params: {
      articleId: 1,
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });
```

### `appletsRequest`(Property)

Type: `AppletsRequestInstance`

一个类`axios`的请求库

### `addRequestInterceptor(fulfilled, [rejected])`(Method)

添加`request`拦截器，`request`拦截器执行逻辑是先添加的后执行，是一个栈结构。支持异步操作。

#### `fulfilled`

- Type: `function`

- Return: `any`

功能和`Promise.resolve`一样

#### `reject`

- Type: `function`

- Return: `Promise.reject` or `Throw Error`

功能和`Promise.reject`一样

### `addResponseInterceptor(fulfilled, [rejected])`(Method)

添加`response`拦截器，`response`拦截器执行逻辑是先添加的先执行，是一个队列结构。支持异步操作。

参数和`addRequestInterceptor`一样

### `createRetryError(originalErr, [appletsRequestConfig])`(Method)

创建立即重试的错误信息，在`Interceptor`中有效

#### `createRetryError` Options

##### `originalErr`

原始错误对象

##### `appletsRequestConfig`

需要更新的请求数据

##### `createRetryError(originalErr, [appletsRequestConfig])` Example

```javascript
apiHttp.addResponseInterceptor((res) => {
  return createRetryError(res, {
    // 将原本的data替换为{articleId: 2}，然后发送请求
    data: {
      articleId: 2,
    },
  });
});
```

### `createCancelToken()`

创建取消请求对象，用于特定情况取消请求

#### `createCancelToken()` Example

```javascript
const cancelToken = apiHttp.createCancelToken();

apiHttp.apis
  .getArticle({
    cancelToken,
    // body data
    data: {
      token: "token",
    },
    // query data
    params: {
      articleId: 1,
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });

setTimeout(() => {
  cancelToken.cancel("cancel reason");
}, 100);
```

### `addApiList(apiList)`

往原有的接口列表中新添加接口

#### `addApiList(apiList)` Example

```javascript
const newApiList = {
  // key为方法调用名
  getArticles: {
    apiUrl: "/articles/get",
    method: "GET",
    /**
     * 每隔多少ms重试一次
     */
    interval: 3000,
    /**
     * 重试次数，设置为0时，将不执行重试
     */
    retryTimes: 2,
    desc: "获取文章列表",
  },
};

apiHttp.addApiList(newApiList);

apiHttp.apis
  .getArticles()
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });
```
