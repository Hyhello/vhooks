import mitt from 'mitt';
import type { WildcardHandler, EventType, Handler, Emitter } from 'mitt';

import { tryDispose } from '@/utils';

/**
 * 事件类型
 */
type MittEventType = EventType | '*';

/**
 * 事件总线对象
 * @property name 事件名称
 * @property callback 回调函数
 */
interface EmitterOption<T extends MittEventType> {
    name: T; // 事件名称
    callback: T extends '*' ? WildcardHandler : Handler;
}

let emitter: Emitter<Record<EventType, unknown>>;

/**
 * 数据总线
 * @param option 事件总线对象
 * @returns emitter 对象
 * @example
 *  import { useEmitt } from 'vu-hooks';
 *  const emitter = useEmitt();
 *
 *  // 触发事件
 *  emitter.emit('eventName', cvt);
 *
 *  // 监听事件，方式一
 *  emitter.on('eventName', (cvt) => {});
 *
 *  // 监听事件，方式二
 *  useEmitt({
 *     name: 'eventName',
 *     callback: (cvt) => {
 *        // do something
 *     }
 *  });
 */
export default function useEmitt<T extends MittEventType>(
    option?: EmitterOption<T>
): Emitter<Record<EventType, unknown>> {
    // fixed: tree-shaking
    if (!emitter) {
        emitter = mitt();
    }

    if (option) {
        emitter.on(option.name, option.callback);

        tryDispose(() => {
            emitter.off(option.name, option.callback);
        });
    }

    return emitter;
}
