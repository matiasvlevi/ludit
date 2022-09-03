<p align="center">
    <img src="https://i.ibb.co/Fg3d0dr/logo.png" alt="Ludit" height="100"/>
</p>

<h3 align="center">Boolean Algebra in the CLI</h4>
    
<p align="center">
  <a href="https://github.com/matiasvlevi/ludit/blob/parser/README.md">Install</a> •
  <a href="https://github.com/matiasvlevi/ludit/blob/parser/DOCUMENTATION.md">Documentation</a> •
  <a href="https://github.com/matiasvlevi/ludit/blob/parser/LICENCE">License</a>
</p>
    
<br/><br/><br/>
    
Ludit is an interpreter for Ludi, a language meant to express and compute boolean algebra in the CLI.

> Project is under development

### Install

```
npm i -g ludit
```

##### Install the standart lib (Optional)

Run `./install.sh` as root

<br/>

### Usage

Show help menu

```
ludit -h
```

<br/>

Write boolean equations

```
ludit "A * 'B + 'A * B"
```

<br/>

You can also run files with `-f`

```
ludit -f ./examples/project/main.ludi
```

[Read the language documentation](https://github.com/matiasvlevi/ludit/blob/parser/DOCUMENTATION.md)

<br/>

Syntax highlighting file for vim is provided under

```
.vim/ludi.vim
```
