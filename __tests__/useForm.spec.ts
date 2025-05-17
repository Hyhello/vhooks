/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import useForm from '@/hook/useForm';
import { errorFmt } from '@/utils';
import { mount } from '@vue/test-utils';

interface TestComponentInstance {
    setup(): ReturnType<typeof useForm>;
    [key: string]: unknown;
}

describe('useForm', () => {
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
        expect(useForm).toBeDefined();
        expect(typeof useForm).toBe('function');
    });

    it('should throw an error when the passed argument is not an object', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                return {};
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        // 检查是否抛出错误
        expect(() => useForm('invalid-parameter')).toThrowError(errorFmt('initValue must be an object.'));
    });

    it('should be a object', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { form } = useForm();
                return {
                    form
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(typeof wrapper.vm.form).toBe('object');
    });

    it('Pass parameters without providing a configuration file, and the parameters should be a non-nested object', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { form, resetFields } = useForm({ a: 1 });
                return {
                    form,
                    resetFields
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.form.a).toBe(1);
        expect(typeof wrapper.vm.resetFields).toBe('function');

        wrapper.vm.form.a = 2;

        wrapper.vm.resetFields();

        expect(wrapper.vm.form.a).toBe(1);
    });

    it('pass parameters without providing a configuration file, and the parameters should be a nested object', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { form, resetFields } = useForm({ a: { b: 1 } });
                return {
                    form,
                    resetFields
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.form.a.b).toBe(1);
        expect(typeof wrapper.vm.resetFields).toBe('function');

        wrapper.vm.form.a.b = 2;

        wrapper.vm.resetFields();

        expect(wrapper.vm.form.a.b).toBe(1);

        wrapper.vm.form.a.b = 3;

        wrapper.vm.resetFields();

        expect(wrapper.vm.form.a.b).toBe(1);
    });
});
