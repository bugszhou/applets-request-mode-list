export declare function isArray(data: any): boolean;
export declare function isPlainObject(val: any): val is Record<string, any>;
export declare function assign<T, U>(to: T, from: U): T & U;
export declare function isString(val: any): boolean;
/**
 * 遍历
 * @param {Object|Array} obj
 * @param fn
 */
export declare function forEach(obj: any, fn: IAppletsRequest.IEmptyFN): void;
export declare function merge(...objs: Record<string, any>[]): any[] | Record<string, any>;
