import pkg from '../package.json';

declare global {
    const __NAMESPACE__: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.__NAMESPACE__ = pkg.name;

// 兼容vue2及vue3的jest配置;
const setupVue = () => {
    if (!process.env.VUE_VERSION) {
        throw new Error('VUE_VERSION is not defined. Please set it before running Jest.');
    }

    console.log(`\n🔧 Setting up Jest for Vue ${process.env.VUE_VERSION}...\n`);

    // 强制 `vue-demi` 重新加载 Vue 版本
    process.env.VUE_DEMI_FORCE_RELOAD = 'true';

    // 直接 require `vue-demi`，确保它使用正确的 Vue 版本
    require('vue-demi');
};

setupVue();

export {};
