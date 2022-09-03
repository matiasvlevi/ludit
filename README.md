<p align="center">
    <img src="./assets/logo.png" alt="Ludit" height="125"/>
</p>

<h3 align="center">Boolean Algebra in the CLI</h4>
    
<br/><br/>
    
Ludit is an interpreter for Ludi, a language meant to express and compute boolean algebra expressions in the CLI.

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
