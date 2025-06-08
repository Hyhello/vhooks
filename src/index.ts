import setup from './global/setup';

import useSSE from './hook/useSSE';
import useForm from './hook/useForm';
import useEmit from './hook/useEmit';
import usePaging from './hook/usePaging';
import useCopyText from './hook/useCopyText';

export { default as setup } from './global/setup';

export { default as useSSE } from './hook/useSSE';
export { default as useForm } from './hook/useForm';
export { default as useEmit } from './hook/useEmit';
export { default as usePaging } from './hook/usePaging';
export { default as useCopyText } from './hook/useCopyText';

export default {
    setup,
    useSSE,
    useForm,
    useEmit,
    usePaging,
    useCopyText
};
