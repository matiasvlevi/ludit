import { syntax, functionSyntax, keyword, operation, Map } from './types'

import { ErrorHandler, error } from './ErrorHandler'

import Heap from './Heap'
import Parser from './Parser'
import Profiler from './Profiler'
import TreeNode from './TreeNode'
import Token from './Token'

type TokenizerReturn = {
	tokens: (Token|TreeNode)[];
	profile: string;
	isDef: boolean;
}

type handleCallReturn = {
	defaultParams: boolean,
	newLocation: number,
	argProfile: string[]
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

	// REMOVE THIS, METHOD IS TEMPORARY
	private static replaceAll(content: string, char:string, rep:string) {
		while(content.includes(char)) {
			content = content.replace(char, rep);
		}
		return content;
	}

	private static removeWhiteSpace(content: string) {
		return Tokenizer.replaceAll(content, ' ', '');
	}

	private static getASCII(min: number, max: number) {
		let alpha = '';
		for (let i = min; i < max; i++)
			alpha += String.fromCharCode(i);

		return alpha;
	}

	static ALPHA = Tokenizer.getASCII(65, 91);
	static ALPHA_L = Tokenizer.ALPHA.toLocaleLowerCase();
	static NUMERAL = Tokenizer.getASCII(48, 57);
	static BOOL = '01';
	static WHITESPACE = ' ';

	private static isVariable(char:string) {
		return Tokenizer.ALPHA.includes(char);	
	}
	
	private static isOperator(char:string) {
		return Tokenizer.OPERATORS[char] !== undefined
	}

	private static isReserved(char:string) {
		return (
			Tokenizer.isOperator(char) ||
			Tokenizer.SYNTAX[char] !== undefined
		);
	}	

	private static isNumeral(char: string) {
		return Tokenizer.NUMERAL.includes(char);
	}

	static isAssign(char: string) {
		return '=' === char;
	}

	private static isBrackets(char:string) {
		return Tokenizer.SYNTAX[char] !== undefined;
	}

	private static getKeyword(exp:string[], i:number) {
		let keyword = '';
		let j = i;
		while(
			(Tokenizer.isLowerCase(exp[j]) ||
			Tokenizer.isNumeral(exp[j])) &&
			exp.length > j 
		) {
			if (
				Tokenizer.isReserved(exp[j])
			) break;
			keyword += exp[j];
			j++;
		}
		return keyword;
	}

	static isConstant(char:string) {
		return Tokenizer.CONSTANT[char] !== undefined;
	}

	private static isWhiteSpace(char: string) {
		return Tokenizer.WHITESPACE.includes(char)
	}

	private static isLowerCase(char: string) {
		return Tokenizer.ALPHA_L.includes(char);
	}

	private static newScope(char: string) {
		return char === '(';
	} 
	
	private static endScope(char: string) {
		return char === ')';
	} 

	private static isDef(tokens: (Token|TreeNode)[]) {
		if (tokens.length === 0) return false;
		return (tokens[tokens.length-1].type === 'function');
	}

	private static isSpecificCall(exp: string[], i:number, word:string) {
		if (exp[i+word.length] === undefined) return false;
		if (exp[i+word.length] === ' ') return false;

		let j = i+word.length;
		while (
			exp[j] === '(' ||
			exp[j] === ' '
	    ) {
			j++
			// if closing found, function is specific
			if (
				exp[j] !== ')'
			) return true;
		}
		// If not, function is not a specific call
		return false;
	}

	private static skipFieldCall(
		exp: string[],
		j: number
	):number {
		// Skip function call if exists
		let keyword = Tokenizer.getKeyword(exp, j);

		if (keyword.length > 0 && exp[j+keyword.length] === '(') {
			let k = j+keyword.length;

			while(exp[k] !== ')' ) {
				k++
				if (k >= exp.length) break;
				let m = Tokenizer.skipFieldCall(exp, k);
				if (m !== j) k = m;
			};
			k++;

			return k;
		}
		return j;	
	}

	/**
	*	Tokenizes function calls and their arguments
	*
	*   @param heap - Object containing defined function data
	*	@param tokens - List of current tokens
	*	@param exp - the expression as an array
	*	@param word - the called function's name
	*	@param i - the current location in the expression
	*	@param e - The error data in case on gets thrown
	*   @returns 
	*/
	private static handleCall(
		heap: Heap,
		tokens: (Token|TreeNode)[],
		exp: string[],
		word: string,
		profile: string[],
		i: number,
		e: error
	): handleCallReturn {
		let start = i+word.length+1;
		let j = start;

		e.char = j;
		let expectedArgs = heap.getProfile(word, e) || '';

		// If opening bracket exists, add a token
		if (exp[j-1] === '(') {	
			tokens.push(new Token(
				exp[j-1],
				'argOpen',
				-1, j-1
			));
		} else {
			// Look ahead for a closing bracket to ensure 
			// it is a function called with default params
			
			// Could and should be turned into Tokenizer.lookAhead
			let k = j;
			while (
				k < exp.length &&
				!Tokenizer.isOperator(exp[k]) &&
				exp[k] !== ')'
			) {
				k++;

				// If encounters a closing bracket,
				// and no opening was provided, throw an error
				if (exp[k] === ')') {
					e.char = j;
					ErrorHandler.expectedOpening(e);
				}
			}

			// No args specified, function called with defaults
			return { 
				defaultParams: true,
				newLocation:0,
				argProfile:[]
			}
		}
		// Iterate through every expected argument field
		for (let a = 0; a < expectedArgs.length; a++) {
			// Find where argument field closes
			while(
				j < exp.length &&
				(exp[j] !== ',' &&
				exp[j] !== ')')
			) {
				j++;
				// Skip function call if exists
				j = Tokenizer.skipFieldCall(exp, j);

			}

			// Get argument field expression
			let argExpression = exp.join('').slice(start, j)

			// If is constant, push a single Token
			if (Tokenizer.isConstant(
				Tokenizer.removeWhiteSpace(argExpression)
			)) {
				tokens.push(new Token(
					argExpression,
					'constant',
					-1, i
				));
				
				// Increment j and start at j
				j++;
				start = j;

				continue;
			}

			// Create tokens for the argument field	
			let arg = Tokenizer.process(heap, argExpression, e, start);
		
			if (arg.tokens.length === 0) {
				ErrorHandler.badArgumentSpecification(
					a, expectedArgs.length, e
				);
			}
			e.char = j-1;

			// Add argument field's profile to the line's profile
			profile = Profiler.removeDoubles(
				profile.concat(arg.profile.split('')).join('')
			).split('');
	
			// Create a tree with the new tokens
			let argTree = Parser.makeTree(heap, arg.tokens, arg.profile, e);

			// Make the tree an argument type 
			argTree.type = 'argument';
			argTree.char = j-1;

			// Add the tree to the line's tokens
			tokens.push(argTree);
	
			// Increment j, and start at j for next argument
			j++;
			start = j;
		}
	
		// Find other surplus arguments
		let k = j-1;
		while(exp[k] !== ')') {
			// Too many args
			if (Tokenizer.isVariable(exp[k])) {
				e.char = k;
				ErrorHandler.badArgumentSpecification(
					expectedArgs.length+1, expectedArgs.length, e
				);
			}
			// No closing bracket
			if (k >= exp.length) {
				e.char = k-1;
				ErrorHandler.expectedClosing(e);
			}
			k++;
		}

		j--;
		// Is a closing bracket present?
		// if not the Parser will catch the error if there is not
		if (exp[j] === ')') {	
			tokens.push(new Token(
				exp[j],
				'argClose',
				-1, j
			));
		} 

		return { 
			defaultParams:false,// Is the function called with default params?
			newLocation: j,		// The new location in the expression
			argProfile: profile // The new profile
		};
	}

	/**
	*	Tokenizes a given expression
	*
	*   @param heap - Object containing defined function data
	*   @param expression - The expression to tokenize
	*   @param e - The error data in case an error get thrown
	*   @param startAt - Value to add to line locations when an error gets thrown. Default is 0
	*
	*	@returns The expression Tokens, profile, and wheter or not it contains a function definition
	*/
	public static process(
		heap: Heap,
		expression: string,
		e: error,
		startAt:number = 0
	): TokenizerReturn {

		let tokens:(Token | TreeNode)[] = []; // The generated tokens
		let profile: string[] = [];			  // The different variables used in the expression
		let lineDef: string | undefined;	  // The defined function's name, if one exists

		// Expression as an array
		let exp = expression.split('');
			
		// Variables in parentheses have more priority
		let priorityScope = 0;
		
		for (let i = 0; i < exp.length; i++) {
			let char = exp[i];
			if (Tokenizer.isReserved(char)) {

				// Begin a new priorityScope
				if (Tokenizer.newScope(char)) priorityScope++;		

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
						Tokenizer.OPERATORS[char].priority + 12 * priorityScope, 
						// Scale the priority with the scope ^
						i+startAt
					));
				}

				// Close priority scope
				if (Tokenizer.endScope(char)) priorityScope--;	

			} else if (Tokenizer.isVariable(char)) {
				if (!profile.includes(char)) profile.push(char);

				tokens.push(new Token(
					char,
					'variable',
					-1, i+startAt
				))
			} else if (Tokenizer.isLowerCase(char)) { // KEYWORD DETECTION 

				let word = Tokenizer.getKeyword(exp, i); 

				// Is special keyword
				if (Tokenizer.KEYWORD[word]) {
					let keyword = Tokenizer.KEYWORD[word];
				
					if (keyword.type === 'function') {
						// Add the special keyword token 
						tokens.push(new Token(
							[...exp].splice(i, 3).join(''), 
							keyword.type,
							-1, i+startAt
						));

						// Skip the keyword's length
						i+=word.length;
					}
				} else if (word) {	
					// Not a special keyword, but word is defined?
					if (Tokenizer.isDef(tokens)) {
						// If Function is definition
						lineDef = word
						tokens.push(new Token(
							word,
							'functionName',
							-1, i+startAt
						));
					} else {
						// If Function is called
						// Push the function's name as a token
						tokens.push(new Token(
							word,
							'functionCall',
							Tokenizer.isSpecificCall(exp, i, word) ? 10 : -1,
							i+startAt
						));

						// Handle function arguments
						let {
							newLocation,
							argProfile,
							defaultParams
						} = Tokenizer.handleCall(
							heap, tokens, exp,
							word, profile, i, e
						);
						// If not using the default parameters,
						// set the new profile, and change location to after the function
						if (!defaultParams) {
							i = newLocation;
							profile = argProfile;
							continue;
						} else {
							// Function uses default parameters
							e.char = i;
							profile = Profiler.removeDoubles(
								profile.concat(
									(heap.getProfile(word, e) || '').split('')
								).join('')
							).split('');
						}
					}
					// Increment to skip the function keyword
					i+=word.length-1;
				} 

			} else if (Tokenizer.isAssign(char)) {

				tokens.push(new Token(
					char,
					Tokenizer.FUNCTION[char].type,
					Tokenizer.FUNCTION[char].priority,
					i+startAt
				))

			} else if (Tokenizer.isConstant(char)) {

				tokens.push(new Token(
					char,
					`constant`,
					-1, i+startAt
				))

			} else if (Tokenizer.isWhiteSpace(char)) {
			
			} else {
				e.char = i+startAt
				ErrorHandler.unexpectedIdentifier(e);
			}
		}

		// If line contains a function definition
		// Add its profile to the heap
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
