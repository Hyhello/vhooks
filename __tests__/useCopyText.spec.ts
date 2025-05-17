/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import useCopyText from '@/hook/useCopyText';
import { mount } from '@vue/test-utils';
import { sleep } from './helpers/_utils';

describe('useCopyText work in clipboard', () => {
    it('should be defined', () => {
        expect(useCopyText).toBeDefined();
    });

    let write_text = '';

    beforeAll(() => {
        global.window.navigator.clipboard = {
            writeText: (text: string) => {
                write_text = text;
                const _promiseFn = jest.fn().mockResolvedValue();
                return _promiseFn();
            }, // 模拟成功的复制
            readText: () => jest.fn().mockResolvedValue(write_text)() // 模拟读取的文本
        };
    });

    afterAll(() => {
        delete global.window.navigator.clipboard;
    });

    it('work in clipboard api', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { copied, copy } = useCopyText();
                return {
                    copied,
                    copy
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.copied).toBe(false);
        expect(wrapper.vm.copy).toBeInstanceOf(Function);

        await expect(wrapper.vm.copy('text')).resolves.toBeUndefined();

        expect(wrapper.vm.copied).toBe(true);

        expect(write_text).toBe('text');

        await expect(global.navigator.clipboard.readText()).resolves.toBe('text');

        await sleep(1500);

        expect(wrapper.vm.copied).toBe(false);
    });

    it('work in clipboard api & options', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { copied, copy } = useCopyText({ copiedDuring: 200 });
                return {
                    copied,
                    copy
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.copied).toBe(false);
        expect(wrapper.vm.copy).toBeInstanceOf(Function);

        const pro1 = wrapper.vm.copy('text');

        const pro2 = wrapper.vm.copy('text');

        await expect(pro2).resolves.toBeUndefined();

        expect(wrapper.vm.copied).toBe(true);

        expect(write_text).toBe('text');

        await expect(global.navigator.clipboard.readText()).resolves.toBe('text');

        await sleep(200);

        expect(wrapper.vm.copied).toBe(false);
    });
});

describe('useCopyText work in execCommand', () => {
    const write_text = 'text';

    let originGetSelection;
    let originDir;

    beforeAll(() => {
        originDir = global.document.documentElement.getAttribute('dir');
        global.document.documentElement.setAttribute('dir', 'rtl');
        originGetSelection = global.document.getSelection;
        global.document.execCommand = (command: string, showUI: boolean, value: string) => {
            return true;
        };
        global.document.getSelection = function () {
            return new Object(write_text);
        };
    });

    afterAll(() => {
        delete global.document.execCommand;
        global.document.documentElement.setAttribute('dir', originDir);
        global.document.getSelection = originGetSelection;
    });

    it('work in execCommand api', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { copied, copy } = useCopyText({ copiedDuring: 200 });
                return {
                    copied,
                    copy
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.copied).toBe(false);
        expect(wrapper.vm.copy).toBeInstanceOf(Function);

        await expect(wrapper.vm.copy('text')).resolves.toBeUndefined();

        expect(wrapper.vm.copied).toBe(true);

        expect(write_text).toBe('text');

        expect(global.document.getSelection()?.toString()).toBe('text');

        await sleep(200);

        expect(wrapper.vm.copied).toBe(false);
    });
});

describe('useCopyText work in execCommand with error', () => {
    it('work in execCommand api with error', async () => {
        const wrapper = mount<TestComponentInstance>({
            setup() {
                const { copied, copy } = useCopyText({ copiedDuring: 200 });
                return {
                    copied,
                    copy
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.copied).toBe(false);

        expect(wrapper.vm.copy).toBeInstanceOf(Function);

        await expect(wrapper.vm.copy('text')).rejects.toBeInstanceOf(Error);
    });
});
