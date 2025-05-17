/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted, shallowRef } from 'vue-demi';

import { errorFmt, tryDispose } from '@/utils';

/**
 * SSE 连接配置项
 * @property autoConnect - 是否在组件挂载时自动连接（默认true）
 * @property onopen - 连接成功回调
 * @property onclose - 连接关闭回调
 * @property onmessage - 消息回调
 * @property onconnect - 连接中回调
 */
interface ISSEOptionsType extends EventSourceInit {
    autoConnect?: boolean;
    onopen?: (ev: Event) => void;
    onclose?: (ev: Event) => void;
    onmessage?: (ev: MessageEvent) => void;
    onconnect?: (instance: EventSource) => void;
}

/**
 * SSE 连接 Hook
 * @param url - SSE 服务端地址
 * @param options - 自定义配置项（会覆盖全局配置）
 * @returns { data, close, connect, readyState }
 * @throws 浏览器不支持 EventSource 时抛出错误
 * @example
 *  import { useSSE } from 'vu-hooks';
 *  const { data, close, connect, readyState } = useSSE(URL, options);
 */
export default function useSSE<T = any>(url: string | URL, options?: ISSEOptionsType) {
    if (!('EventSource' in window)) {
        throw new Error(errorFmt('EventSource is not supported by your browser.'));
    }

    let instance: EventSource | undefined;

    const autoConnect = options?.autoConnect ?? true;

    const data = shallowRef<T>();

    const readyState = ref<number>(EventSource.CONNECTING);

    const state: {
        _closePromise?: Promise<Event>;
        _closeResolve?: (value: Event) => void;
        _connectPromise?: Promise<EventSource>;
    } = {};

    const _reset = () => {
        instance = undefined;

        state._closePromise = undefined;
        state._connectPromise = undefined;
    };

    /**
     * 连接 SSE
     * @returns {Promise<EventSource>}
     */
    const connect = () => {
        if (instance && instance.readyState === EventSource.OPEN) return Promise.resolve(instance);
        if (state._connectPromise) return state._connectPromise;

        let _resolve: (value: EventSource) => void;
        let _reject: (ev: Event) => void;

        state._connectPromise = new Promise<EventSource>((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });

        // 尝试连接
        const try_connect = () => {
            instance = new EventSource(url, { withCredentials: options?.withCredentials });

            options?.onconnect?.(instance);

            instance.onerror = (ev: Event) => {
                readyState.value = instance!.readyState;

                if (instance!.readyState === EventSource.CLOSED) {
                    if (state._closeResolve) {
                        state._closeResolve(ev);
                    } else {
                        _reset();
                    }
                    options?.onclose?.(ev);

                    _reject(ev);
                }
            };

            instance.onmessage = (ev: MessageEvent) => {
                data.value = ev.data;
                options?.onmessage?.(ev);
            };

            instance.onopen = (ev: Event) => {
                state._connectPromise = undefined;

                // 当前状态
                readyState.value = instance!.readyState;

                options?.onopen?.(ev);

                _resolve(instance!);
            };
        };

        try_connect();

        return state._connectPromise;
    };

    /**
     * 关闭 SSE
     * @returns {Promise<Event>}
     */
    const close = () => {
        if (!(instance && instance.readyState === EventSource.OPEN)) {
            return Promise.reject(new Error(errorFmt('SSE is not connected.')));
        }

        if (state._closePromise) return state._closePromise;

        state._closePromise = new Promise<Event>((resolve) => {
            state._closeResolve = (ev: Event) => {
                resolve(ev);
                _reset();
                state._closeResolve = undefined;
            };
        });

        instance.close();

        return state._closePromise;
    };

    // auto connect
    onMounted(() => {
        // 是否自动连接
        if (autoConnect) {
            connect().catch(() => {});
        }
    });

    tryDispose(close);

    return {
        data,
        close,
        connect,
        readyState
    };
}
