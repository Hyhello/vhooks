import { ref, unref, toRaw, type Ref, type Raw, type MaybeRef } from 'vue-demi';
import { deepClone, isObject } from '@hyhello/utils';

import { errorFmt } from '@/utils';

interface UseFormReturn<T> {
    form: Ref<Raw<T>>;
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
export default function useForm<T extends object>(initValue: MaybeRef<T> = {} as T): UseFormReturn<T> {
    if (!isObject(initValue)) {
        throw new Error(errorFmt('initValue must be an object.'));
    }

    const rawInitValue = toRaw(unref(initValue));

    const form = ref(deepClone(rawInitValue)) as Ref<Raw<T>>;

    const resetFields = () => {
        form.value = deepClone(rawInitValue);
    };

    return {
        form,
        resetFields
    };
}
