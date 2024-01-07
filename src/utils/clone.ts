/** 简单深度克隆 */
export function deepClone(obj: any): Object {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    let clone: Record<string, any> | any[] = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // @ts-ignore
            clone[key] = deepClone(obj[key]);
        }
    }
    return clone;
}
export function deepMerge(...args: any[]): Object {
    const isObject = (obj: any) => Object.prototype.toString.call(obj) === '[object Object]';
    const source = isObject(args) ? args[0] : {};
    const entries = args.filter(it => it && isObject(it)).map(it => Object.entries(it));
    const result = entries.reduce((pre, cur) => {
        cur.forEach(([key, value]) => {
            if (pre.hasOwnProperty(key) && (isObject(pre[key]) || isObject(value))) {
                pre[key] = deepMerge(pre[key], value);
            } else {
                pre[key] = value;
            }
        })
        return pre;
    }, source as Record<string, any>);
    return result;
}