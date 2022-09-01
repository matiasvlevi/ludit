import util from 'util'

import {
	Tokenizer
} from './ludit'

let tokens = Tokenizer.process("def hello = A * B ");

console.log(util.inspect(tokens, {depth: null, colors:true}))
tokens = Tokenizer.process("hello 1 0")
console.log(util.inspect(tokens, {depth: null, colors:true}))
