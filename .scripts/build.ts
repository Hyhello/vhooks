import { defineConfig } from 'tsup';
import pkg from '../package.json';

export default defineConfig({
    entryPoints: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    minify: true,
    splitting: true,
    define: {
        __NAMESPACE__: JSON.stringify(pkg.name)
    },
    outExtension() {
        return { js: '.min.mjs' };
    },
    esbuildOptions(options) {
        options.legalComments = 'none';
    }
});
