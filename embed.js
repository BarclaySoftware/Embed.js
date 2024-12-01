// Advanced Embed.js Library with Alignment Option
(function (global) {
    class Embed {
        constructor() {
            this.frames = [];
        }

        // Add a new frame with custom options
        create(options) {
            const defaults = {
                size: { width: "600px", height: "400px" },
                source: "https://thejupitergroup.wixstudio.com/iframe",
                uuid: this.generateUUID(),
                parent: document.body,
                styles: {},
                allow: "", // Allow attributes like "fullscreen", "camera", etc.
                sandbox: "", // Sandbox attributes like "allow-scripts"
                title: "Embedded Frame",
                className: "", // Custom CSS class
                // preventRightClick: false, // Disable right-click inside the iframe
                preventRedirects: false, // Block iframe navigation/redirects
                onLoad: null, // onLoad callback
                onPreventedRedirect: null, // Callback for prevented redirects
                alignment: "left", // Placement: "left", "center", or "right"
            };

            // Merge user options with defaults
            const config = { ...defaults, ...options };

            // Create the iframe container for alignment
            const iframeContainer = document.createElement("div");
            iframeContainer.style.display = "flex";
            iframeContainer.style.justifyContent = this.getAlignment(config.alignment);
            iframeContainer.style.margin = "10px 0";

            // Create the iframe
            const iframe = document.createElement("iframe");
            iframe.src = config.source;
            iframe.width = config.size.width.replace("px", "");
            iframe.height = config.size.height.replace("px", "");
            iframe.id = config.uuid;
            iframe.title = config.title;
            iframe.style.border = "0";

            // Apply custom styles
            Object.entries(config.styles).forEach(([key, value]) => {
                iframe.style[key] = value;
            });

            // Add class name
            if (config.className) {
                iframe.className = config.className;
            }

            // Set allow and sandbox attributes
            if (config.allow) iframe.setAttribute("allow", config.allow);
            if (config.sandbox) iframe.setAttribute("sandbox", config.sandbox);

            // Append iframe to the container
            iframeContainer.appendChild(iframe);

            // Append to the specified parent
            if (config.parent instanceof HTMLElement) {
                config.parent.appendChild(iframeContainer);
            } else {
                console.warn("Invalid parent element. Using document.body instead.");
                document.body.appendChild(iframeContainer);
            }

            // Bind the onLoad event if provided
            if (typeof config.onLoad === "function") {
                iframe.onload = () => config.onLoad(iframe);
            }

            // Prevent right-click if enabled
            // if (config.preventRightClick) {
            //     this.preventIframeRightClick(iframe);
            // }
            

            // Prevent redirects if enabled
            if (config.preventRedirects) {
                this.preventIframeRedirects(iframe, config.onPreventedRedirect);
            }

            // Store the frame's configuration
            this.frames.push({ uuid: config.uuid, iframe, config, container: iframeContainer });

            return iframe;
        }

        // Update iframe properties dynamically
        update(uuid, options) {
            const frame = this.get(uuid);
            if (!frame) {
                console.warn(`No frame found with UUID: ${uuid}`);
                return false;
            }

            const iframe = frame.iframe;

            // Update source
            if (options.source) iframe.src = options.source;

            // Update size
            if (options.size) {
                iframe.width = options.size.width.replace("px", "");
                iframe.height = options.size.height.replace("px", "");
            }

            // Update styles
            if (options.styles) {
                Object.entries(options.styles).forEach(([key, value]) => {
                    iframe.style[key] = value;
                });
            }

            // Update alignment
            if (options.alignment) {
                const container = frame.container;
                container.style.justifyContent = this.getAlignment(options.alignment);
            }

            // Update allow and sandbox attributes
            if (options.allow) iframe.setAttribute("allow", options.allow);
            if (options.sandbox) iframe.setAttribute("sandbox", options.sandbox);

            // Update configuration in stored frames
            frame.config = { ...frame.config, ...options };

            return true;
        }

        // Remove a frame by its UUID
        remove(uuid) {
            const frameIndex = this.frames.findIndex((frame) => frame.uuid === uuid);
            if (frameIndex !== -1) {
                const frame = this.frames[frameIndex];
                frame.container.remove(); // Remove the container and iframe
                this.frames.splice(frameIndex, 1);
                return true;
            } else {
                console.warn(`No frame found with UUID: ${uuid}`);
                return false;
            }
        }

        // Get a frame by its UUID
        get(uuid) {
            return this.frames.find((frame) => frame.uuid === uuid) || null;
        }

        // List all frames
        list() {
            return this.frames;
        }

        // Resize a frame by its UUID
        resize(uuid, size) {
            const frame = this.get(uuid);
            if (!frame) {
                console.warn(`No frame found with UUID: ${uuid}`);
                return false;
            }

            const iframe = frame.iframe;
            iframe.width = size.width.replace("px", "");
            iframe.height = size.height.replace("px", "");

            // Update configuration in stored frames
            frame.config.size = size;

            return true;
        }

        // Get CSS justify-content value for alignment
        getAlignment(alignment) {
            switch (alignment.toLowerCase()) {
                case "center":
                    return "center";
                case "right":
                    return "flex-end";
                case "left":
                default:
                    return "flex-start";
            }
        }

        // Prevent right-click in iframe
        // Prevent right-click in iframe
        // preventIframeRightClick(iframe) {
        //     iframe.addEventListener("load", () => {
        //         const iframeWindow = iframe.contentWindow;
        //         const iframeDoc = iframe.contentDocument || iframeWindow.document;
        //
        //         if (iframeDoc) {
        //             try {
        //                 // Attach a contextmenu event listener to the iframe's document
        //                 iframeDoc.addEventListener("contextmenu", (e) => {
        //                     e.preventDefault();
        //                     console.warn("Right-click is disabled inside the iframe.");
        //                 });
        //
        //                 // For older browsers or strict sandboxed iframes, fallback to disabling the iframe window event
        //                 iframeWindow.addEventListener("contextmenu", (e) => {
        //                     e.preventDefault();
        //                     console.warn("Right-click is disabled inside the iframe (fallback).");
        //                 });
        //             } catch (err) {
        //                 console.error(
        //                     "Unable to attach right-click prevention to iframe. Make sure the iframe is hosted on the same origin.",
        //                     err
        //                 );
        //             }
        //         }
        //     });
        // }

        // Prevent iframe redirects
        preventIframeRedirects(iframe, onPreventedRedirect) {
            iframe.addEventListener("load", () => {
                const iframeWindow = iframe.contentWindow;

                // Override window.open to block new tabs or windows
                iframeWindow.open = function () {
                    console.warn("Redirects are disabled inside the iframe.");
                    if (typeof onPreventedRedirect === "function") {
                        onPreventedRedirect("Blocked an attempt to open a new window.");
                    }
                    return null;
                };

                // Monitor changes to iframe's location
                const originalLocation = iframeWindow.location.href;
                const observer = setInterval(() => {
                    if (iframeWindow.location.href !== originalLocation) {
                        console.warn("Redirect attempt detected and prevented.");
                        iframeWindow.location.href = originalLocation; // Revert to original location
                        if (typeof onPreventedRedirect === "function") {
                            onPreventedRedirect("Blocked an attempt to navigate away.");
                        }
                    }
                }, 100);
            });
        }

        // Generate a unique identifier
        generateUUID() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
    }

    // Attach the library to the global scope
    global.embed = new Embed();
})(window);
