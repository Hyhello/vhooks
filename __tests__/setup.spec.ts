// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import setup from '@/global/setup';
import { createConfig } from '@/global/config';

describe('setup', () => {
    it('should be defined', () => {
        expect(setup).toBeDefined();
    });

    const config = createConfig();

    it('should create a config', () => {
        expect(config).toBeDefined();
    });

    it('should set usePaging config', () => {
        setup('usePaging', {
            props: {
                pageSize: 'pageSize1',
                pageNo: 'pageNo2',
                total: 'total2'
            },
            default: {
                pageSize: 12,
                pageNo: 2,
                total: 10
            },
            mode: 'standard',
            autoload: false
        });

        expect(config.usePaging.props.pageSize).toBe('pageSize1');
        expect(config.usePaging.props.pageNo).toBe('pageNo2');
        expect(config.usePaging.props.total).toBe('total2');
        expect(config.usePaging.default.pageSize).toBe(12);
        expect(config.usePaging.default.pageNo).toBe(2);
        expect(config.usePaging.default.total).toBe(10);
        expect(config.usePaging.mode).toBe('standard');
        expect(config.usePaging.autoload).toBeFalsy();
    });

    it('should set all config', () => {
        setup({
            usePaging: {
                props: {
                    pageSize: 'pageSize1',
                    pageNo: 'pageNo2',
                    total: 'total2'
                },
                default: {
                    pageSize: 12,
                    pageNo: 2,
                    total: 10
                },
                mode: 'infinite',
                autoload: true
            }
        });

        expect(config.usePaging.props.pageSize).toBe('pageSize1');
        expect(config.usePaging.props.pageNo).toBe('pageNo2');
        expect(config.usePaging.props.total).toBe('total2');
        expect(config.usePaging.default.pageSize).toBe(12);
        expect(config.usePaging.default.pageNo).toBe(2);
        expect(config.usePaging.default.total).toBe(10);
        expect(config.usePaging.mode).toBe('infinite');
        expect(config.usePaging.autoload).toBeTruthy();
    });

    it('should set name is not string or object', () => {
        expect(() => setup(() => {})).toThrowError(/Invalid arguments: name should be a string or an object\./);
    });
});
