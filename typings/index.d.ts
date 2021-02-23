/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./appletsRequestModeList.d.ts" />
import "applets-request";

declare class ApiHttp<IApis> {
  constructor(config: IApiHttpConfig, requestConfig?: IAppletsRequestConfig);

  baseURL: string;

  apis: IApis;

  /**
   * Http Api 声明
   */
  apiList: IApiItems;

  /**
   * 构建重试错误
   */
  createRetryError(): {
    errCode: string;
    /**
     * 原始错误对象
     */
    originalErr: any;
    /**
     * 需要合并到request中的数据
     */
    options: IAppletsRequestConfig | undefined;
  };

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(
    fulfilled: IAppletsRequest.IResolved<IAppletsRequestConfig>,
    rejected?: IAppletsRequest.IRejected,
  ): void;

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor<IData>(
    fulfilled: IAppletsRequest.IResolved<IAppletsRequestResponse<IData>>,
    rejected?: IAppletsRequest.IRejected,
  ): void;

  /**
   * 构建取消对象
   */
  createCancelToken(): IAppletsRequest.ICancelTokenInstance;

  /**
   * 请求Config转换器，可用于修改config中的数据
   */
  transformConfig(executor: IAppletsRequest.IConfigTransformer): void;
}
