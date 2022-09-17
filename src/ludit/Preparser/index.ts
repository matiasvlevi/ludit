/**
* The Preparser Namespace handles parsing before the Tokenizer and the Parser get called,
* It is the logical equivalent of ++ and C preprocessors which handle `#define` and `#include` keywords
*
*/

import { Preparser } from "../Core";
import { CLI } from "../Frontend";
import { Map } from "../types";
import { parseQuotes } from "./methods";

/**
* Types for keywords like `include`
*/
interface preParserKeyword {
    type: string;
    action: (cli: CLI, data:any) => string[];
}

export const KEYWORD: Map<preParserKeyword> = {
  include: {
    type: "include",
    action: (cli: CLI, data:any): string[] => {
      let file = Preparser.include(data.file, cli.path || './');
      cli.setLineNb(file.length, data.file.length);
      return file;
    },
  },
  /**
  * Unused keyword, profile is hardcoded
  */ 
  profile: {
    type:'profile',
    action: (cli: CLI, data:any): string[] => { 
      let words = data.file[data.lineNb].split(' ');
      cli.setGlobalProfile(parseQuotes(words[1]));
      data.file.splice(data.lineNb, 1);
    
      return data.file; 
    }
  }
};

export {
  checkInclude,
  containsInclude,
  getGlobalProfile,
  handleKeywords,
  evalPath,
  filter,
  getPath,
  include,
  loadFile,
  makeBackPath,
  parseQuotes,
  resolve,
} from "./methods";
