import { ref, type Ref } from 'vue-demi';
import { copyText } from '@/utils';
import { createConfig, type GlobalConfigType } from '../global/config';

type UseCopyTextOptions = GlobalConfigType['useCopyText'];

interface UseCopyTextReturn {
    copy: (text: string) => Promise<void>;
    copied: Ref<boolean>;
}

/**
 * 复制文本钩子函数
 * @param options 配置项（可选）
 * @returns 返回值 { copy, copied }
 * @example
 *  import { useCopyText } from 'vu-hooks';
 *  const { copy, copied } = useCopyText();
 */
export default function useCopyText(options?: UseCopyTextOptions): UseCopyTextReturn {
    const copied = ref(false);

    // 全局配置
    const GLOBAL_CONFIG = createConfig();

    const COPIED_DURING = options?.copiedDuring || GLOBAL_CONFIG['useCopyText'].copiedDuring;

    let timer = 0;
    const timeout = function () {
        if (timer) {
            window.clearTimeout(timer);
            timer = 0;
        }
        timer = window.setTimeout(() => {
            copied.value = false;
        }, COPIED_DURING);
    };

    const copy = async function (text: string): Promise<void> {
        await copyText(text);
        copied.value = true;
        timeout();
    };

    return {
        copy,
        copied
    };
}
