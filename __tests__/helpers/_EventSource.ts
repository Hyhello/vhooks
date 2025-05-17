// 简易实现 EventSource

// mock连接时间
export const CONNECT_DELAY = 10; // ms

export class EventSource {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSED = 2;
    static instance: EventSource;
    url: string | URL;
    readyState: 0 | 1 | 2;
    withCredentials: boolean;
    _isOpen: boolean;
    onerror?: (ev: Event) => void;
    onmessage?: (ev: MessageEvent) => void;
    onopen?: (ev: Event) => void;
    constructor(url: string | URL, options?: EventSourceInit) {
        this.url = url;
        this.readyState = 0; // CONNECTING
        this._isOpen = false;
        this.withCredentials = options?.withCredentials || false;

        EventSource.instance = this;

        setTimeout(() => {
            this.readyState = 1; // OPEN
            this._isOpen = true;
            EventSource._trigger('onopen', 'open');
        }, CONNECT_DELAY);
    }
    static _trigger(event: 'onmessage' | 'onerror' | 'onopen', data: string) {
        const fn = EventSource.instance[event] as (ev: Event | MessageEvent) => void;
        if (fn) {
            const _Event = event === 'onmessage' ? MessageEvent : Event;
            fn(new _Event(event.substring(2), { data }));
        }
    }
    close() {
        setTimeout(() => {
            this.readyState = 2; // CLOSED
            this._isOpen = false;
            EventSource._trigger('onerror', 'error');
        }, CONNECT_DELAY);
    }
}
