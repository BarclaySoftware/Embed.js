// webview-api.js
class CustomWebView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found.`);
        }

        this.iframe = document.createElement('iframe');
        this.iframe.style.border = 'none';
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';

        this.container.appendChild(this.iframe);
    }

    loadUrl(url) {
        this.iframe.src = url;
    }

    loadHtml(htmlContent) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        this.iframe.src = URL.createObjectURL(blob);
    }

    clear() {
        this.iframe.src = 'about:blank';
    }
}
