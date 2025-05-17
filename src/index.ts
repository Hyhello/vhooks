import setup from './global/setup';

import useSSE from './hook/useSSE';
import useForm from './hook/useForm';
import useEmitt from './hook/useEmitt';
import usePaging from './hook/usePaging';
import useCopyText from './hook/useCopyText';

export { default as setup } from './global/setup';

export { default as useSSE } from './hook/useSSE';
export { default as useForm } from './hook/useForm';
export { default as useEmitt } from './hook/useEmitt';
export { default as usePaging } from './hook/usePaging';
export { default as useCopyText } from './hook/useCopyText';

export default {
    setup,
    useSSE,
    useForm,
    useEmitt,
    usePaging,
    useCopyText
};
