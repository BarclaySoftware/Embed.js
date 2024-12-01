// Super Advanced Embed.js Library
(function (global) {
    class Embed {
        constructor() {
            this.frames = [];
        }

        // Add a new frame with custom options
        create(options) {
            const defaults = {
                size: { width: "600px", height: "400px" },
                source: "about:blank",
                // uuid: this.generateUUID(),
                parent: document.body,
                styles: {},
                allow: "", // Allow attributes like "fullscreen", "camera", etc.
                sandbox: "", // Sandbox attributes like "allow-scripts"
                title: "Embedded Frame",
                className: "", // Custom CSS class
                preventRightClick: false, // Disable right-click inside the iframe
                preventRedirects: false, // Block iframe navigation/redirects
                onLoad: null, // Callback for iframe load
                onPreventedRedirect: null, // Callback for prevented redirects
                alignment: "left", // Placement: "left", "center", or "right"
                resizable: false, // Enable resizing
                draggable: false, // Enable dragging
                opacity: 1.0, // Set iframe opacity
                lazyLoad: false, // Load iframe only when in viewport
                autoRefresh: null, // Auto-refresh interval in ms
                lockFrame: false, // Prevent resizing or dragging
                fullscreenButton: false, // Add fullscreen toggle button
                backgroundColor: null, // Set dynamic background color
                debug: false, // Enable debug logs
            };

            // Merge user options with defaults
            const config = { ...defaults, ...options };

            // Log creation in debug mode
            if (config.debug) console.log("Creating iframe with config:", config);

            // Create the iframe container for alignment
            const iframeContainer = document.createElement("div");
            iframeContainer.style.display = "flex";
            //iframeContainer.style.justifyContent = this.getAlignment(config.alignment);
            iframeContainer.style.margin = "10px 0";
            iframeContainer.style.position = "relative";

            // Apply lock styles if the frame is locked
            if (config.lockFrame) {
                iframeContainer.style.pointerEvents = "none";
            }

            // Create the iframe
            const iframe = document.createElement("iframe");
            iframe.src = config.lazyLoad ? "" : config.source; // Lazy load behavior
            iframe.width = config.size.width.replace("px", "");
            iframe.height = config.size.height.replace("px", "");
            iframe.id = config.uuid;
            iframe.title = config.title;
            iframe.style.border = "0";
            iframe.style.opacity = config.opacity;
            if (config.backgroundColor) iframe.style.backgroundColor = config.backgroundColor;

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

            // Add fullscreen button if enabled
            if (config.fullscreenButton) {
                const fullscreenButton = document.createElement("button");
                fullscreenButton.textContent = "Fullscreen";
                fullscreenButton.style.position = "absolute";
                fullscreenButton.style.top = "10px";
                fullscreenButton.style.right = "10px";
                fullscreenButton.style.zIndex = 1000;
                fullscreenButton.addEventListener("click", () => {
                    if (iframe.requestFullscreen) {
                        iframe.requestFullscreen();
                    } else if (iframe.webkitRequestFullscreen) {
                        iframe.webkitRequestFullscreen();
                    }
                });
                iframeContainer.appendChild(fullscreenButton);
            }

            // Append to the specified parent
            if (config.parent instanceof HTMLElement) {
                config.parent.appendChild(iframeContainer);
            } else {
                console.warn("Invalid parent element. Using document.body instead.");
                document.body.appendChild(iframeContainer);
            }

            // Lazy load functionality
            if (config.lazyLoad) {
                this.observeLazyLoad(iframe, config.source, config.debug);
            }

            // Auto-refresh functionality
            if (config.autoRefresh) {
                setInterval(() => {
                    iframe.src = iframe.src;
                }, config.autoRefresh);
            }

            // Resizable functionality
            if (config.resizable) {
                this.makeResizable(iframeContainer, iframe, config.debug);
            }

            // Draggable functionality
            if (config.draggable) {
                this.makeDraggable(iframeContainer, config.debug);
            }

            // Prevent right-click if enabled
            if (config.preventRightClick) {
                this.preventIframeRightClick(iframe);
            }

            // Prevent redirects if enabled
            if (config.preventRedirects) {
                this.preventIframeRedirects(iframe, config.onPreventedRedirect);
            }

            // Bind the onLoad event if provided
            if (typeof config.onLoad === "function") {
                iframe.onload = () => config.onLoad(iframe);
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
            const container = frame.container;

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
                container.style.justifyContent = this.getAlignment(options.alignment);
            }

            // Update opacity
            if (options.opacity !== undefined) {
                iframe.style.opacity = options.opacity;
            }

            // Update configuration in stored frames
            frame.config = { ...frame.config, ...options };

            return true;
        }

        // Add resizable functionality
        makeResizable(container, iframe, debug) {
            container.style.resize = "both";
            container.style.overflow = "hidden";

            if (debug) console.log("Iframe is now resizable.");
        }

        // Add draggable functionality
        makeDraggable(container, debug) {
            container.style.position = "absolute";
            container.style.cursor = "move";

            let offsetX = 0, offsetY = 0;

            container.addEventListener("mousedown", (e) => {
                offsetX = e.clientX - container.offsetLeft;
                offsetY = e.clientY - container.offsetTop;

                const onMouseMove = (e) => {
                    container.style.left = `${e.clientX - offsetX}px`;
                    container.style.top = `${e.clientY - offsetY}px`;
                };

                const onMouseUp = () => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            if (debug) console.log("Iframe is now draggable.");
        }

        // Helper functions (alignment, lazy load, prevent right-click, prevent redirects, UUID generation)...
    }

    // Attach the library to the global scope
    global.embed = new Embed();
})(window);
