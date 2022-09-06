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
export function error(
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
    }
    process.exit();
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

export function arrow(char: number) {
  let space = " ";
  for (let i = 0; i < char; i++) { space += " "; }
  return `${COLOR}${space}^${RESET}`;
}

export function assignmentError(heap: Heap, e: error) {
  error(
    "Expected assignment operator",
    e, heap,
  );
}

export function functionNotDef(heap: Heap, e: error) {
  error(
    "function is not defined",
    e, heap,
  );
}

export function expectedOpening(heap: Heap, e: error) {
  error(
    `Expected opening brackets`,
    e, heap,
  );
}

export function expectedClosing(heap: Heap, e: error) {
  error(
    `Expected closing brackets`,
    e, heap,
  );
}

export function missingVariable(msg: string, heap: Heap, e: error) {
  error(
    msg,
    e, heap,
  );
}

export function envError(varname: string) {
  error(
    `${varname} environement variable not set`,
  );
}

export function badArgumentSpecification(
  argCount: number,
  expected: number,
  heap: Heap,
  e: error,
) {
  if (expected > argCount) {
    error(
      `Missing arguments, expected ${expected} arguments.`,
      e, heap,
    );
  } else if (expected < argCount) {
    error(
      `Too many arguments, expected ${expected} arguments.`,
      e, heap,
    );
  }
}

export function unexpectedIdentifier(heap: Heap, e: error) {
  error(
    `Unexpected identifier '${e.text[e.char]}' found`,
    e, heap,
  );
}

export function includeNotFound(
  includeName: string,
  e: error | undefined,
) {
  error(
    `include file not found ${includeName}`, e,
  );
}