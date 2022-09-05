import Tokenizer from './index'

import Utils from '../Utils'

import { ErrorHandler, error } from '../ErrorHandler'

import Heap from '../Heap'
import TreeNode from '../TreeNode'
import Token from '../Token'

type TokenizerReturn = {
	tokens: (Token|TreeNode)[];
	profile: string;
	isDef: boolean;
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
export function process(
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
						profile = Utils.removeDuplicates(
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
			ErrorHandler.unexpectedIdentifier(heap, e);
		}
	}

	// If line contains a function definition
	// Add its profile to the heap
	if (lineDef) {
		heap.setProfile(lineDef, Utils.sortString(profile));
	}

	return { 
		tokens,
		isDef: (lineDef !== undefined),
		profile: Utils.sortString(profile)
	};
};
