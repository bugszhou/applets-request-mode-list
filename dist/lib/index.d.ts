interface IApiItem {
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
     * 接口query请求参数的类型声明
     */
    paramsTyping?: string;
    /**
     * 接口body请求参数的类型声明
     */
    dataTyping?: string;
    /**
     * 接口返回值的类型声明
     */
    resTyping?: string;
    /**
     * 方法名称，Array时有效
     */
    fnName?: string;
}
interface IApiHttpConfig {
    appKey: string;
    appCode: string;
    baseURL: string;
    apiList: {
        [key: string]: IApiItem;
    } | IApiItem[];
}
export default class ApiHttp<IApis> {
    appKey: string;
    appCode: string;
    baseURL: string;
    apiList: {
        [key: string]: IApiItem;
    } | IApiItem[];
    apis: IApis;
    appletsRequest: AppletsRequestInstance;
    constructor(config: IApiHttpConfig, requestConfig?: IAppletsRequestConfig);
    createApiItem(): void;
    generateApiFn(fnNames: string[]): void;
    createRetryError(originalErr: any, options?: IAppletsRequestConfig): {
        errCode: string;
        originalErr: any;
        options: IAppletsRequestConfig;
    };
    addRequestInterceptor(fulfilled: IAppletsRequest.IResolved<IAppletsRequestConfig>, rejected?: IAppletsRequest.IRejected): void;
    addResponseInterceptor<T>(fulfilled: IAppletsRequest.IResolved<IAppletsRequestResponse<T>>, rejected?: IAppletsRequest.IRejected): void;
    createCancelToken(): IAppletsRequest.ICancelTokenInstance;
    transformConfig(executor: IAppletsRequest.IConfigTransformer): void;
}
export {};
