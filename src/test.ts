import util from 'util'

import {
	Heap,
	Tokenizer
} from './ludit'

const heap = new Heap

let tokens = Tokenizer.process(heap, "def hello = A * B ");

console.log(util.inspect(tokens, {depth: null, colors:true}))
