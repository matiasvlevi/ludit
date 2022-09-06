import CLI from '../CLI'
import { luditReturn } from '../ludit/types'

import {
    Tokenizer,
    Preparser,
    Assembler
} from '../ludit/Core'

/**
* The API class is derived from CLI
* it serves the same purpose as the CLI class, but it can not load files, 
* it can only read the given multiline expression
*/
export default class API extends CLI {

  multiLine(file: string):luditReturn {
    let output:luditReturn = [];
    let document = file.split('\n'); 
    let includeLineNb = 0;

    for (let i = 0; i < document.length; i++) {
		  let currentLine = i+1 - includeLineNb;
		  // Parse commments & prints
		  let line = Preparser.filter(document[i]); 
		  if (!line) continue; // Skip if empty line
	
			// Create tokens, profile and determine if line is a definition
			const { tokens, profile, isDef } = Tokenizer.process(
				this.heap,
			 	line,
			 	{ line: currentLine, char: -1, text: document[i]}
			 );

			this.profile = profile; // Save profile (Variables used in line or definition)
			this.expression = line; // Save raw line

			// Create computation tree
			this.tree = Assembler.makeTree(this.heap, tokens, profile, {
				line: currentLine,
				char: -1,
			 	text: document[i]
			});

			// Dont compute and print if is a definition
			if (!isDef) output.push(this.main());
		}
		return output;
	}
}
