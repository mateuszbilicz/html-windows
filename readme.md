# Simple windows element
## Setup
You can place `<script src="windows.js"></script>` in head or end of body. Style is included to windows.js, you don't need to include this file but you can replace style in js.
`style.css` is for you to simplify your work if you want to edit windows style.

Theres 2 window properties used by this library:
`window.focusedWindow` and `window.windowsStorage`

## Using windows component
```html
<app-window title="Test window" controls="MFSX" position="30,20" size="500,300" logs="true" appUrl="app.html" class="show" fullscreen></app-window>
```
### Attributes
***title*** - set window title<br>
***controls*** - set windows controls<br>

<ul>
<li>M - minimize button</li>
<li>FS - fullscreen and small-size</li>
<li>X - close button</li>
</ul>

You can change buttons combination, remove or even multiply buttons.

***position*** - set window position in pixels X,Y<br>
***size*** - set window size in pixels X,Y<br>
***logs*** - enable window actions logging<br>
***appUrl*** - load other html file to shadow root inside window<br>
***class="show"*** - add `show` class to make window visible, remove this class to hide window<br>
***fullscreen*** -make window fullscreen<br>
## Control window element with javascript
```html
<app-window id="example-window" title="Example" controls="MFSX"></app-window>
```
```javascript
windowElement = document.getElementById("example-window");

/* functions */

// change title
windowElement.setTitle("New title");
// resize window
windowElement.resize(400, 500);
// change window position
windowElement.reposition(5, 5);
// show/hide window
windowElement.switchShow(true);
// change fullscreen mode
windowElement.switchFullscreen(true);
// bring window forward
// windowElement.focus();
// creating remove callback function
function onRemove() {
    console.log("Our window was removed!");
}
// adding window remove callback
windowElement.addCloseCallback(onRemove);
// removing window remove callback
windowElement.removeCloseCallback(onRemove);
// log in console as window
windowElement.log("Hello world!");

/* properties */

windowElement.position // {x: number, y: number}
windowElement.size // {x: size, y: size}
windowElement.isFullScreen // boolean
windowElement.logs // boolean
windowElement.closeCallbacks // function[]

// if you change any property manually you can use
// windowElement.updateView();
```

### How to change style?

Edit style.css file, search in windows.js for `// windows style` and replace style inside string.
You have also small config in beginning of script function.
```javascript
config = {
    background: '#2c2c2c', // changes window background color
    color: '#fff', // changes window text color (can't change theme in apps)
    focusedZIndex: 999, // z-index of forwarded window
    backgroundZIndex: 998 // z-index of windows in background
}
```

### How to find hidden windows?
```javascript
document.querySelectorAll("app-window:not(.show)")
```
Returns HTMLElement[] with hidden windows.



