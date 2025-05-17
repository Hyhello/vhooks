import { createConfig, type GlobalConfigType } from './config';
import { merge, isString, isObject } from '@hyhello/utils';

import { errorFmt } from '@/utils';

type PartialDeep<T> = {
    [K in keyof T]?: T[K] extends object ? PartialDeep<T[K]> : T[K];
};

type IConfigType = PartialDeep<GlobalConfigType>;

export function setup(option: IConfigType): void;
export function setup<K extends keyof IConfigType>(name: K, option: IConfigType[K]): void;
export function setup<K extends keyof IConfigType>(name: K | IConfigType, option?: IConfigType[K]): void;

/**
 * 全局设置
 * @param name 配置项名称 或者 配置项
 * @param option 配置项 （可选）
 * @returns void
 * @example
 *  import { setup } from 'vu-hooks';
 *  // 方式一：
 *  setup({
 *     usePaging: {
 *        // 配置项
 *     }
 *  })
 *
 *  // 方式二（指定hooks）：
 *  setup('usePaging', {
 *     // 配置项
 *  });
 })
 */
export default function setup<K extends keyof IConfigType>(name: K | IConfigType, option?: IConfigType[K]) {
    const config = createConfig();
    if (isString(name) && isObject(option)) {
        merge(config[name], option);
    } else if (isObject(name)) {
        merge(config, name);
    } else {
        throw new Error(errorFmt('Invalid arguments: name should be a string or an object.'));
    }
}
