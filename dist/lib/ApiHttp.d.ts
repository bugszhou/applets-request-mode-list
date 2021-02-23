interface IApiHttpConfig {
    appKey: string;
    appCode: string;
    baseURL: string;
    apiList: {
        [key: string]: IApiItem;
    } | IApiItem[];
}
export default class ApiHttp {
    appKey: string;
    appCode: string;
    baseURL: string;
    apiList: {
        [key: string]: IApiItem;
    };
    apis: any;
    appletsRequest: AppletsRequestInstance;
    constructor(config: IApiHttpConfig, requestConfig?: IAppletsRequestConfig);
    createApiItem(apiList: IApiItems): void;
    generateApiFn(fnNames: string[]): void;
    createRetryError(originalErr: any, options?: IAppletsRequestConfig): {
        errCode: string;
        originalErr: any;
        options: IAppletsRequestConfig | undefined;
    };
    addRequestInterceptor(fulfilled: IAppletsRequest.IResolved<IAppletsRequestConfig>, rejected?: IAppletsRequest.IRejected): void;
    addResponseInterceptor<T>(fulfilled: IAppletsRequest.IResolved<IAppletsRequestResponse<T>>, rejected?: IAppletsRequest.IRejected): void;
    createCancelToken(): IAppletsRequest.ICancelTokenInstance;
    transformConfig(executor: IAppletsRequest.IConfigTransformer): void;
}
export {};
