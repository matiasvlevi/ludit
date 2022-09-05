import Tokenizer from './index'

import TreeNode from '../TreeNode'
import Token from '../Token'

/**
 * get the entire keyword from the expression array
 *
 *   @param exp - the expression as an array
 *   @param i - the location in the expression
 * 
 *   @returns the keyword
 */
export function getKeyword(
  exp:string[],
  i:number
):string {
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

/**
 * Detect if a function is a definition
 *
 *   @param tokens - The previously parsed tokens 
 *
 *   @returns wheter or not the function is a defintion
 */
export function isDef(
  tokens: (Token|TreeNode)[]
): boolean {
	if (tokens.length === 0) return false;
	return (tokens[tokens.length-1].type === 'function');
}

/**
 * Detect if the function is a specific call
 *
 *   @param exp - The expression as an array
 *   @param i - The location in the expression
 *   @param word - The function's name
 *
 *   @returns wheter or not the function is a specific call
 */
export function isSpecificCall(
  exp: string[],
  i:number,
  word:string
):boolean {
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

/**
 * Skip a function call in an other function's argument field
 *
 *   @param exp - expresion as an array
 *   @param j - location in the expression
 *
 *   @returns The end location of a the function call
 */
export function skipFieldCall(
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
