import { Token } from '../Token'
import { TreeNode } from '../TreeNode'

/**
* Datatype representing syntax characters or keywords
*
*   @param type - The type of the character or keyword
*   @param priority - The priority of the character or keyword
*
*/
export interface syntax {
    type: string;
    priority: number;
}

/**
* Datatype representing an operation
*
*   @param type - The type of the operation
*   @param priority - The priority of the expression
*   @param op - The boolean operation of the operator
*/
export interface operation {
    type: string;
    priority: number;
    op: (a: boolean, b: boolean) => boolean;
}

/**
*   Datatype for storing key-value pairs, kays are always strings
*
*   @typeParam T - The type of the map
*/
export interface Map<T> {
    [key: string]: T;
}

/**
* datatype returned by handleCall
*
*   @param defaultParams - wheter or not the function uses its default parameters
*   @param newLocation - The location after the function call
*   @param argProfile - The profile of the function in the argument field
*
*/
export interface handleCallReturn {
    defaultParams: boolean;
    newLocation: number;
    argProfile: string[];
}

/**
* Datatype for returning tokens 
*/
export interface TokenizerReturn {
    tokens: Array<Token|TreeNode>;
    profile: string;
    isDef: boolean;
}

/**
* Datatype for storing error data
*
*   @param line - The line number of an error
*   @param char - The column number of an error
*   @param text - The raw text of expression causing the error
*   @param msg  - The error message (optional)
*/
export interface error {
    line: number;
    char: number;
    text: string;
    msg?: string;
}

/**
* Error callback
*/
export type errorCall = (e: error) => void;

/**
* API Output Single Line return type
*/
export type luditLineReturn = Array<Map<number>>;

/**
* API Output Multiline return type
*/
export type luditReturn = Array<Array<Map<number>>>;
