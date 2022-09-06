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
