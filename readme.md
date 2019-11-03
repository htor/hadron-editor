# sc-editor

Experimental editor for [SuperCollider](https://github.com/supercollider/supercollider) with built-in help browser and post window.

<img src="images/screenshot.png" alt="screenshot of editor" title="An experimental editor for SuperCollider" style="width: 1300px; max-width: 100%">

# start

First you need to install [SuperCollider](https://github.com/supercollider/supercollider) and [NodeJS](https://nodejs.org/en/) on your computer. Then, with [NPM](https://www.npmjs.com/) do:

```
npm install
npm start
```

The application should start and you can type in SuperCollider code and evaluate it with `Cmd+Enter`.


# usage

Keyboard shortcuts for common actions:

### cmd/ctrl+b
Boot server

### cmd/ctrl+enter
Evaluate code region

### alt+enter
Evaluate code line

### cmd/ctrl+.
Hush. Free all synths. Stop all audio output

### cmd/ctrl+m
Show server meter

### cmd/ctrl+shift+m
Show server scope

### cmd/ctrl+l
Select current line(s)

### cmd/ctrl+shift+d
Duplicate current line

### cmd/ctrl+shift+k
Comment/uncomment text selection

### cmd/ctrl+d
Lookup help for word under cursor

### cmd/ctrl+i
Show/hide help browser

### cmd/ctrl+p
Show/hide post window

### cmd/ctrl+plus
Increase font size

### cmd/ctrl+minus
Decrease font size

### cmd/ctrl+0
Reset font size

### cmd/ctrl+shift+p
Clear post window

### cmd/ctrl+o
Open file

### cmd/ctrl+s
Save file

### cmd/ctrl+shift+s
Save file as

### cmd/ctrl+q
Quit application

# libraries

The editor is built with [supercolliderjs](https://github.com/crucialfelix/supercolliderjs) and [Electron](https://electronjs.org/docs). For code editing, the incredible [codemirror](https://codemirror.net/) library is used.


# license

MIT
