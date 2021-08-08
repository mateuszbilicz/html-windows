// INFO: better if you put this script in end of your document
// INFO: this adds <style name="window-element-style"></style> don't delete it or your windows lose their pretty look
// WARN: global window.focusedWindow and window.windowsStorage are used by this script, please, do not change this variables manually

(function() {
    // you can change theme
    theme = {
        background: '#2c2c2c',
        color: '#fff'
    }

    // don't change next parts...

    // setting up window variables
    window.focusedWindow = null;
    window.windowsStorage = {
        inBorder: false
    };

    // useful in mouse interactions
    function inRange(ev, x1, y1, x2, y2) {
        return ev.clientX >= x1 && ev.clientY >= y1 && ev.clientX <= x2 && ev.clientY <=y2;
    }
    function inRangeXY(x, y, x1, y1, x2, y2) {
        return x >= x1 && y >= y1 && x <= x2 && y <=y2;
    }

    // Window focus
    window.addEventListener('click', function(ev) {
        let focusWindow = ev.target.closest('app-window');
        if (focusWindow) {
            window.focusedWindow = focusWindow;
        }
    });

    // change cursor for border, resize, reposition
    window.addEventListener('mousemove', function(ev) {
        if (focusedWindow) {
            // ignore full screen windows
            if (focusedWindow.isFullScreen) return;
            if (window.windowsStorage.dragMode) {
                if (window.windowsStorage.dragMode === 'resize') {
                    // resize
                    let x = ev.clientX - focusedWindow.position.x,
                        y = ev.clientY - focusedWindow.position.y;
                    if (x < 220) x = 220;
                    if (y < 100) y = 100;
                    focusedWindow.resize(x, y);
                }else if (window.windowsStorage.dragMode === 'reposition') {
                    // reposition
                    let mx = ev.clientX,
                        my = ev.clientY,
                        x = ev.clientX - window.windowsStorage.dragX,
                        y = ev.clientY - window.windowsStorage.dragY;
                    if (x < -50) x = -50;
                    if (y < -5) y = -5;
                    if (x > window.innerWidth - 10) x = window.innerWidth - 10;
                    if (y > window.innerHeight - 10) y = window.innerHeight - 10;
                    if (mx < -50) mx = -50;
                    if (my < -5) my = -5;
                    if (mx > window.innerWidth - 10) mx = window.innerWidth - 10;
                    if (my > window.innerHeight - 10) my = window.innerHeight - 10;
                    if (inRangeXY(mx, my, 0, -5, window.innerWidth, 1)) { // full screen
                        // fake pos (do not save in window properties)
                        focusedWindow.repositionNostore(0, 0);
                        // fake size (do not save in window properties)
                        focusedWindow.resizeNostore(window.innerWidth, window.innerHeight);
                        window.windowsStorage.setFull = true;
                    } else if (mx === window.innerWidth - 10 && (my >= 0 && my <= window.innerHeight)) { // align right
                        focusedWindow.repositionNostore(window.innerWidth / 2, 0);
                        focusedWindow.resizeNostore(window.innerWidth / 2, window.innerHeight);
                        window.windowsStorage.setFull = false;
                    } else if ((mx >= -50 && mx <= 1) && (my >= 0 && my <= window.innerHeight)) { // align left
                        focusedWindow.repositionNostore(0, 0);
                        focusedWindow.resizeNostore(window.innerWidth / 2, window.innerHeight);
                        window.windowsStorage.setFull = false;
                    } else if ((mx >= 0 && mx <= window.innerWidth) && my === window.innerHeight - 10) { // align bottom
                        focusedWindow.repositionNostore(0, window.innerHeight / 2);
                        focusedWindow.resizeNostore(window.innerWidth, window.innerHeight / 2);
                        window.windowsStorage.setFull = false;
                    } else { // standard only changing position
                        focusedWindow.reposition(x, y);
                        focusedWindow.resize();
                        window.windowsStorage.setFull = false;
                    }
                }
                ev.preventDefault();
                ev.stopPropagation();
            } else {
                // change cursor for borders
                let corners = {
                    leftUp: {
                        x: focusedWindow.position.x - 8,
                        y: ev.clientY > focusedWindow.position.y - 8
                    },
                    rightBottom: {
                        x: focusedWindow.position.x + focusedWindow.size.x + 10,
                        y: focusedWindow.position.y + focusedWindow.size.y + 10
                    }
                }
                /* box
                * |--X--|
                * X ### 2
                * |--3--|
                * */
                let inBorderSides = inRange(ev, corners.rightBottom.x - 12, corners.leftUp.y, corners.rightBottom.x, corners.rightBottom.y),
                    inBorderBottom = inRange(ev, corners.leftUp.x, corners.rightBottom.y - 14, corners.rightBottom.x, corners.rightBottom.y + 2),
                    isInBorder = inBorderSides || inBorderBottom;
                if (isInBorder) {
                    window.windowsStorage.borderMode = inBorderSides ? 'sides' : 'bottom';
                }
                if (window.windowsStorage.inBorder !== isInBorder) {
                    if (window.windowsStorage.inBorder === false && isInBorder === true) {
                        window.windowsStorage.originalCursor = document.body.style.cursor + '';
                        document.body.style.cursor = inBorderSides ? 'w-resize' : 'n-resize';

                    }
                    if (window.windowsStorage.inBorder === true && isInBorder === false) {
                        document.body.style.cursor = window.windowsStorage.originalCursor + '' || 'default';
                    }
                    window.windowsStorage.inBorder = isInBorder;
                }
            }
        }
    });
    window.addEventListener('mousedown', function(ev) {
        if (window.windowsStorage.inBorder) {
            // if in border, start resizing
            window.windowsStorage.dragMode = 'resize';
            ev.preventDefault();
            ev.stopPropagation();
        } else if (focusedWindow) {
            // check if is in controls container range, set needed variables and start reposition
            let controlsMasterOfDeath = ev.target.closest('.controls-container'),
                appWindow = ev.target.closest('app-window');
            if (ev.target.tagName !== 'SVG' && controlsMasterOfDeath) {
                window.windowsStorage.dragMode = 'reposition';
                window.windowsStorage.dragX = ev.clientX - appWindow.offsetLeft;
                window.windowsStorage.dragY = ev.clientY - appWindow.offsetTop;
                if (window.windowsStorage.dragX > appWindow.size.x) window.windowsStorage.dragX = appWindow.size.x - 160;
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
    });
    // stop resizing and reposition
    window.addEventListener('mouseup', function(ev) {
        if (window.windowsStorage.dragMode) {
            if (window.windowsStorage.setFull) {
                focusedWindow.switchFullScreen(true);
            }
            delete window.windowsStorage.dragMode;
        }
    });

    // function to generate html element from string
    function createElem(str) {
        let div = document.createElement('div');
        div.innerHTML = str.trim();
        return div.firstChild;
    }
    // icons
    function icon(name, color = theme.color, size = 24) {
        // https://fonts.google.com/icons
        let svgCode = `<svg xmlns="http://www.w3.org/2000/svg" height="${size}px" viewBox="0 0 ${size} ${size}" width="${size}px" fill="${color}">`;
        switch(name) {
            case 'minimize': svgCode += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19h12v2H6v-2z"/>'; break;
            case 'maximize': svgCode += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>'; break;
            case 'normalsize': svgCode += '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>'; break;
            case 'close': svgCode += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>'; break;
            case 'apps': svgCode += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>'; break;
            case 'menu': svgCode += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>'; break;
            default: svgCode += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6m0-2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>';
        }
        return createElem(svgCode + '</svg>');
    }

    // our window template
    let template = `<div class="controls-container"><span class="title"><!--window-title--></span><span class="controls"><!--controls--></span></div><div class="content-container"><!--content--></div>`;
    // app-window HTML element class
    class WindowElement extends HTMLElement {
        position = {x: 0, y: 0};
        size = {x: 500, y: 300};
        isFullScreen = false;
        lockNostorePos = false;
        lockNostoreSize = false;
        title = 'Loading...';
        logs = false;
        // we can add logs to our window
        log(data){
            if (this.logs) {
                console.log(this, data);
            }
        }
        // update window
        updateView() {
            // set window theme
            this.style.color = theme.color;
            this.style.backgroundColor = theme.background;
            // get position from attributes if is set
            if (this.hasAttribute('position')) {
                let pos = this.getAttribute('position').split(',');
                this.position = {x: pos[0] * 1, y: pos[1] * 1};
            }
            // get size from attributes if is set
            if (this.hasAttribute('size')) {
                let siz = this.getAttribute('size').split(',');
                this.size = {x: siz[0] * 1, y: siz[1] * 1};
            }
            // get title from attributes if is set
            if (this.hasAttribute('title')) {
                this.title = this.getAttribute('title');
            }
            // get logs option from attributes if is set
            if (this.hasAttribute('logs')) {
                this.logs = this.getAttribute('logs') == 'true';
            }
            // get fullscreen from attributes and set window mode
            this.isFullScreen = this.hasAttribute('fullscreen');
            // resizing/reposing on window update
            if (this.isFullScreen) {
                this.style.left = '0px';
                this.style.top = '0px';
                this.style.width = '100%';
                this.style.height = '100%';
            } else {
                if (!this.lockNostorePos) {
                    this.style.left = this.position.x + 'px';
                    this.style.top = this.position.y + 'px';
                }
                if (!this.lockNostoreSize) {
                    this.style.width = this.size.x + 'px';
                    this.style.height = this.size.y + 'px';
                }
            }
            // setting title (visible for users)
            this.querySelector('.controls-container span.title').innerText = this.title;
        }
        // load app as object to window, remember about CORS
        loadShadowApp(url) {
            // create shadow root, style for app object and app object
            let shadowRoot = this.querySelector('div.content-container').attachShadow({mode: 'open'}),
                appObject = document.createElement('OBJECT'),
                appStyle = document.createElement('STYLE');
            appStyle.innerHTML = `:host{padding:0;margin:0;background:transparent} object{position:relative;top:0;left:0;width:100%;height:100%}`;
            appObject.setAttribute('data', url);
            // add this to window
            shadowRoot.appendChild(appStyle);
            shadowRoot.appendChild(appObject);
            this.log(`Loaded shadow app ${url}`);
        }
        // setting window title
        setTitle(str) {
            this.title = str;
            // setting title (visible for users)
            this.querySelector('.controls-container span.title').innerText = this.title;
        }
        // resizing without remembering changes
        resizeNostore(x, y) {
            this.lockNostoreSize = true;
            if (x !== null) this.style.width = x + 'px';
            if (y !== null) this.style.height = y + 'px';
        }
        // reposing without remembering changes
        repositionNostore(x, y) {
            this.lockNostorePos = true;
            if (x !== null) this.style.left = x + 'px';
            if (y !== null) this.style.top = y + 'px';
        }
        // resizing with saving changes
        resize(x, y) {
            this.lockNostoreSize = false;
            if (x !== null && !isNaN(x)) this.size.x = x;
            if (y !== null && !isNaN(y)) this.size.y = y;
            this.style.width = this.size.x + 'px';
            this.style.height = this.size.y + 'px';
            this.setAttribute('size', this.size.x + ',' + this.size.y);
        }
        // reposing with saving changes
        reposition(x, y) {
            this.lockNostorePos = false;
            if (x !== null && !isNaN(x)) this.position.x = x;
            if (y !== null && !isNaN(y)) this.position.y = y;
            this.style.left = this.position.x + 'px';
            this.style.top = this.position.y + 'px';
            this.setAttribute('position', this.position.x + ',' + this.position.y);
        }
        // close window
        closeWindow() {
            this.log('Closing window');
            if (window.focusedWindow === this) window.focusedWindow = null;
            this.parentElement.removeChild(this);
        }
        // switch window full screen true/false/null=toggle
        switchFullScreen(val) {
            if (val === true) {
                this.setAttribute('fullscreen', '');
            } else if (val === false) {
                this.removeAttribute('fullscreen');
            } else {
                this.toggleAttribute('fullscreen');
            }
            this.updateView();
        }
        // switch window display true/false/null=toggle
        switchShow(val) {
            if (val === true) {
                if (!this.classList.contains('show')) this.classList.add('show');
                window.focusedWindow = this;
            } else if (val === false) {
                if (this.classList.contains('show')) this.classList.remove('show');
                if (window.focusedWindow === this) window.focusedWindow = null;
            } else {
                this.classList.toggle('show');
                if (!this.classList.contains('show')) {
                    if (window.focusedWindow === this) window.focusedWindow = null;
                }
            }
            this.updateView();
        }
        constructor() {
            super();
        }
        connectedCallback() {
            // wait for content parse and load
            setTimeout(() => {
                // save everything what's inside before we change html to template
                let before = this.innerHTML + '';
                // change html to template and place our old content here
                this.innerHTML = template.replace('<!--content-->', before);
                // get controls div from controls container
                let controlsDiv = this.querySelector('.controls-container span.controls');
                // iterate all window controls or add only X
                for (let control of (this.getAttribute('controls') || 'X').split('')) {
                    let ic;
                    if (control === 'M') { // adds minimize icon
                        ic = icon('minimize');
                        ic.addEventListener('click', () => {
                            this.switchShow(false);
                        });
                    }
                    if (control === 'F') { // adds maximize icon
                        ic = icon('maximize');
                        ic.classList.add('nofullscreen');
                        ic.addEventListener('click', () => {
                            this.switchFullScreen(true);
                        });
                    }
                    if (control === 'S') { // adds normalsize icon
                        ic = icon('normalsize');
                        ic.classList.add('fullscreen');
                        ic.addEventListener('click', () => {
                            this.switchFullScreen(false);
                        });
                    }
                    if (control === 'X') { // adds close icon
                        ic = icon('close');
                        ic.addEventListener('click', () => {
                            this.closeWindow();
                        })
                    }
                    if (ic) {
                        controlsDiv.appendChild(ic);
                    }
                }
                // update window view
                this.updateView();
                // if is set, load app inside window
                if (this.hasAttribute('appUrl')) {
                    this.loadShadowApp(this.getAttribute('appUrl'));
                    // and delete app url
                    this.removeAttribute('appUrl');
                }
                this.log('Window loaded');
            });
        }
    }
    // add app-window to HTML elements
    window.customElements.define('app-window', WindowElement);

    // listen for app-window property changes
    function startObserver(target) {
        let observer = new MutationObserver(function(mutations) {
            for (let mutation of mutations) {
                if (mutation.target && mutation.target.tagName === 'APP-WINDOW') {
                    mutation.target.updateView();
                }
            }
        });
        observer.observe(target, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['title', 'position', 'size', 'logs', 'fullscreen']
        });
    }
    // windows style
    let style = `
`;
    // append windows style to body when body was loaded
    let styleElement = document.createElement('style');
    styleElement.setAttribute('name', 'window-element-style');
    styleElement.innerHTML = style;
    if (window.body) {
        // this activates when you place script on body end
        window.body.appendChild(styleElement);
        startObserver(window.body)
    } else {
        // this activates when you place script in head
        window.addEventListener('DOMContentLoaded', ev => {
            ev.target.body.appendChild(styleElement);
            startObserver(ev.target.body);
        });
    }
})();