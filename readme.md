# sc-editor

 Stripped down editor for [SuperCollider](https://github.com/supercollider/supercollider) build with [supercolliderjs](https://github.com/crucialfelix/supercolliderjs) and [Electron](https://github.com/supercollider/supercollider).

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
- [ ] show file name in window title
- [ ] implement save file, open file (drag n drop)
- [x] make panels resizable by dragging
- [ ] log errors to file
- [ ] settings

## docs
- [x] render commalist methods
- [x] add syntax highlighting to code blocks
- [x] render methods arguments inline
- [ ] render default method argument values inline
- [x] make links in docs work
  - [x] basic schelp links
  - [x] support external links + open in default browser
  - [x] anchors
- [ ] search function
- [ ] `copymethod::` -> see `Classes/Array`
- [ ] `keyword::`?
- [ ] implement `footnote::`
- [ ] implement `categories::`
- [ ] implement `classtree::`
- [ ] implement `tree::`


# license

MIT
