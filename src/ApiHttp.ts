import appletsRequest, { getDefaults } from "applets-request-all";
import { assign, isArray, isPlainObject, merge } from "./helpers/utils";

interface IApiItemConfig {
  baseURL: string;
  url: string;
  fnName: string;
  method?: IAppletsRequestConfig["method"];
  retryTimes?: number;
  interval?: number;
}

class ApiItem<IData = any> {
  private hadRetry = 0;

  retryTimes = 2;

  interval = 2000;

  baseURL = "";

  url = "";

  fnName = "";

  method: IAppletsRequestConfig["method"] = "GET";

  appletsRequest: AppletsRequestInstance;

  constructor(config: IApiItemConfig, request: AppletsRequestInstance) {
    const { retryTimes, interval } = config;
    this.baseURL = config.baseURL;
    this.url = config.url;
    this.fnName = config.fnName;
    this.method = config.method || this.method;
    this.retryTimes = this.getValidNumber(this.retryTimes, retryTimes);
    this.interval = this.getValidNumber(this.interval, interval);
    this.appletsRequest = request;
  }

  getValidNumber(originalVal: number, val: number | undefined): number {
    return !val && val !== 0 ? originalVal : val;
  }

  http(options?: IAppletsRequestConfig): IAppletsRequestPromise<IData> {
    return new Promise((resolve, reject) => {
      this.request(
        { ...(options || {}), url: this.url, method: this.method },
        resolve,
        reject
      );
    });
  }

  request(
    options: IAppletsRequestConfig,
    resolve: any,
    reject: IAppletsRequest.IRejected
  ): void {
    Promise.resolve(options)
      .then((reqConfig) => this.appletsRequest<IData>(reqConfig))
      .then((res) => {
        this.hadRetry = 0;
        resolve(res);
      })
      .catch((err) => {
        if (this.isRetryError(err) && this.hadRetry < this.retryTimes) {
          this.hadRetry += 1;
          const opts = merge(options, err.options || {});
          this.request(opts, resolve, reject);
          return;
        }
        if (this.isIntervalRetryError(err) && this.hadRetry < this.retryTimes) {
          setTimeout(() => {
            this.hadRetry += 1;
            this.request(options, resolve, reject);
          }, this.interval);
          return;
        }
        reject(this.isRetryError(err) ? err.originalErr : err);
      });
  }

  isRetryError(err: any): boolean {
    if (!err) {
      return false;
    }
    return err.errCode === "RETRY_ERROR";
  }

  isIntervalRetryError(err: any): boolean {
    if (!err) {
      return false;
    }
    return err.status === "NETWORK_ERROR" || err.status === "TIMEOUT";
  }
}

export default class ApiHttp {
  baseURL: string;

  apiList: { [key: string]: IAppletsApi.IApiItem };

  apis: any;

  appletsRequest: AppletsRequestInstance;

  constructor(
    config: IAppletsApi.IApiHttpConfig,
    requestConfig?: IAppletsRequestConfig
  ) {
    this.apiList = Object.create(null);
    this.apis = Object.create(null);
    this.baseURL = config.baseURL;
    this.appletsRequest = appletsRequest.create({
      ...merge(getDefaults(), requestConfig || {}),
      baseURL: this.baseURL,
    });
    this.createApiItem(config.apiList);
  }

  createApiItem(apiList: IAppletsApi.IApiItems): void {
    if (isArray(apiList)) {
      const tmpApiList: { [key: string]: IAppletsApi.IApiItem } = Object.create(
        null
      );
      (apiList as IAppletsApi.IApiItem[]).forEach((item) => {
        if (item.fnName) {
          tmpApiList[item.fnName] = item;
        }
      });
      const fnNames = (apiList as IAppletsApi.IApiItem[]).map(
        (item) => item.fnName
      );

      this.apiList = { ...this.apiList, ...tmpApiList };
      this.generateApiFn(fnNames as string[]);
      return;
    }

    if (isPlainObject(apiList)) {
      this.apiList = { ...this.apiList, ...apiList } as {
        [key: string]: IAppletsApi.IApiItem;
      };

      const fnNames = Object.keys(apiList);

      this.generateApiFn(fnNames);
    }
  }

  generateApiFn(fnNames: string[]): void {
    fnNames.forEach((fnName) => {
      const apiConfig = this.apiList[fnName] as IAppletsApi.IApiItem;
      const apiInfo = {
        baseURL: this.baseURL,
        fnName,
        method: apiConfig.method,
        url: apiConfig.apiUrl,
        interval: apiConfig.interval,
        retryTimes: apiConfig.retryTimes,
      };
      if (typeof this.apis[fnName] === "function") {
        throw new Error(`${fnName} already exists in apiList`);
      }
      this.apis[fnName] = (options?: IAppletsRequestConfig) => {
        const apiItem = new ApiItem(apiInfo, this.appletsRequest);
        const opts = {
          ...(options || {}),
          apiConfig,
        };
        return apiItem.http(opts);
      };
      this.apis[fnName] = assign(this.apis[fnName], apiInfo);
    });
  }

  addApiList(apiList: IAppletsApi.IApiItems): void {
    this.createApiItem(apiList);
  }

  createRetryError(
    originalErr: any,
    options?: IAppletsRequestConfig
  ): {
    errCode: string;
    originalErr: any;
    options: IAppletsRequestConfig | undefined;
  } {
    return {
      errCode: "RETRY_ERROR",
      originalErr,
      options,
    };
  }

  addRequestInterceptor(
    fulfilled: IAppletsRequest.IResolved<IAppletsRequestConfig>,
    rejected?: IAppletsRequest.IRejected
  ): void {
    this.appletsRequest.interceptors.request.use(fulfilled, rejected);
  }

  addResponseInterceptor<T>(
    fulfilled: IAppletsRequest.IResolved<IAppletsRequestResponse<T>>,
    rejected?: IAppletsRequest.IRejected
  ): void {
    this.appletsRequest.interceptors.response.use(fulfilled, rejected);
  }

  createCancelToken(): IAppletsRequest.ICancelTokenInstance {
    return new this.appletsRequest.CancelToken();
  }

  transformConfig(executor: IAppletsRequest.IConfigTransformer): void {
    this.appletsRequest.defaults.transformConfig = executor;
  }
}
