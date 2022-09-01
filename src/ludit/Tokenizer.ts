import { syntax, functionSyntax, keyword, operation, Map } from './types'

import TreeNode from './TreeNode'
import Token from './Token'

export default class Tokenizer {
	constructor() {};

	static KEYWORD:Map<keyword> = {
		'def':{
			type:'function',
			priority: -1
		}
	}

	static FUNCTION:Map<functionSyntax> = {
		'=': {
			type:'assign',
			priority: -1
		}
	}

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
	static ALPHA_L = Tokenizer.ALPHA.toLocaleLowerCase();
	static BOOL = '01';
	static WHITESPACE = ' ';

	static isVariable(char:string) {
		return Tokenizer.ALPHA.includes(char);	
	}
	
	static isReserved(char:string) {
		return (
			Tokenizer.OPERATORS[char] !== undefined ||
			Tokenizer.SYNTAX[char] !== undefined
		);
	}

	static isAssign(char: string) {
		return '=' === char;
	}

	static isBrackets(char:string) {
		return Tokenizer.SYNTAX[char] !== undefined;
	}

	static isKeyword(exp:string[], i:number) {
		let keyword = '';
		let j = i;
		while(
			Tokenizer.isLowerCase(exp[j]) &&
			exp.length > j
		) {
			keyword += exp[j];
			j++;
		}
		return keyword;
	}

	static getDefName(exp:string[], i:number) {
		let keyword = '';
		let j = i;
		while(
			Tokenizer.isLowerCase(exp[j]) &&
			exp.length > j
		) {
			keyword += exp[j];
			j++;
		}	
		return keyword;
	}

	static isBool(char:string) {
		return Tokenizer.BOOL.includes(char);
	}

	static isWhiteSpace(char: string) {
		return Tokenizer.WHITESPACE.includes(char)
	}

	static isLowerCase(char: string) {
		return Tokenizer.ALPHA_L.includes(char);
	}

	static newScope(char: string) {
		return char === '(';
	} 
	
	static endScope(char: string) {
		return char === ')';
	} 

	static isDef(tokens: Token[]) {
		console.log('isDef: ',tokens)
		if (tokens.length === 0) return false;
		return (tokens[tokens.length-1].type === 'function');
	}

	static process(expression: string): Token[] {
		let tokens:any[] = [];	   // Specify this type 

		let exp = expression.split('');

		let scope = 0;
		for (let i = 0; i < exp.length; i++) {
			let char = exp[i];

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
			} else if (Tokenizer.isLowerCase(char)) { // KEYWORD DETECTION 
				let word = Tokenizer.isKeyword(exp, i);
				if (Tokenizer.KEYWORD[word]) {
					let keyword = Tokenizer.KEYWORD[word];
					if (keyword.type === 'function') {
						tokens.push(new Token(
							[...exp].splice(i, 3).join(''), 
							keyword.type,
							-1
						));
						i+=3;
					}

				} else if (word) {
					let functionName = word;
					i+=word.length;
					tokens.push(new Token(
						word,
						Tokenizer.isDef(tokens) ?
							'functionName':
							'functionCall',
						-1
					));
				} 
			} else if (Tokenizer.isAssign(char)) {
				tokens.push(new Token(
					char,
					Tokenizer.FUNCTION[char].type,
					Tokenizer.FUNCTION[char].priority
				))
			} else if (Tokenizer.isBool(char)) {
				tokens.push(new Token(
					char,
					`bool`,
					-1
				))
			}
		}

		return tokens;
	};	
};
