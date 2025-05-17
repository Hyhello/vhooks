import { ref, type Ref } from 'vue-demi';
import { deepClone, isObject } from '@hyhello/utils';

import { errorFmt } from '@/utils';

interface UseFormReturn<T> {
    form: Ref<T>;
    resetFields: () => void;
}

/**
 * 表单逻辑方法
 * @param initValue 初始值
 * @returns 返回值 { form, resetFields }
 * @example
 *  import { useForm } from 'vu-hooks';
 *  const { form, resetFields } = useForm({ name: 'hyhello', age: 18 });
 */
export default function useForm<T extends object>(initValue: T = {} as T): UseFormReturn<T> {
    if (!isObject(initValue)) {
        throw new Error(errorFmt('initValue must be an object.'));
    }

    const form = ref<T>(deepClone(initValue)) as Ref<T>;

    const resetFields = () => {
        form.value = deepClone(initValue);
    };

    return {
        form,
        resetFields
    };
}
