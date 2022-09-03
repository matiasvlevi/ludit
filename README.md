# ludit

A simple cli truth table generator for boolean expressions

### Install

```
npm i -g ludit
```

### Usage

Show help menu

```
ludit -h
```

Write boolean equations

```
ludit "A * 'B + 'A * B"
```

You can also run files with `-f`

```
ludit -f ./examples/project/main.ludi
```

[Read the language documentation](https://github.com/matiasvlevi/ludit/blob/parser/DOCUMENTATION.md)

Syntax highlighting file for vim is provided under

```
.vim/ludi.vim
```
