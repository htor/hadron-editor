
# hadron-editor

Editor for [SuperCollider](https://github.com/supercollider/supercollider) with built-in help browser and post window. Runs on Mac and Windows.


<img src="images/screenshot.png" alt="screenshot of editor" title="An experimental editor for SuperCollider" style="width: 1300px; max-width: 100%">

# installation

### mac

* Install [SuperCollider](https://supercollider.github.io/download) using the DMG file and place it under /Applications/SuperCollider/SuperCollider.app.
* Download [Hadron-1.0.0.dmg](https://github.com/htor/hadron-editor/releases/download/v1.0.0/Hadron-1.0.0.dmg), open it and drag Hadron.app to /Applications.

### windows

* Install [SuperCollider](https://supercollider.github.io/download) using the EXE installer and use the suggested location.
* Download [Hadron-1.0.0.exe](https://github.com/htor/hadron-editor/releases/download/v1.0.0/Hadron-1.0.0.exe), run it and let the installer finish. It will show a greenish animation while installing.

# usage

Start the application, type in SuperCollider code and evaluate it with `cmd/ctrl+enter`. Following are the keyboard shortcuts. Depending on your platform you use either the Command or Control key as a modifier:

### cmd/ctrl+b
Boot server

### cmd/ctrl+enter
Evaluate code region

### shift+enter
Evaluate code line

### cmd/ctrl+.
Hush. Free all synths. Stop all audio output

### cmd/ctrl+shift+l
Recompile class library

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

### cmd/ctrl++
Increase font size

### cmd/ctrl+-
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

### cmd/ctrl+q, cmd/ctrl+w, alt+f4
Quit application

# developing

First you need to install [SuperCollider](https://github.com/supercollider/supercollider) and [NodeJS](https://nodejs.org/en/) on your computer. Then, with [NPM](https://www.npmjs.com/) do:

```
npm install
npm start
```

The application should start automatically.

# libraries

The editor is built with [supercolliderjs](https://github.com/crucialfelix/supercolliderjs) and [Electron](https://electronjs.org/docs). For code editing, the [codemirror](https://codemirror.net/) library is used.

# license

MIT
