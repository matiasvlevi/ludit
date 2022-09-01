import { syntax, operation, Map } from './types'

import TreeNode from './TreeNode'
import Token from './Token'

export default class Tokenizer {
	constructor() {};

	static SYNTAX:Map<syntax> = {
		'(': {
			type: 'open',
			priority: 0,
		},
		')': {
			type: 'close',
			priority: 0,
		}
	}

	static OPERATORS:Map<operation> = {
		'+': {
			type: 'operator',
			priority: 1,
			op: (a: boolean, b: boolean) => (a || b)
		},
		'*': {
			type: 'operator',
			priority: 2,
			op: (a: boolean, b: boolean) => (a && b)
		},
		'!': {
			type: 'operator',
			priority: 3,
			op: (a: boolean, b: boolean) => (!b)
		},
		'\'': {
			type: 'operator',
			priority: 3,
			op: (a: boolean, b: boolean) => (!b)
		}
	}

	static getAlpha() {
		let alpha = '';
		for (let i = 65; i < 91; i++)
			alpha += String.fromCharCode(i);

		return alpha;
	}

	static ALPHA = Tokenizer.getAlpha();
	
	static isVariable(char:string) {
		return Tokenizer.ALPHA.includes(char);	
	}
	
	static isReserved(char:string) {
		return (
			Tokenizer.OPERATORS[char] !== undefined ||
			Tokenizer.SYNTAX[char] !== undefined
		);
	}

	static isBrackets(char:string) {
		return Tokenizer.SYNTAX[char] !== undefined;
	}

	static newScope(char: string) {
		return char === '(';
	} 
	
	static endScope(char: string) {
		return char === ')';
	} 

	static process(expression: string): Token[] {
		let tokens:any[] = [];	   // Specify this type 

		let exp = expression.split('');

		let scope = 0;
		exp.forEach((char:string) => {
			if (Tokenizer.isReserved(char)) {

				if (Tokenizer.newScope(char)) 
					scope++;
	
				if (!Tokenizer.isBrackets(char)) {
					if (char === '!' || char === '\'') {
						tokens.push(new Token(
							'.', 'variable', -1
						));
					}

					tokens.push(new Token(
						char,
						Tokenizer.OPERATORS[char].type,
						Tokenizer.OPERATORS[char].priority + 12 * scope
					));
				}

				if (Tokenizer.endScope(char)) 
					scope--;

			} else if (Tokenizer.isVariable(char)) {
				tokens.push(new Token(
					char,
					'variable',
					-1
				))
			}
		});

		return tokens;
	};	
};
