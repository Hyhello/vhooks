/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import useEmit from '@/hook/useEmit';
import { mount } from '@vue/test-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = jest.fn((params: any) => {
    // console.log(params);
});

interface TestComponentInstance {
    setup(): ReturnType<typeof useEmit>;
    [key: string]: unknown;
}

describe('useEmitt', () => {
    it('should be defined', () => {
        expect(useEmit).toBeDefined();
    });

    it('work with one way', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const emitter = useEmit();
                return {
                    emitter
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        wrapper.vm.emitter.on('test', mockFn);

        expect(wrapper.vm.emitter.all.size).toBe(1);

        expect(mockFn).toBeCalledTimes(0);

        wrapper.vm.emitter.emit('test', 1);

        expect(mockFn).toBeCalledTimes(1);

        expect(mockFn).toBeCalledWith(1);

        wrapper.vm.emitter.off('test', mockFn);

        wrapper.vm.emitter.emit('test', 1);

        expect(mockFn).toBeCalledTimes(1);

        expect(wrapper.vm.emitter.all.get('test')).toEqual([]);
    });

    it('work with another way', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const emitter = useEmit({
                    name: 'test',
                    callback: mockFn
                });
                return {
                    emitter
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(mockFn).toBeCalledTimes(0);

        expect(wrapper.vm.emitter.all.size).toBe(1);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wrapper.vm.emitter.emit('test', 2, 1, 3);

        expect(mockFn).toBeCalledTimes(1);

        expect(mockFn).toBeCalledWith(2);

        wrapper.unmount();

        wrapper.vm.emitter.emit('test', 1);

        expect(mockFn).toBeCalledTimes(1);

        expect(wrapper.vm.emitter.all.get('test')).toEqual([]);
    });

    it('work with Array', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const emitter = useEmit([{
                    name: 'test',
                    callback: mockFn
                }]);
                return {
                    emitter
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(mockFn).toBeCalledTimes(0);

        expect(wrapper.vm.emitter.all.size).toBe(1);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wrapper.vm.emitter.emit('test', 2, 1, 3);

        expect(mockFn).toBeCalledTimes(1);

        expect(mockFn).toBeCalledWith(2);

        wrapper.unmount();

        wrapper.vm.emitter.emit('test', 1);

        expect(mockFn).toBeCalledTimes(1);

        expect(wrapper.vm.emitter.all.get('test')).toEqual([]);
    });
});
