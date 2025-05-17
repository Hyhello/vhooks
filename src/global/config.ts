import { isMobile } from '../utils';

// define mode
export const Mode = {
    INFINITE: 'infinite',
    STANDARD: 'standard'
} as const;

export interface GlobalConfigType {
    usePaging: {
        props: {
            pageSize: string;
            pageNo: string;
            total: string;
        };
        default: {
            pageSize: number; // 分页大小
            pageNo: number; // 当前页码
            total: number; // 总数
        };
        mode: (typeof Mode)[keyof typeof Mode];
        autoload: boolean;
    };
    useCopyText: {
        copiedDuring: number;
    };
}

// global_config;
let GLOBAL_CONFIG: GlobalConfigType;

// create config
export const createConfig = (): GlobalConfigType => {
    if (GLOBAL_CONFIG) return GLOBAL_CONFIG;
    return (GLOBAL_CONFIG = {
        usePaging: {
            props: {
                pageSize: 'pageSize',
                pageNo: 'pageNo',
                total: 'total'
            },
            default: {
                pageSize: 10,
                pageNo: 1,
                total: 0
            },
            mode: isMobile() ? Mode.INFINITE : Mode.STANDARD,
            autoload: true
        },
        useCopyText: {
            copiedDuring: 1500
        }
    });
};
