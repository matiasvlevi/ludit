# ludit

A simple cli truth table generator

### 

This branch is the same as `origin/eval` except it has my own implementation of a parser, tokenizer and processor.
The other one uses JS eval, and creates a function from what you inputed, which is pretty hackish.

this branch is going to have the same options as the `origin/eval` branch

### Build this branch

```
git clone https://github.com/matiasvlevi/ludit.git
npm ci
npm run build
```

run

```
npm start "A * B"
```
