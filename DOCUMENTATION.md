# Ludi Documentation

Ludi is a language meant to express and compute boolean algebra expressions in the CLI.

## Table of contents

* [Operators](#Operators)
* [Expressions](#Expressions)
* [Functions](#Functions)
* * [Defining](#Defining-Functions)
* * [Calling](#Calling-Functions)
* [Attributes](#Attributes)
* [Includes](#Includes)
* [Helpful Syntax](#Helpful-Syntax)
* [Syntax Highlighting](#Use-proper-syntax-highlighting)

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

```py
A * B
```

Expressions containing only constants will print as a single calculation

```py
1 * 1
```


<br/>

## Functions


### Defining Functions

Ludi allows for function definitions

```py
def foo = A * B + C
```

The definition won't print to the console, but the call will.

<br/>

### Calling Functions

There are two way of calling functions. There are **Integral** and **Concrete** function calls 

**Integral** calls will print a truth table to the console

```ruby
foo
```

You can also use different variables in the call, even if the function was defined with `A B C`.

```py
foo(D, E, F)
```


**Concrete** calls contain constants, and will print as a single calculation

```py
foo(1, 0, 1)
```


<br/>

Nothing prevents you from using the functions in other functions

```py
def bar = foo(A, B, C) * !(A + D)

bar(A, B, C, D)
```

and in calls

```py
def baz = A + B

foo(baz(E, F) * A, B, C)
```

<br/>

## Attributes


Attributes are options you can assign to format your CLI output
You can add them with the `~` identifier

Here is an example

```py
A * B + C ~r
```

Here is an example with multiple attributes

```py
A * B + C ~tr7
```

Here are all the possible attributes

| Attributes |           Description                                        |
|----------|--------------------------------------------------------------|
| **`r`**  | Will reverse the labels in a truth table |
| **`k`**  | Will print a karnaugh table        |
| **`t`**  | Will print a truth table (DEFAULT)       |
| **`ANY NUMBER`**  | Any numeric value will cap the truth table to the number you set   |

<br/>


<br/>

## Includes

Ludi allows you to include files


You can include files with a local path

```ruby
include "./bar"
```

A global path

```ruby
include "/home/vlev/myfile"
```

Or use a library

```ruby
include "std"
```

<br/>

## Helpful Syntax

You can write comments by prefixing `#`

```py
# Ludi is dope as hell yow
```

You can print text by prefixing it with `-`
This is useful to add titles to tables or calculations

```go
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

More detailed documentation about the source code of Ludit/Ludi can be found [here](https://raw.githack.com/matiasvlevi/ludit/dev/docs/index.html)

---

MIT Licence 2022     
@matiasvlevi
