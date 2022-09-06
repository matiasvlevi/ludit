import Heap from "../Heap";
import { error } from "../types";
import Utils from "../Utils";

const COLOR = "\x1b[91m";
const RESET = "\x1b[0m";
const DARK = "\x1b[90m";

export class ErrorHandler {
  /**
  * generic error message
  *
  *   @param msg - The error message
  *   @param e - The error data
  *   @param heap - The heap object
  */
  public static error(
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
                `${ErrorHandler.arrow(e.char)}`,
      );
    }

    process.exit();
  }

  public static arrow(char: number) {
    let space = " ";
    for (let i = 0; i < char; i++) { space += " "; }
    return `${COLOR}${space}^${RESET}`;
  }

  public static assignmentError(heap: Heap, e: error) {
    ErrorHandler.error(
      "Expected assignment operator",
      e, heap,
    );
  }

  public static functionNotDef(heap: Heap, e: error) {
    ErrorHandler.error(
      "function is not defined",
      e, heap,
    );
  }

  public static expectedOpening(heap: Heap, e: error) {
    ErrorHandler.error(
      `Expected opening brackets`,
      e, heap,
    );
  }

  public static expectedClosing(heap: Heap, e: error) {
    ErrorHandler.error(
      `Expected closing brackets`,
      e, heap,
    );
  }

  public static missingVariable(msg: string, heap: Heap, e: error) {
    ErrorHandler.error(
      msg,
      e, heap,
    );
  }

  public static envError(varname: string) {
    ErrorHandler.error(
      `${varname} environement variable not set`,
    );
  }

  public static badArgumentSpecification(
    argCount: number,
    expected: number,
    heap: Heap,
    e: error,
  ) {
    if (expected > argCount) {
      ErrorHandler.error(
        `Missing arguments, expected ${expected} arguments.`,
        e, heap,
      );
    } else if (expected < argCount) {
      ErrorHandler.error(
        `Too many arguments, expected ${expected} arguments.`,
        e, heap,
      );
    }
  }

  public static unexpectedIdentifier(heap: Heap, e: error) {
    ErrorHandler.error(
      `Unexpected identifier '${e.text[e.char]}' found`,
      e, heap,
    );
  }

  public static includeNotFound(
    includeName: string,
    e: error | undefined,
  ) {
    ErrorHandler.error(
      `include file not found ${includeName}`, e,
    );
  }
}
