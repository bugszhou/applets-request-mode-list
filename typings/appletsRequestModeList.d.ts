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

type IApiItems = {
  [key: string]: IApiItem;
} | IApiItem[];
