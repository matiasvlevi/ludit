# Ludi Documentation

Ludi is a language meant to express and compute boolean algebra expressions in the CLI.

## Table of contents

* [Operators]()
* [Expressions]()
* [Functions]()
* * [Defining]()
* * [Calling]()
* [Includes]()
* [Helpful Syntax]()
* [Syntax Highlighting]()

<br/>

## Operators


| Operator |           Description                                        |
|----------|--------------------------------------------------------------|
| **`*`**  | Multiplication, which translates to `and` in boolean algebra |
| **`+`**  | Addition, which translates to `or` in boolean algebra        |
| **`!`**  | Negation, which translates to `not` in boolean algebra       |
| **`'`**  | alias for `!`                                                |

<br/>

## Simple Expressions


Expressions will print to the console as a boolean truth table.

```ludi
A * B
```

Expressions containing only constants will print as a single calculation

```ludi
1 * 1
```


<br/>

## Functions


### Defining Functions

Ludi allows for function definitions

```ludi
def foo = A * B + C
```

The definition won't print to the console, but the call will.

<br/>

### Calling Functions

There are two way of calling functions. There are **Integral** and **Specific** function calls 

**Integral** calls will print a truth table to the console

```ludi
foo
```

You can also use different variables in the call, even if it was defined with `A B C`.

```ludi
foo(D, E, F)
```


**Specific** calls contain constants, and will print as a single calculation

```ludi
foo(1, 0, 1)
```


<br/>

Nothing prevents you from using the functions in other functions

```ludi
def bar = foo(A, B, C) * !(A + D)

bar(A, B, C, D)
```

<br/>

## Includes

Ludi allows you to include files


You can include files with a local path

```ludi
include "./bar"
```

A global path

```
include "/home/vlev/myfile"
```

Or use a library

```
include "std"
```

<br/>

## Helpful Syntax

You can write comments by prefixing `#`

```ludi
# Ludi is dope as hell yow
```

You can print text by prefixing it with `-`
This is useful to add titles to tables or calculations

```ludi
- Hello world
```

<br/>

## Use proper syntax highlighting

Vim syntax highlighting for ludi is provided here

```
.vim/ludi.vim
```

<br/>
<br/>

---

MIT Licence 2022     
@matiasvlevi