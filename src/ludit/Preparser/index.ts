import {
  checkInclude,
  containsInclude,
  evalPath,
  filter,
  getPath,
  handleComments,
  handlePrints,
  include,
  loadFile,
  makeBackPath,
  parseQuotes,
  resolve,
} from "./methods";

import { error, Map } from "../types";

/**
* Types for keywords like `include`
*/
interface preParserKeyword {
    type: string;
    action: (line: string, e: error) => string[];
}

/**
* The Preparser handles parsing before the Tokenizer and the Parser get called,
* It is the logical equivalent of ++ and C preprocessors which handle `#define` and `#include` keywords
*
* All methods are static, this class is used as a namespace
*/
export default class Preparser {

  public static loadFile = loadFile;
  public static include = include;
  public static filter = filter;
  public static handlePrints = handlePrints;
  public static handleComments = handleComments;
  public static evalPath = evalPath;
  public static checkInclude = checkInclude;
  public static containsInclude = containsInclude;
  public static parseQuotes = parseQuotes;
  public static getPath = getPath;
  public static resolve = resolve;
  public static makeBackPath = makeBackPath;

  /**
  * Preparser keywords
  */
  public static KEYWORD: Map<preParserKeyword> = {
    include: {
      type: "include",
      action: (path: string, e: error): string[] => {
        return Preparser.loadFile(path, e);
      },
    },
  };
}
