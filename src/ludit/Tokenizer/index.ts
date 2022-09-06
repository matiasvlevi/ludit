import { handleCall } from "./handleCall";
import {
  getKeyword,
  isDef,
  isSpecificCall,
  skipFieldCall,
} from "./methods";
import { process } from "./process";

import Utils from "../Utils";

import {
  Map,
  operation,
  syntax,
} from "../types";

/**
* The Tokenizer handles parsing raw text lines into meaningfull Tokens
*
* All methods are static this class is used as a Namespace
*/
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
  public static KEYWORD: Map<syntax> = {
    def: {
      type: "function",
      priority: -1,
    },
  };

  public static CONSTANT: Map<syntax> = {
    0: {
      type: "constant",
      priority: -1,
    },
    1: {
      type: "constant",
      priority: -1,
    },
  };

  public static FUNCTION: Map<syntax> = {
    "=": {
      type: "operator",
      priority: 0.5,
    },
  };

  public static SYNTAX: Map<syntax> = {
    "(": {
      type: "open",
      priority: 0,
    },
    ")": {
      type: "close",
      priority: 0,
    },
  };

  public static OPERATORS: Map<operation> = {
    "+": {
      type: "operator",
      priority: 1,
      op: (a: boolean, b: boolean) => (a || b),
    },
    "*": {
      type: "operator",
      priority: 2,
      op: (a: boolean, b: boolean) => (a && b),
    },
    "!": {
      type: "operator",
      priority: 3,
      op: (a: boolean, b: boolean) => (!b),
    },
    "'": {
      type: "operator",
      priority: 3,
      op: (a: boolean, b: boolean) => (!b),
    },
  };

  /**
  * Character reference constants
  *
  */

  public static ALPHA: string      = Utils.getASCII(65, 91);
  public static ALPHA_L: string    = Tokenizer.ALPHA.toLocaleLowerCase();
  public static NUMERAL: string    = Utils.getASCII(48, 57);
  public static WHITESPACE = " ";

  /**
  * Condition methods
  *
  *   @param char - Character to compare to an other
  *
  *   @returns wheter or not the character fits the condition
  */

  public static isVariable(char: string): boolean {
    return Tokenizer.ALPHA.includes(char);
  }

  public static isOperator(char: string): boolean {
    return Tokenizer.OPERATORS[char] !== undefined;
  }

  public static isReserved(char: string): boolean {
    return (
      Tokenizer.isOperator(char) ||
            Tokenizer.SYNTAX[char] !== undefined
    );
  }

  public static isNumeral(char: string): boolean {
    return Tokenizer.NUMERAL.includes(char);
  }

  public static isAssign(char: string): boolean {
    return char === "=";
  }

  public static isBrackets(char: string): boolean {
    return Tokenizer.SYNTAX[char] !== undefined;
  }

  public static isConstant(char: string): boolean {
    return Tokenizer.CONSTANT[char] !== undefined;
  }

  public static isWhiteSpace(char: string): boolean {
    return Tokenizer.WHITESPACE.includes(char);
  }

  public static isLowerCase(char: string): boolean {
    return Tokenizer.ALPHA_L.includes(char);
  }

  public static newScope(char: string): boolean {
    return char === "(";
  }

  public static endScope(char: string): boolean {
    return char === ")";
  }

}
