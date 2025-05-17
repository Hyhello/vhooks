/**
 * 获取设备类型
 * @returns boolean
 */
export default function isMobile(): boolean {
    if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase();
        return /mobile|android|iphone|ipod|ipad|blackberry|iemobile|opera mini/i.test(userAgent);
    }
    return false;
}
