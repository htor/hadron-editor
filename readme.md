# sc-editor

 Stripped down editor for [SuperCollider](https://github.com/supercollider/supercollider) built with [supercolliderjs](https://github.com/crucialfelix/supercolliderjs) and [Electron](https://electronjs.org/docs).

# start

First clone this repositiory and navigate into the resulting directory.
To run this you need to install [NodeJS](https://nodejs.org/en/) on your computer.
Then with [NPM](https://www.npmjs.com/) do:

```
npm install
npm start
```

The application should start and you can type in SuperCollider code and evaluate it.


# usage

There are keyboard shortcuts for common things:

### cmd+b
Boot server

### cmd+enter
Evaluate code

### cmd+m
Show server meter

### cmd+s
Show server scope

### cmd+d
Lookup help for word under cursor

### cmd+o
Show/hide help browser

### cmd+p
Show/hide post window

### cmd+q
Quit application


# todo

## interface
- [x] output _all_ output from sclang (boot, errors, exit)
- [x] output object/array return values from sclang
- [x] hide docs, hide output keyboard shortcuts
- [ ] make panels resizable by dragging
- [ ] auto-complete classes + methods
- [ ] limit post window history for better perf
- [ ] log errors to file
- [ ] settings
- [ ] new file, open file (drag n drop), saving, window title

# license

MIT
