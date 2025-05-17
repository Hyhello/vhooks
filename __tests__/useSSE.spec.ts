/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import useSSE from '@/hook/useSSE';
import { mount } from '@vue/test-utils';
import { sleep } from './helpers/_utils';
import { EventSource, CONNECT_DELAY } from './helpers/_EventSource';

interface TestComponentInstance {
    setup(): ReturnType<typeof useSSE>;
    [key: string]: unknown;
}

beforeAll(() => {
    global.window.EventSource = EventSource;
});
afterAll(() => {
    delete global.window.EventSource;
});

describe('useSSE throws error if EventSource is not supported', () => {
    let originalEventSource = null;
    beforeAll(() => {
        originalEventSource = global.window.EventSource;
        delete global.window.EventSource;
    });
    afterAll(() => {
        global.window.EventSource = originalEventSource;
    });
    it('call useSSE to throw error if EventSource is not supported', () => {
        expect(() => useSSE('')).toThrowError(/EventSource is not supported by your browser/);
    });
});

describe('useSSE', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        // 创建一个 spy 来监听 console.error 的调用
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // 清理 spy
        consoleErrorSpy.mockRestore();
    });

    it('should be defined', () => {
        expect(useSSE).toBeDefined();
        expect(typeof useSSE).toBe('function');
    });

    it('should return the existing connect promise if already connecting', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { connect } = useSSE('/test-url', { autoConnect: false });
                return {
                    connect
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        // 第一次调用 connect，应该创建一个新的 Promise
        const connectPromise1 = wrapper.vm.connect();

        // // 第二次调用 connect，应该返回相同的 Promise
        const connectPromise2 = wrapper.vm.connect();

        expect(connectPromise1).toBeInstanceOf(Promise);

        expect(connectPromise2).toBeInstanceOf(Promise);

        // // 验证两个 Promise 是相同的
        expect(connectPromise1).toEqual(connectPromise2);

        const awaitConnectPromise1 = await connectPromise1;
        const awaitConnectPromise2 = await connectPromise2;

        expect(awaitConnectPromise1).toBeInstanceOf(EventSource);
        expect(awaitConnectPromise2).toBeInstanceOf(EventSource);

        // 再次调用，会触发Promise.resolve(instance);
        const connectPromiseOther1 = wrapper.vm.connect();
        const connectPromiseOther2 = wrapper.vm.connect();

        expect(connectPromiseOther1).toBeInstanceOf(Promise);
        expect(connectPromiseOther2).toBeInstanceOf(Promise);

        expect(connectPromiseOther1).toEqual(connectPromiseOther2);
    });

    it('should return the existing close promise if already closing', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { readyState, close, connect } = useSSE('/test-url', { autoConnect: false });
                return {
                    close,
                    connect,
                    readyState
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        // 第一次调用 close，instance 不存在，则报错
        await expect(wrapper.vm.close()).rejects.toThrowError(/SSE is not connected/);

        expect(wrapper.vm.readyState).toBe(0);

        const connectPromise = wrapper.vm.connect();

        // 第二次调用 close，instance 存在，但是还未连接成功，所以报错
        await expect(wrapper.vm.close()).rejects.toThrowError(/SSE is not connected/);

        await connectPromise;

        expect(wrapper.vm.readyState).toBe(1);

        // 第一次调用 close，应该创建一个新的 Promise
        const closePromise1 = wrapper.vm.close();

        // 第二次调用 close，应该返回相同的 Promise
        const closePromise2 = wrapper.vm.close();

        expect(closePromise1).toBeInstanceOf(Promise);

        expect(closePromise2).toBeInstanceOf(Promise);

        // 验证两个 Promise 是相同的
        expect(closePromise1).toEqual(closePromise2);

        await expect(closePromise1).resolves.toBeInstanceOf(Event);

        expect(wrapper.vm.readyState).toBe(2);
    });

    it('should be call onopen,connect,close,error,message method, when you init', async () => {
        const mockOpenFn = jest.fn(() => {});
        const mockConnectFn = jest.fn(() => {});
        const mockCloseFn = jest.fn(() => {});
        const mockMessageFn = jest.fn(() => {});

        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { data, close, connect } = useSSE('/test-url1', {
                    onopen: mockOpenFn,
                    onclose: mockCloseFn,
                    onmessage: mockMessageFn,
                    onconnect: mockConnectFn
                });
                return {
                    data,
                    close,
                    connect
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        await sleep(CONNECT_DELAY);

        expect(mockConnectFn).toBeCalledTimes(1);
        expect(mockConnectFn).toBeCalledWith(expect.any(EventSource));
        expect(mockConnectFn).toHaveReturnedWith(undefined);

        expect(mockOpenFn).toBeCalledTimes(1);
        expect(mockOpenFn).toBeCalledWith(new Event('open'));
        expect(mockOpenFn).toHaveReturnedWith(undefined);

        EventSource._trigger('onmessage', 'message');
        expect(mockMessageFn).toBeCalledTimes(1);
        expect(mockMessageFn).toBeCalledWith(expect.any(MessageEvent));
        expect(mockMessageFn).toHaveReturnedWith(undefined);
        expect(wrapper.vm.data).toBe('message');

        EventSource.instance.close();

        await sleep(CONNECT_DELAY);

        expect(mockCloseFn).toBeCalledTimes(1);
        expect(mockCloseFn).toBeCalledWith(expect.any(Event));
        expect(mockCloseFn).toHaveReturnedWith(undefined);
    });
});
