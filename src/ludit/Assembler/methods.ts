import { ErrorHandler } from "../ErrorHandler";

import Heap from "../Heap";
import Token from "../Token";
import TreeNode from "../TreeNode";

import { error, Map } from "../types";

/**
* get highest priority operator in the list of tokens
*
*   @param tokens - List of Tokens and TreeNodes
*
*   @returns The index of the priority operator, outputs -1 if none found
*/
export function getPriorityOperator(
  tokens: Array<Token|TreeNode>,
): number {
  let highest = 0;
  let highestIndex = -1;

  for (let i = 0; i < tokens.length; i++) {
    if (
      tokens[i].type === "operator" ||
            tokens[i].type === "functionCall"
    ) {
      if (tokens[i].priority > highest)  {
        highest = tokens[i].priority;
        highestIndex = i;
      }
    }
  }

  return highestIndex;
}

/**
* set arguments to the function's scope
*
*   @param _tree - the root tree node of the function
*   @param args - the function's arguments
*   @param profile - the arguments profile
*
*   @returns the root node of the function with the right values
*/
export function setFunctionScope(
  _tree: TreeNode,
  args: Map<Token|TreeNode>,
  profile: string,
) {
  const tree = _tree.copy();
  tree.setScope(args, profile);
  return tree;
}

/**
* get call arguments
*
*   @param heap - The heap object
*   @param tokens - The expression's tokens
*   @param profile - The expression's profile
*   @param currentLocation - The location in the expression
*   @param e - The error data in case one is thrown
*
*   @returns The arguments of the function
*/
export function getArgs(
  heap: Heap,
  tokens: Array<Token|TreeNode>,
  profile: string,
  currentLocation: number,
  e: error,
): Map<Token|TreeNode> {

  const args: Map<Token|TreeNode> = {
    ".": new Token(".", "variable", -1, currentLocation),
  };

  // Iterate until closing bracket
  let i = currentLocation;
  let j = 0;
  while (tokens[i].type !== "argClose") {

    // If argument found, add it
    if (
      tokens[i].type === "argument" ||
            tokens[i].type === "constant"
    ) {
      args[profile[j]] = (tokens[i]);
      j++;
    }

    // If too many arguments are provided, throw an error
    if (j >= profile.length) {
      e.char = tokens[i - 1].char;
      ErrorHandler.badArgumentSpecification(j, profile.length, heap, e);
    }

    i++;

    // If no closing statement found
    if (tokens[i] === undefined) {
      e.char = tokens[i - 1].char;
      ErrorHandler.expectedClosing(heap, e);
    }
  }
  return args;
}
