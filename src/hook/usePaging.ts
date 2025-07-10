/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref, Raw, ComputedRef, MaybeRef } from 'vue-demi';
import { ref, unref, toRaw, onMounted, computed } from 'vue-demi';
import { Mode, createConfig, type GlobalConfigType } from '../global/config';

import { errorFmt } from '@/utils';

/**
 * 分页响应结果
 * @property list - 分页数据列表
 * @property [key: string] - 其他自定义数据
 */
interface UsePagingResponseResultVO<T = unknown> {
    list: Array<T>;
    [key: string]: unknown;
}

/**
 * 分页配置项
 * @property errorHandler - 错误处理器
 * @property props - 自定义分页参数
 * @property default - 默认分页参数
 */
type UsePagingOptionsType = {
    errorHandler?: (error: Error) => void; // 错误处理器
} & Partial<GlobalConfigType['usePaging']>;

/**
 * usePaging 返回项
 * @property list - 分页数据列表
 * @property total - 总数据量
 * @property loading - 是否正在加载
 * @property fetchData - 请求参数
 * @property isPageShow - 是否展示分页
 * @property getRowIndex - 根据行号获取正确的行索引
 * @property handleReset - 重置分页数据到初始状态，并重新获取第一页的数据
 * @property handleSearch - 执行搜索操作，重置分页数据并获取第一页的数据
 * @property handleRefresh - 刷新当前页的数据，移动端不适用，建议本地处理，提升用户体验
 * @property handlePageChange - 页码变化时触发的数据获取方法
 * @property handleSizeChange - 每页显示条数变化时触发的方法
 */
interface UsePagingReturn<T extends Record<string, any>, U = unknown> {
    list: Ref<U[]>;
    total: Ref<number>;
    loading: Ref<boolean>;
    fetchData: Ref<T>;
    isPageShow: ComputedRef<boolean>;
    getRowIndex: (rowNum: number) => number;
    handleReset: () => void;
    handleSearch: () => void;
    handleRefresh: (changeValue?: number) => void;
    handlePageChange: (pageNo: number) => Promise<void>;
    handleSizeChange: (size: number) => void;
}

/**
 * 分页逻辑方法
 * @param fetchMethod 请求方法
 * @param fetchDefaults 请求参数 (可选)
 * @param options 配置项 (可选)
 * @returns 返回值 { list, total, loading, fetchData, isPageShow, getRowIndex, handleReset, handleSearch, handleRefresh, handlePageChange, handleSizeChange }
 * @example
 *  import { usePaging } from 'vu-hooks';
 *  const { list, total, loading, fetchData, isPageShow, getRowIndex, handleReset, handleSearch, handleRefresh, handlePageChange, handleSizeChange } = usePaging(fetchMethod, fetchDefaults, options);
 */
export default function usePaging<T extends Record<string, any>, U = unknown>(
    fetchMethod: (params: Raw<T>) => Promise<UsePagingResponseResultVO<U>>,
    fetchDefaults?: MaybeRef<T>,
    options?: UsePagingOptionsType
): UsePagingReturn<T, U> {
    const loading = ref(false);

    const list: Ref<U[]> = ref([]);

    const rawFetchDefaults = toRaw(unref(fetchDefaults || {}));

    // 全局配置
    const GLOBAL_CONFIG = createConfig();

    const DEFAULT_PAGING_GLOBAL_CONFIG = GLOBAL_CONFIG['usePaging'];

    const DEFAULT_PROP = { ...DEFAULT_PAGING_GLOBAL_CONFIG.props, ...(options?.props || {}) } as const;

    const DEFAULT_VALUE = { ...DEFAULT_PAGING_GLOBAL_CONFIG.default, ...(options?.default || {}) } as const;

    const autoload = options?.autoload ?? DEFAULT_PAGING_GLOBAL_CONFIG.autoload;

    const MODE = options?.mode || DEFAULT_PAGING_GLOBAL_CONFIG.mode;

    const total = ref<number>(DEFAULT_VALUE.total);

    const IS_INFINITE = MODE === Mode.INFINITE;

    // 默认分页参数
    const DEFAULT_PAGES = {
        [DEFAULT_PROP.pageNo]: DEFAULT_VALUE.pageNo,
        [DEFAULT_PROP.pageSize]: DEFAULT_VALUE.pageSize
    };

    // 初始化请求参数
    const fetchData = ref({
        ...rawFetchDefaults,
        ...DEFAULT_PAGES
    }) as Ref<T>;

    // 计算属性，判断分页是否展示
    const isPageShow = computed(() => {
        return total.value > 0;
    });

    // 错误是否捕获
    const errorHandler = function (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        err.message = errorFmt(err.message);
        if (options?.errorHandler) {
            options.errorHandler(err);
        } else {
            console.error(err.message);
        }
    };

    /**
     * 页码变化时触发的数据获取方法
     * @param pageNo 新的页码
     */
    const handlePageChange = async function (pageNo: number): Promise<void> {
        try {
            loading.value = true;

            const PropPageNo = DEFAULT_PROP.pageNo as keyof T;
            const PropPageSize = DEFAULT_PROP.pageSize as keyof T;
            const PropTotal = DEFAULT_PROP.total as keyof UsePagingResponseResultVO<U>;

            pageNo = Math.min(pageNo, Math.ceil(total.value / fetchData.value[PropPageSize]));

            pageNo = Math.max(pageNo, DEFAULT_VALUE.pageNo);

            // 判断是否追加，如果是追加，就将新的数据追加到列表中，否则就直接赋值
            const IS_APPEND = pageNo !== DEFAULT_VALUE.pageNo && IS_INFINITE;

            fetchData.value[PropPageNo] = pageNo as T[keyof T];

            // 获取列表
            const result = await fetchMethod(toRaw(fetchData.value));
            if (result && Array.isArray(result.list) && PropTotal in result) {
                list.value = IS_APPEND ? list.value.concat(result.list) : result.list;
                const totalValue = result[PropTotal as string] || 0;
                if (typeof totalValue === 'number') {
                    total.value = totalValue;
                }
                if (PropPageNo in result) {
                    const NoValue = result[PropPageNo as string] || pageNo;
                    if (typeof NoValue === 'number') {
                        fetchData.value[PropPageNo] = NoValue as T[keyof T];
                    }
                }
                if (PropPageSize in result) {
                    const sizeValue = result[PropPageSize as string] || fetchData.value[PropPageSize];
                    if (typeof sizeValue === 'number') {
                        fetchData.value[PropPageSize] = sizeValue as T[keyof T];
                    }
                }
            } else {
                throw new Error('Invalid response structure. Refer to UsePagingResponseResultVO for validation.');
            }
        } catch (error) {
            errorHandler(error);
        } finally {
            loading.value = false;
        }
    };

    /**
     * 根据行号获取正确的行索引
     * @param rowNum 行号，从 0 开始
     * @returns 正确的行索引
     */
    function getRowIndex(rowNum: number): number {
        if (IS_INFINITE) {
            errorHandler('getRowIndex is not supported in infinite mode.');
            return -1;
        } else {
            const PropPageNo = DEFAULT_PROP.pageNo as keyof T;
            const PropPageSize = DEFAULT_PROP.pageSize as keyof T;
            return (fetchData.value[PropPageNo] - 1) * fetchData.value[PropPageSize] + rowNum + 1;
        }
    }

    /**
     * 每页显示条数变化时触发的方法
     * @param size 新的每页显示条数
     */
    function handleSizeChange(size: number) {
        fetchData.value[DEFAULT_PROP.pageSize as keyof T] = size as T[keyof T];
        handlePageChange(DEFAULT_VALUE.pageNo);
    }
    /**
     * 触发搜索，获取第一页的数据
     */
    function handleSearch() {
        handlePageChange(DEFAULT_VALUE.pageNo);
    }

    /**
     * 刷新当前页的数据，移动端不适用，建议本地处理，提升用户体验
     * @param changeValue 数据变化值（如新增或删除数据）
     */
    function handleRefresh(changeValue = 0) {
        // 移动端不适用，建议本地处理，提升用户体验
        if (IS_INFINITE) return errorHandler('handleRefresh is not supported in infinite mode.');
        const pageNo: number = fetchData.value[DEFAULT_PROP.pageNo] as number;
        const pageSize: number = fetchData.value[DEFAULT_PROP.pageSize] as number;
        // 当前分页下面总共有多少条数据
        const currentCount = list.value.length + changeValue;
        // 计算需要跳转到的页码
        const pageDelta = Math.floor((currentCount + pageSize - 1) / pageSize) - 1;
        const targetPage = Math.max(pageNo + pageDelta, DEFAULT_VALUE.pageNo);
        handlePageChange(targetPage);
    }

    /**
     * 重置分页数据到初始状态，并重新获取第一页的数据
     */
    function handleReset() {
        fetchData.value = {
            ...rawFetchDefaults,
            ...DEFAULT_PAGES
        } as T;
        handleSearch();
    }

    // 组件挂载时，如果选项中设置了自动加载，则自动获取第一页的数据
    onMounted(() => {
        // 是否自动加载
        if (autoload) {
            handleSearch();
        }
    });

    return {
        list,
        total,
        loading,
        fetchData,
        isPageShow,
        getRowIndex,
        handleReset,
        handleSearch,
        handleRefresh,
        handlePageChange,
        handleSizeChange
    };
}
