/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import usePaging from '@/hook/usePaging';
import { mount, flushPromises } from '@vue/test-utils';

import { errorFmt } from '@/utils';

const fetchMethod = jest.fn((params: Record<string, number>) => {
    return Promise.resolve({
        list: Array.from(Array(10)).map((_, index) => [{ id: index, name: 'Test' }]),
        total: 100,
        pageSize: params.pageSize,
        pageNo: params.pageNo
    });
});

const fetchMethod1 = jest.fn((params: Record<string, number>) => {
    return Promise.resolve({
        list: Array.from(Array(10)).map((_, index) => [{ id: index, name: 'Test' }]),
        total: undefined,
        pageNo: undefined,
        pageSize: undefined
    });
});

const fetchErrorMethod = jest.fn((params: Record<string, number>) => {
    return Promise.reject(new Error('Fetch error'));
});

const fetchErrorMethod1 = jest.fn((params: Record<string, number>) => {
    return Promise.reject('Fetch error');
});

const errorHandler = jest.fn((error: Error) => {
    // console.log(error);
});

let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
    // 创建一个 spy 来监听 console.error 的调用
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    // 清理 spy
    consoleErrorSpy.mockRestore();
});

describe('usePaging', () => {
    it('should be defined', () => {
        expect(usePaging).toBeDefined();
    });

    it('should be work by default', async () => {
        const wrapper = mount({
            setup() {
                const {
                    list,
                    total,
                    loading,
                    isPageShow,
                    fetchData,
                    getRowIndex,
                    handleReset,
                    handleRefresh,
                    handlePageChange,
                    handleSizeChange,
                    handleSearch
                } = usePaging(fetchMethod);
                return {
                    list,
                    total,
                    loading,
                    isPageShow,
                    fetchData,
                    getRowIndex,
                    handleReset,
                    handleRefresh,
                    handlePageChange,
                    handleSizeChange,
                    handleSearch
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(1);

        // 断言列表数据
        expect(wrapper.vm.list.length).toBe(10);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10 });
        // 断言总数据量
        expect(wrapper.vm.total).toEqual(100);
        // 断言加载状态
        expect(wrapper.vm.loading).toEqual(false);
        // 断言分页是否显示
        expect(wrapper.vm.isPageShow).toEqual(true);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第二页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(2);

        // handlePageChange
        wrapper.vm.handlePageChange(2);

        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(2);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 2, pageSize: 10 });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第三页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(12);

        // handleSizeChange
        wrapper.vm.handleSizeChange(20);

        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(3);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 20 });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第二页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(2);

        // handleSizeChange
        wrapper.vm.handleReset();

        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(4);

        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10 });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第二页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(2);

        // handleSizeChange
        wrapper.vm.handleSearch();

        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(5);

        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10 });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第二页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(2);

        // handleSizeChange
        wrapper.vm.handleRefresh(1);

        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(6);

        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 2, pageSize: 10 });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第二页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(12);

        // handleSizeChange
        wrapper.vm.handleRefresh(-11);

        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(7);

        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10 });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore，第二页，每页10条，第2条数据，行号从0开始
        expect(wrapper.vm.getRowIndex(1)).toBe(2);
    });

    it('should be work has fetchData & options', async () => {
        const wrapper = mount({
            setup() {
                const { list, fetchData } = usePaging(
                    fetchMethod,
                    {
                        type: 1
                    },
                    {
                        props: {
                            pageNo: 'pageNum',
                            pageSize: 'pageSz',
                            total: 'totals'
                        },
                        errorHandler
                    }
                );
                return {
                    list,
                    fetchData
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(1);
        expect(errorHandler).toBeCalledTimes(1);
        expect(fetchMethod).toBeCalledWith({ pageNum: 1, pageSz: 10, type: 1 });

        // 断言列表数据，报错了，所以不会赋值
        expect(wrapper.vm.list.length).toBe(0);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNum: 1, pageSz: 10, type: 1 });
    });

    it('should be work with mode infinite', async () => {
        const wrapper = mount({
            setup() {
                const { list, fetchData, getRowIndex, handleSearch, handleRefresh, handlePageChange } = usePaging(
                    fetchMethod,
                    {
                        type: 1
                    },
                    {
                        mode: 'infinite'
                    }
                );
                return {
                    list,
                    fetchData,
                    getRowIndex,
                    handleSearch,
                    handleRefresh,
                    handlePageChange
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(1);
        expect(fetchMethod).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });

        expect(wrapper.vm.list.length).toBe(10);
        // 断言请求参数
        expect(wrapper.vm.getRowIndex(1)).toBe(-1);

        expect(consoleErrorSpy).toBeCalledTimes(1);

        // 如果需要检查调用的参数
        expect(consoleErrorSpy).toHaveBeenCalledWith(errorFmt('getRowIndex is not supported in infinite mode.'));

        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });

        wrapper.vm.handlePageChange(2);
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(2);
        expect(fetchMethod).toBeCalledWith({ pageNo: 2, pageSize: 10, type: 1 });
        // 断言列表数据
        expect(wrapper.vm.list.length).toBe(20);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 2, pageSize: 10, type: 1 });

        wrapper.vm.handleSearch();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(3);
        expect(fetchMethod).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });
        // 断言列表数据
        expect(wrapper.vm.list.length).toBe(10);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });

        wrapper.vm.handleRefresh();
        await flushPromises();
        // 断言 console.error 是否被调用
        expect(consoleErrorSpy).toBeCalledTimes(2);

        // 如果需要检查调用的参数
        expect(consoleErrorSpy).toHaveBeenCalledWith(errorFmt('handleRefresh is not supported in infinite mode.'));
        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(3);
        expect(fetchMethod).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });
        // 断言列表数据
        expect(wrapper.vm.list.length).toBe(10);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });
    });

    it('should be work with autoload false', async () => {
        const wrapper = mount({
            setup() {
                const { list, fetchData, handleSearch, handleRefresh, handlePageChange } = usePaging(
                    fetchMethod,
                    {
                        type: 1
                    },
                    {
                        autoload: false
                    }
                );
                return {
                    list,
                    fetchData,
                    handleSearch,
                    handleRefresh,
                    handlePageChange
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        expect(fetchMethod).toBeCalledTimes(0);

        wrapper.vm.handleSearch();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod).toBeCalledTimes(1);
        expect(fetchMethod).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });
        // 断言列表数据，报错了，所以不会赋值
        expect(wrapper.vm.list.length).toBe(10);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });
    });

    it('should be work by return other data', async () => {
        const wrapper = mount({
            setup() {
                const { list, fetchData } = usePaging(fetchMethod1, {
                    type: 1
                });
                return {
                    list,
                    fetchData
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchMethod1).toBeCalledTimes(1);
        expect(fetchMethod1).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });
        // 断言列表数据，报错了，所以不会赋值
        expect(wrapper.vm.list.length).toBe(10);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });
    });

    it('should be not work', async () => {
        const wrapper = mount({
            setup() {
                const { list, fetchData } = usePaging(
                    fetchErrorMethod,
                    {
                        type: 1
                    },
                    {
                        errorHandler
                    }
                );
                return {
                    list,
                    fetchData
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchErrorMethod).toBeCalledTimes(1);
        expect(errorHandler).toBeCalledTimes(1);
        expect(errorHandler).toBeCalledWith(expect.any(Error));
        expect(fetchErrorMethod).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });
        // 断言列表数据，报错了，所以不会赋值
        expect(wrapper.vm.list.length).toBe(0);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });
    });

    it('should be not work other', async () => {
        const wrapper = mount({
            setup() {
                const { list, fetchData } = usePaging(
                    fetchErrorMethod1,
                    {
                        type: 1
                    },
                    {
                        errorHandler
                    }
                );
                return {
                    list,
                    fetchData
                };
            },
            template: '<div></div>'
        });

        // 等待异步操作完成
        await wrapper.vm.$nextTick();
        await flushPromises();

        // 断言 fetchMethod 被调用
        expect(fetchErrorMethod1).toBeCalledTimes(1);
        expect(errorHandler).toBeCalledTimes(1);
        expect(errorHandler).toBeCalledWith(expect.any(Error));
        expect(fetchErrorMethod1).toBeCalledWith({ pageNo: 1, pageSize: 10, type: 1 });
        // 断言列表数据，报错了，所以不会赋值
        expect(wrapper.vm.list.length).toBe(0);
        // 断言请求参数
        expect(wrapper.vm.fetchData).toEqual({ pageNo: 1, pageSize: 10, type: 1 });
    });
});
