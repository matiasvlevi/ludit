import { process } from './process'
import { handleCall } from './handleCall'
import {
  isSpecificCall,
  getKeyword,
  isDef,
  skipFieldCall
} from './methods'

import Utils from '../Utils'

import { 
  syntax,
  functionSyntax,
  keyword,
  operation,
  Map
} from '../types'

export default class Tokenizer {
  /*
  * File methods
  */
  public static process = process;	
  public static handleCall = handleCall;
  public static isDef = isDef;
  public static skipFieldCall = skipFieldCall;
  public static getKeyword = getKeyword;
  public static isSpecificCall = isSpecificCall;

  /*
  * Keyword or Character maps for tokens
  */
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

  /**
  * Character reference constants
  *
  */ 

  static ALPHA:string      = Utils.getASCII(65, 91);
	static ALPHA_L:string    = Tokenizer.ALPHA.toLocaleLowerCase();
	static NUMERAL:string    = Utils.getASCII(48, 57);
	static WHITESPACE:string = ' ';

  /**
  * Condition methods
  *
  *   @param char - Character to compare to an other
  *
  *   @returns wheter or not the character fits the condition
  */

  static isVariable(char:string):boolean {
		return Tokenizer.ALPHA.includes(char);	
	}
	
	static isOperator(char:string):boolean {
		return Tokenizer.OPERATORS[char] !== undefined
	}

	static isReserved(char:string):boolean {
		return (
			Tokenizer.isOperator(char) ||
			Tokenizer.SYNTAX[char] !== undefined
		);
	}	

	static isNumeral(char: string):boolean {
		return Tokenizer.NUMERAL.includes(char);
	}

	static isAssign(char: string):boolean {
		return char === '=';
	}

	static isBrackets(char:string):boolean {
		return Tokenizer.SYNTAX[char] !== undefined;
	}

	static isConstant(char:string):boolean {
		return Tokenizer.CONSTANT[char] !== undefined;
	}

	static isWhiteSpace(char: string):boolean {
		return Tokenizer.WHITESPACE.includes(char)
	}

	static isLowerCase(char: string):boolean {
		return Tokenizer.ALPHA_L.includes(char);
	}

	static newScope(char: string):boolean {
		return char === '(';
	} 
	
	static endScope(char: string):boolean {
		return char === ')';
	} 

};
