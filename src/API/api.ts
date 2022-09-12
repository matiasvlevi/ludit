import {CLI} from "../CLI";
import { luditReturn } from "../ludit/types";

import {
  Assembler,
  Preparser,
  Tokenizer,
} from "../ludit/Core";

/**
* The API class is derived from CLI
* it serves the same purpose as the CLI class, but it can not load files,
* it can only read the given multiline expression
*/
export class API extends CLI {

  public multiLine(
    file: string
  ): luditReturn {
    const output: luditReturn = [];
    const document = file.split("\n");
    const includeLineNb = 0;

    for (let i = 0; i < document.length; i++) {
      const currentLine = i + 1 - includeLineNb;
      // Parse commments & prints
      const { line, type } = Preparser.filter(document[i]);
      if (type === 'comment' || type === 'print') { continue; } // Skip if empty line

      // Create tokens, profile and determine if line is a definition
      const { tokens, profile, isDef } = Tokenizer.process(
        this.heap,
        line,
        { line: currentLine, char: -1, text: document[i]}, i
      );

      this.profile = profile; // Save profile (Variables used in line or definition)
      this.expression = line; // Save raw line

      // Create computation tree
      this.tree = Assembler.makeTree(this.heap, tokens, profile, {
        line: currentLine,
        char: -1,
        text: document[i],
      });

      // Dont compute and print if is a definition
      if (!isDef) { output.push(this.main()); }
    }
    return output;
  }
}
