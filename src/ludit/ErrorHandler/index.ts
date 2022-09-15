import * as Utils from "../Utils";

import { error } from "../types";

import { Heap } from "../Heap";

export const COLOR = "\x1b[91m";
export const RESET = "\x1b[0m";
export const DARK = "\x1b[90m";

/**
* generic error message
*
*   @param msg - The error message
*   @param e - The error data
*   @param heap - The heap object
*/
export function throwError(
  msg: string,
  e: (error|undefined) = undefined,
  heap: (Heap|undefined) = undefined,
) {

  let coord = ``;

  if (heap) {
    if (heap.errorCall !== undefined) {
      if (e) { e.msg = msg; }
      heap.error = e;
      heap.errorCall(e || {text: "", line: 0, char: 0});

      process.exit();
    }
  }

  if (e) { coord = `at ${e.line}:${e.char} `; }

  console.log(
    `${COLOR}Ludit error ${coord}` +
          `${RESET}[${COLOR} ${msg} ${RESET}]`);

  if (e) {
    console.log("");
    console.log(`   ${DARK}${e.line}${RESET} ${e.text}`);
    console.log(
      `   ${Utils.whitespace(`${e.line}`.length)}` +
      `${arrow(e.char)}`,
    );
  }

  process.exit();
}

/**
* Create a string with an arrow at a column location
*
*   @param arrow - The column number 
*
*   @returns A string with an arrow at the specified column location
*/ 
export function arrow(char: number): string {
  let space = " ";
  for (let i = 0; i < char; i++) { space += " "; }
  return `${COLOR}${space}^${RESET}`;
}

/**
* Throw assignment error
*
*   @param heap - The current Heap instance   
*   @param e - The error data
*/ 
export function assignmentError(heap: Heap, e: error): void {
  throwError(
    "Expected assignment operator",
    e, heap,
  );
}


/**
* Throw an undefined function error
*
*   @param heap - The current Heap instance   
*   @param e - The error data
*/ 
export function functionNotDef(heap: Heap, e: error): void {
  throwError(
    "function is not defined",
    e, heap,
  );
}

/**
* Throw an expected opening brackets error
*
*   @param heap - The current Heap instance   
*   @param e - The error data
*/ 
export function expectedOpening(heap: Heap, e: error): void {
  throwError(
    `Expected opening brackets`,
    e, heap,
  );
}

/**
* Throw an expected closing brackets error
*
*   @param heap - The current Heap instance   
*   @param e - The error data
*/ 
export function expectedClosing(heap: Heap, e: error): void {
  throwError(
    `Expected closing brackets`,
    e, heap,
  );
}

/**
* Throw a missing variable to an operator error
*
*   @param msg - The error message to display
*   @param heap - The current Heap instance   
*   @param e - The error data
*/ 
export function missingVariable(msg: string, heap: Heap, e: error) {
  throwError(
    msg,
    e, heap,
  );
}

/**
* Throw an environement variable error
*
*   @param varname - Undefined environement variable's name
*/ 
export function envError(varname: string) {
  throwError(
    `${varname} environement variable not set`,
  );
}

/**
* Throw a bad argument specification error
*
*   @param argCount - The given arguments count in a function call
*   @param expected - The expected arguments count in a function call
*   @param heap - The current Heap instance
*   @param e - The error data
*/
export function badArgumentSpecification(
  argCount: number,
  expected: number,
  heap: Heap,
  e: error,
) {
  if (expected > argCount) {
    throwError(
      `Missing arguments, expected ${expected} arguments.`,
      e, heap,
    );
  } else if (expected < argCount) {
    throwError(
      `Too many arguments, expected ${expected} arguments.`,
      e, heap,
    );
  }
}

/**
* Throw an unexpected identifier error
*
*   @param heap - The current Heap instance
*   @param e - The error data
*/
export function unexpectedIdentifier(heap: Heap, e: error) {
  let identifier = e.text[e.char] === undefined ? '' : `'${e.text[e.char]}' `;
  throwError(
    `Unexpected identifier ${identifier}found`,
    e, heap
  );
}

/**
* Throw an include not found error
*
*   @param includeName - The included file's name  
*   @param e - The error data
*/
export function includeNotFound(
  includeName: string,
  e: error | undefined,
) {
  throwError(
    `include file not found ${includeName}`, e,
  );
}

