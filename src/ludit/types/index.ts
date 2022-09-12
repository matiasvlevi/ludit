import { CLI } from '../../CLI'
import { Token } from '../Token'
import { TreeNode } from '../TreeNode'

/**
* Datatype representing syntax characters or keywords
*/
export interface syntax {
    /**
    * The type of the character or keyword
    */ 
    type: string;
    /**
    * The priority of the character or keyword
    */
    priority: number;
}

/**
* Datatype representing an attribute
*
* @remark
* Attributes can be specified with the `~` keyword 
*  
* @example
* This is an example with the `reverse` attribute
* ```py
* A + B * C ~r
* ```
*/
export interface attribute {
  /**
  * The attribute character
  */ 
  char: string;
  /**
  * The attribute's type
  */ 
  type: string
  /**
  * The action the attribute performs, acting upon the CLI instance
  */ 
  action: (
    app:CLI,
    currentLine:number, 
    char:string
  ) => void;
}


export interface attributes {
  format: attribute[];
  print: attribute[];
}

/**
* Datatype representing the object stored in CLI which records what attributes were set
*/
export interface attributeConfig {
  /**
  * print a table to the console (default)
  *
  * this attribute is set with `~t`
  */ 
  table: boolean;
  /**
  * print a karnaugh table to the console
  *
  * this attribute is set with `~k`
  */ 
  karnaugh: boolean;
  /**
  * reverse the table labels, ex: `ABCD` becomes `DCBA`
  *
  * this attribute is set with `~r`
  */ 
  reverse: boolean;
  
  /**
  * Specify a number of cases to print
  *
  * Usefull for tables meant for 7 segment digis, 
  * or any other system with binary cases trucated 
  */ 
  cases: number;
}

/**
* Datatype determining how a for loop should operate
*/ 
export interface Iterator {
  /**
  * The start value of the iterator
  */
  start: number
  /**
  * When should the iterator run
  */
  condition: (j:number) => boolean
  /**
  * index change for every iteration 
  */
  increment: number
}

/**
* Datatype representing an operation keyword
*/
export interface operation {
    /**
    * The type of the operation
    */ 
    type: string;
    /**
    * The priority of the expression
    */ 
    priority: number;
    /**
    * The boolean operation of the operator
    */ 
    op: (a: boolean, b: boolean) => boolean;
}

/**
*   Datatype for storing key-value pairs, kays are always strings
*
*   @typeParam T - Type of value to store in the map
*/
export interface Map<T> {
    [key: string]: T;
}

/**
* Datatype returned by handleCall
*/
export interface handleCallReturn {
    /**
    * wheter or not the function uses its default parameters
    */ 
    defaultParams: boolean;
    /**
    * The location after the function call is iterated over
    */ 
    newLocation: number;
    /**
    * The profile of the function in the argument field
    */ 
    argProfile: string[];
}

/**
* Datatype for returning tokens 
*/
export interface TokenizerReturn {
    /**
    * The token array
    */ 
    tokens: Array<Token|TreeNode>;
    /**
    * The variables used as an alphabetically sorted string
    */ 
    profile: string;
    /**
    * Whether or not the processed line is a function definition
    */ 
    isDef: boolean;
}

/**
* Datatype for storing error data
*/
export interface error {
    /**
    * The line number of an error
    */ 
    line: number;
    /**
    * The column number of an error
    */ 
    char: number;
    /**
    * The raw text of expression causing the error
    */ 
    text: string;
    /**
    * The error message (optional)
    */ 
    msg?: string;
}

/**
*
*
*/ 
export type lineType = {
  line: string,
  type: string
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
