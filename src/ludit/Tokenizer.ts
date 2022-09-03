import { syntax, functionSyntax, keyword, operation, Map } from './types'

import { ErrorHandler, error } from './ErrorHandler'

import Heap from './Heap'
import Profiler from './Profiler'
import TreeNode from './TreeNode'
import Token from './Token'

type TokenizerReturn = {
	tokens: (Token|TreeNode)[];
	profile: string;
	isDef: boolean;
}

export default class Tokenizer {
	constructor() {};

	static KEYWORD:Map<keyword> = {
		'def':{
			type:'function',
			priority: -1
		}
	}

	static CONSTANT:Map<keyword> = {
		'0': {
			type: 'constant',
			priority: -1
		},
		'1': {
			type: 'constant',
			priority: -1
		}
	}

	static FUNCTION:Map<functionSyntax> = {
		'=': {
			type:'operator',
			priority: 0.5
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

	static isConstant(char:string) {
		return Tokenizer.CONSTANT[char] !== undefined;
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

	static isDef(tokens: (Token|TreeNode)[]) {
		if (tokens.length === 0) return false;
		return (tokens[tokens.length-1].type === 'function');
	}

	static isSpecificCall(exp: string[], i:number, word:string) {
		if (exp[i+word.length] === undefined) return false;
		return exp[i+word.length] === '(';
	}

	static process(
		heap: Heap,
		expression: string,
		e: error	
	): TokenizerReturn {

		let tokens:(Token | TreeNode)[] = [];	    
		let profile: string[] = [];
		let lineDef: string | undefined;	

		let exp = expression.split('');
		
		let scope = 0;
		
		let inArgs = false;
		let argCount = 0;
		for (let i = 0; i < exp.length; i++) {
			let char = exp[i];
			if (Tokenizer.isReserved(char)) {

				if (Tokenizer.newScope(char)) {
					// Opening argument specification
					if (tokens[tokens.length-1].type === 'functionCall') {
						tokens.push(new Token(
							char,
							'argOpen',
							-1, i
						));
						inArgs = true;
						continue;
					} else {
						// New scope
						scope++;
					}
				}

				if (!Tokenizer.isBrackets(char)) {

					// Add variable if is 'not' operator detected
					if (char === '!' || char === '\'') {
						tokens.push(new Token(
							'.', 'variable', -1, i
						));
					}

					tokens.push(new Token(
						char,
						Tokenizer.OPERATORS[char].type,
						Tokenizer.OPERATORS[char].priority + 12 * scope,
						i
					));
				}

				if (Tokenizer.endScope(char)) {
					if (inArgs) {
						tokens.push(new Token(
							char,
							'argClose',
							-1, i
						));
						inArgs = false;
						argCount = 0;
						continue;	
					} else {
						// Close scope
						scope--;
					}
				}

			} else if (Tokenizer.isVariable(char)) {
				if (!profile.includes(char)) profile.push(char)

				if (inArgs) {
					tokens.push(new Token(
						char,
						'argument',
						-1, i
					))
					continue;
				}

				tokens.push(new Token(
					char,
					'variable',
					-1, i
				))
			} else if (Tokenizer.isLowerCase(char)) { // KEYWORD DETECTION 
				let word = Tokenizer.isKeyword(exp, i);
				if (Tokenizer.KEYWORD[word]) {
					let keyword = Tokenizer.KEYWORD[word];
					if (keyword.type === 'function') {
						tokens.push(new Token(
							[...exp].splice(i, 3).join(''), 
							keyword.type,
							-1, i
						));
						i+=3;
					}

				} else if (word) {	
					if (Tokenizer.isDef(tokens)) lineDef = word;
					else if (exp[i+word.length] !== '(') {
						e.char = i;
						profile = Profiler.removeDoubles(
							profile.concat(
								(heap.getProfile(word, e) || '').split('')
							).join('')
						).split('');
					}
					tokens.push(new Token(
						word,
						Tokenizer.isDef(tokens) ?
							'functionName':
							'functionCall',
						Tokenizer.isDef(tokens) ?
							-1:(Tokenizer.isSpecificCall(exp, i, word) ? 10 : -1),
						 i
					));
					
					i+=word.length-1;
				} 
			} else if (Tokenizer.isAssign(char)) {
				tokens.push(new Token(
					char,
					Tokenizer.FUNCTION[char].type,
					Tokenizer.FUNCTION[char].priority,
					i
				))
			} else if (Tokenizer.isConstant(char)) {
				tokens.push(new Token(
					char,
					`constant`,
					-1, i
				))
			}
		}
		if (lineDef) {
			heap.setProfile(lineDef, Profiler.clean(profile));
		}

		return { 
			tokens,
			isDef: (lineDef !== undefined),
			profile: Profiler.clean(profile)
		};
	};	
};
