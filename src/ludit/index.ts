import { Map } from '../ludit/types'

import { option, Options } from '../options';

import { 
    Tokenizer,
    Preparser,
    Parser
} from './Core'

import Frontend from '../Frontend';
import { error } from './ErrorHandler';

class API extends Frontend {
    multiLine(file: string) {
        let output = [];
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

            if (this.heap.hasError()) return { e: this.heap.error };

			this.profile = profile; // Save profile (Variables used in line or definition)
			this.expression = line; // Save raw line

			// Create computation tree
			this.tree = Parser.makeTree(this.heap, tokens, profile, {
				line: currentLine,
				char: -1,
				text: document[i]
			});

			// Dont compute and print if is a definition
			if (!isDef) output.push(this.main());
		}
		return { output };
	}
}

export default function ludit(
    expression:string,
    callback: ((e: error)=>void) = (e:error)=>{},
    options: Map<string> = {}
) { 

    const queries: Map<option> = {};
    for (let key in options) {
        queries[key] = {
            action: Options.queries[key].action,
            param: options[key].length > 0 ? options[key] : undefined,
            type: 'option',
            requireParam: Options.queries[key].requireParam
        };
    }

    const argv = {
        argument: "",
        queries
    };

    const api = new API(argv, true);
    api.heap.errorCall = callback;


    api.setNoPrint(true);

    let { output } = api.multiLine(expression);


    return output;
}
