/**
* The Preparser Namespace handles parsing before the Tokenizer and the Parser get called,
* It is the logical equivalent of ++ and C preprocessors which handle `#define` and `#include` keywords
*
*/

import { error, Map } from "../types";
import { loadFile } from "./methods";


/**
* Types for keywords like `include`
*/
interface preParserKeyword {
    type: string;
    action: (line: string, e: error) => string[];
}

export const KEYWORD: Map<preParserKeyword> = {
  include: {
    type: "include",
    action: (path: string, e: error): string[] => {
      return loadFile(path, e);
    },
  },
};

export {
  checkInclude,
  containsInclude,
  evalPath,
  filter,
  getPath,
  include,
  loadFile,
  makeBackPath,
  parseQuotes,
  resolve,
} from "./methods";
