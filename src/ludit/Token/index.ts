import Tokenizer from '../Tokenizer'
import { Map } from '../types'

export default class Token {
	literal: string;
	type: string;
	priority: number;
	char: number;

	constructor(
		literal: string,
		type:string,
		priority: number,
		char: number
	) {
		this.type = type;			
		this.literal = literal;
		this.priority = priority;
		this.char = char;
	}

	copy() {
		return new Token(
			this.literal,
			this.type,
			this.priority,
			this.char
		);
	}

	setScope(args: Map<string>, profile:string) {	
		this.literal = args[this.literal];
		
		if (Tokenizer.isConstant(this.literal)) {
			this.type = 'constant'
		}
	}
};
