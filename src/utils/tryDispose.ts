import { onScopeDispose, onBeforeUnmount, getCurrentScope } from 'vue-demi';

export default function tryDispose(disposeFn: () => void) {
    // supported by vue3 setup
    if (getCurrentScope()) {
        onScopeDispose(disposeFn);
    }

    onBeforeUnmount(disposeFn);
}
