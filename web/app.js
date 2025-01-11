// app.js
document.addEventListener('DOMContentLoaded', () => {
    const webView = new CustomWebView('webview-container');

    // Load example HTML content
    const exampleHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Example WebView</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
                h1 { color: #4CAF50; }
                p { font-size: 18px; }
            </style>
        </head>
        <body>
            <h1>Welcome to the Fullscreen WebView!</h1>
            <p>This is an example of loading HTML content dynamically.</p>
        </body>
        </html>
    `;

    // Load the example HTML or use a URL
    const loadExample = true; // Set to false to load a URL

    if (loadExample) {
        webView.loadHtml(exampleHtml);
    } else {
        webView.loadUrl('https://www.example.com');
    }
});
