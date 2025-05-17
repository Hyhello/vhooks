/**
 * copy text to clipboard
 * @param {string} text text to copy
 * @returns Promise<void>
 */
export default function copyText(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if ('navigator' && 'clipboard' in navigator) {
            window.navigator.clipboard.writeText(text).then(resolve).catch(reject);
        } else {
            try {
                // copy from https://github.com/zenorocha/clipboard.js/blob/master/src/common/create-fake-element.js
                const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
                const ETextArea = document.createElement('textarea');

                ETextArea.style.position = 'fixed';
                ETextArea.style.fontSize = '12pt';
                ETextArea.style.opacity = '0';
                ETextArea.style[isRTL ? 'right' : 'left'] = '-9999px';
                document.body.appendChild(ETextArea);

                ETextArea.value = text;
                ETextArea.focus();
                ETextArea.select();
                document.execCommand('copy');
                ETextArea.remove();

                resolve();
            } catch (e) {
                reject(e);
            }
        }
    });
}
