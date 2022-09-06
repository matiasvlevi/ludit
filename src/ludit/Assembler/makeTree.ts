import Assembler from "./index";

import { ErrorHandler } from "../ErrorHandler";
import { error } from "../types";

import Heap from "../Heap";
import Token from "../Token";
import Tokenizer from "../Tokenizer";
import TreeNode from "../TreeNode";

/**
 * generate a TreeNode based on the parsed tokens
 *
 *   @param heap - The heap object
 *   @param tokens - The parsed tokens
 *   @param profile - The expression's profile
 *   @param e - The error data in case of an error
 *
 *   @returns The root TreeNode of the generated tree
 */
export function makeTree(
  heap: Heap,
  tokens: Array<Token|TreeNode>,
  profile: string,
  e: error,
): TreeNode {

  // Get index of the operator to parse
  const highest = Assembler.getPriorityOperator(tokens);

  // If variable is alone in operation (ex: "A" or a declared value ex: "xor")
  // return function tree or token
  if (highest === -1) {
    if (tokens[0]) {
      if (tokens[0].type === "functionCall") {

        return heap.getTree(
          (tokens[0] as Token).literal,
        );

      } else if (tokens[0].type === "variable") {

        return tokens[0] as TreeNode;
      }

    } else {
      // Handle empty line
    }
  }
  // Initialise iteration node
  if (tokens[highest] === undefined) {
    if (tokens[tokens.length - 1] !== undefined) {
      e.char = tokens[tokens.length - 1].char;
    } else {
      e.char = 0;
    }
    ErrorHandler.assignmentError(heap, e);
  }

  const node = new TreeNode(
    tokens[highest] as Token,
    tokens[highest].char,
  );

  if (tokens[highest].type === "functionCall") {
    if (
      tokens[highest + 1] !== undefined &&
            tokens[highest + 1].type === "argOpen"
    ) {

      // Get the function's tree
      const rawTree = heap.getTree(
        (tokens[highest] as Token).literal,
      );

      if (rawTree === undefined) {
        // Function not def
      } else {
        // If function is defined

        // Get expected Arguments
        const expectedArgs: string = heap.getProfile(
          (tokens[highest] as Token).literal,
        ) || profile;

        // Set the arguments to the function's scope
        const tree = Assembler.setFunctionScope(
          rawTree,
          Assembler.getArgs(
            heap, tokens,
            expectedArgs,
            highest, e,
          ),
          expectedArgs,
        );

        // Count arguments, an remove them from the token array
        let argCount = 0;
        const j = highest + 1;
        while (
          j < tokens.length &&
        (
          tokens[j].type === "argument" ||
                        tokens[j].type === "constant" ||
                        tokens[j].type === "argOpen"  ||
                        tokens[j].type === "argClose"
        )
        ) {
          if (
            tokens[j].type === "argument" ||
                        tokens[j].type === "constant"
          ) {
            argCount++;
            e.char = tokens[j].char;
          }

          tokens.splice(j, 1);
        }

        // Throw an error if argument count doesn't match
        // expected argument length
        if (argCount !== expectedArgs.length) {
          ErrorHandler.badArgumentSpecification(
            argCount,
            expectedArgs.length,
            heap, e,
          );
        }

        // Replace function operator with
        // the new function's root TreeNode in the token array
        tokens.splice(highest, 1, tree);

        // Skip to next prioritized operator
        // continue recursilvely
        return Assembler.makeTree(heap, tokens, profile, e);
      }
    }
  }

  if (Tokenizer.isAssign(
    (tokens[highest] as Token).literal,
  )) {
    let j = highest;
    e.char = tokens[highest].char;

    // Iterate until it finds a functionName
    do {
      j--;
      if (j < 0 || tokens[j] === undefined) {
        ErrorHandler.missingVariable(
          "Missing definition to assign a value to", heap, e,
        );
      }
    } while (tokens[j].type !== "functionName");

    const functionName = (tokens[j] as Token).literal;

    // Iterate until it finds a definition
    j = highest;
    do {
      j++;
      if (j >= tokens.length) {
        ErrorHandler.missingVariable(
          "Missing assignment value", heap, e,
        );
      }
    } while (
      tokens[j].type !== "variable" &&
            tokens[j].type !== "constant"
    );

    // Add the new defined function to the heap object
    heap.setTree(functionName, tokens[j] as TreeNode);

    // return function's root TreeNode
    return (tokens[j] as TreeNode);
  }

  // If normal operator
  let j: number;

  // Look for parameter A (left)
  let left: Token|TreeNode|undefined;
  let leftIndex = -1;
  if (node.left === undefined) {

    j = highest;
    // Iterate until it finds left parameter
    do {
      j--;
      if (j < 0) {
        // Not found, throw an error
        e.char = tokens[highest].char;
        ErrorHandler.missingVariable(
          "Missing operator value",
          heap, e,
        );
      }
    } while (
      tokens[j].type !== "variable" &&
            tokens[j].type !== "constant" &&
            tokens[j].type !== "functionCall"
    );

    // If function call, look for its tree
    if (tokens[j].type === "functionCall") {
      // Integral function call
      if (tokens[j] instanceof Token) {
        left = heap.getTree((tokens[j] as Token).literal);
      }
    } else {
      // add the token
      left = tokens[j];
    }
    leftIndex = j;
  }

  // Look for parameter B (right)
  let right: Token|TreeNode|undefined;
  let rightIndex = -1;
  if (node.right === undefined) {
    j = highest;

    // Iterate until it finds right parameter
    do {
      j++;
      if (j >= tokens.length) {
        // Not found, throw an error
        e.char = tokens[tokens.length - 1].char;
        ErrorHandler.missingVariable(
          "Missing operator value", heap, e,
        );
      }
    } while (
      tokens[j].type !== "variable" &&
            tokens[j].type !== "constant" &&
            tokens[j].type !== "functionCall"
    );

    // If is function call, find its tree
    if (tokens[j].type === "functionCall") {
      // Integral function call
      if (tokens[j] instanceof Token) {
        right = heap.getTree((tokens[j] as Token).literal);
      }
    } else {
      // add the token
      right = tokens[j];
    }
    rightIndex = j;
  }

  // Set each branch
  // with found Tokens or TreeNodes
  node.left = left;
  node.right = right;

  // Remove used tokens and replace them with the
  // Calculation token
  tokens.splice(leftIndex, 1);
  tokens.splice(rightIndex - 1, 1);
  tokens.splice(highest - 1, 1, node);

  // If only token left is Calculation,
  // return the root node
  if (tokens.length <= 1) {
    return node;
  } else {
    // continue recursively
    return Assembler.makeTree(heap, tokens, profile, e);
  }
}
