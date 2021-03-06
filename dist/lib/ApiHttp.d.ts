export default class ApiHttp {
    baseURL: string;
    apiList: {
        [key: string]: IAppletsApi.IApiItem;
    };
    apis: any;
    appletsRequest: AppletsRequestInstance;
    constructor(config: IAppletsApi.IApiHttpConfig, requestConfig?: IAppletsRequestConfig);
    createApiItem(apiList: IAppletsApi.IApiItems): void;
    generateApiFn(fnNames: string[]): void;
    addApiList(apiList: IAppletsApi.IApiItems): void;
    createRetryError(originalErr: any, options?: IAppletsRequestConfig): {
        errCode: string;
        retryOptions: IAppletsRequestConfig | undefined;
        [key: string]: any;
    };
    addRequestInterceptor(fulfilled: IAppletsRequest.IResolved<IAppletsRequestConfig>, rejected?: IAppletsRequest.IRejected): void;
    addResponseInterceptor<T>(fulfilled: IAppletsRequest.IResolved<IAppletsRequestResponse<T>>, rejected?: IAppletsRequest.IRejected): void;
    createCancelToken(): IAppletsRequest.ICancelTokenInstance;
    transformConfig(executor: IAppletsRequest.IConfigTransformer): void;
    isRetryError(err: any): boolean;
}
