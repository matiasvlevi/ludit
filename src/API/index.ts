import {API} from "./api";

import { option, Options } from "../CLI/options";
import { error, errorCall, luditReturn, Map } from "../ludit/types";

/**
* Nodejs API function
*
*   @param expression - The expression to compute
*   @param callback - The error callback
*   @param options - Object with CLI option flags
*
*	@returns An array of the output of each line
*/
function ludit(
  expression: string,
  callback: errorCall = (e: error) => (e),
  options: Map<string> = {},
): luditReturn {

  // Convert object with option flags to option objects
  const queries: Map<option> = {};
  for (const key in options) {
    queries[key] = {
      action: Options.queries[key].action,
      param: options[key].length > 0 ? options[key] : undefined,
      type: "option",
      requireParam: Options.queries[key].requireParam,
    };
  }

  // Simulate cli argv and add option flags
  const argv = {
    argument: "", // No inline expression
    queries,
  };

  // Instantiate the API
  const api = new API(argv, true);

  // Add the callback to the heap
  api.heap.errorCall = callback;

  // Disable console output tables
  api.setNoPrint(true);

  // Start the ludit core process and return its output
  return api.multiLine(expression);
}

export = ludit;
