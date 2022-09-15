/**
* The Tokenizer Module handles parsing raw text lines into meaningfull Tokens
*/
import * as Utils from "../Utils";

/*
* Methods
*/
export { handleCall } from './handleCall'
export { handleAttributes } from './handleAttributes'
export { process } from './process'

export { 
  isDef,
  isSpecificCall,
  skipFieldCall,
  getKeyword
} from './methods'


/*
* Character reference constants
*/
export const ALPHA: string           = Utils.getASCII(65, 91);
export const ALPHA_LOWERCASE: string = ALPHA.toLocaleLowerCase();
export const NUMERAL: string         = Utils.getASCII(48, 58);
export const WHITESPACE              = " ";
// Special characters for function names
export const SPECIAL                 = "_"; 

/*
* Keyword or Character maps for tokens
*/

export { 
  KEYWORD,
  CONSTANT,
  FUNCTION,
  SYNTAX,
  OPERATORS,
  ATTRIBUTE_DECLARATION,
  ATTRIBUTES
} from './keywords'


import {
  CONSTANT,
  ATTRIBUTE_DECLARATION,
  ATTRIBUTES,
  SYNTAX,
  OPERATORS
} from "./keywords";

/**
  * Condition methods
  *
  *   @param char - Character to compare to an other
  *
  *   @returns wheter or not the character fits the condition
  */
export function isVariable(char: string): boolean {
  return ALPHA.includes(char);
}

export function isAttributeDeclaration(char: string) {
  return Object.keys(ATTRIBUTE_DECLARATION).includes(char);
}

export function isValue(str: string): boolean {
  return NUMERAL.includes(str[0]);
}

export function isAttribute(char: string):boolean {
  return Object.keys(ATTRIBUTES).includes(char) ||
         NUMERAL.includes(char);
}

export function getAttribute(char:string) {
  if (isValue(char)) { 
    let att = ATTRIBUTES['numeric']; 
    att.char = char;
    return att;
  } else return ATTRIBUTES[char];
}

export function isOperator(char: string): boolean {
  return OPERATORS[char] !== undefined;
}

export function isReserved(char: string): boolean {
  return (
    isOperator(char) ||
            SYNTAX[char] !== undefined
  );
}

export function isNumeral(char: string): boolean {
  return NUMERAL.includes(char);
}

export function isAssign(char: string): boolean {
  return char === "=";
}

export function isBrackets(char: string): boolean {
  return SYNTAX[char] !== undefined;
}

export function isConstant(char: string): boolean {
  return CONSTANT[char] !== undefined;
}

export function isWhiteSpace(char: string): boolean {
  return WHITESPACE.includes(char);
}

export function isLowerCase(char: string): boolean {
  return ALPHA_LOWERCASE.includes(char);
}

export function isSpecial(char: string): boolean {
  return SPECIAL.includes(char);
}

export function newScope(char: string): boolean {
  return char === "(";
}

export function endScope(char: string): boolean {
  return char === ")";
}

