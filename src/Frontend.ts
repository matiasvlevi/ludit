import Utils from './ludit/Utils'
import { writeFileSync } from 'node:fs'
import { option, argv } from './options'
import { queries as QUERIES } from './options/queries'

import { Map } from './ludit/types'
import TreeNode from './ludit/TreeNode'
import Token from './ludit/Token'

import {
	Tokenizer,
	Preparser,
	Parser,
	Processor,
	Heap
} from './ludit/Core'

export default class Frontend {
	
	profile: string;
	tree: TreeNode;
	options: Map<option>;
	expression: string;
	heap: Heap;
	path: string | undefined;
	noprint: boolean;

	constructor(options: argv, noRun:boolean = false) {
		this.noprint = false;
		this.heap = new Heap();
		this.tree = new TreeNode(
			new Token('','',-1,-1),
			-1,
			new Token('','',-1,-1),
			new Token('','',-1,-1)
		)

		this.profile = '';
		this.expression = options.argument;
		this.options = options.queries;	

		// Run inline if no file was specified
		if (noRun) return;
		if (!this.options['file']) {
			// Show help if no options specified
			if (this.expression.length <= 0) {
				this.options['help'] = {
					requireParam: false,
					action: QUERIES.help.action,
					type: 'option', param: '' 
				};
				this.main();
				return;
			};

			this.inline(options);
		
		} else this.main();
	}

	inline(options: argv) {
		let err = { 
			line: 0,
			char: 0,
			text: this.expression 
		};
		const { tokens, profile } = Tokenizer.process(
			this.heap,
			this.expression || 'A', err
		);

		this.profile = profile;
	
		this.tree = Parser.makeTree(
			this.heap, tokens,
			profile, err
		);

		this.main();
	}

	fromFile(filename: string) {
		// Load file	
		let file = Preparser.loadFile(filename); 
		let fileLineNb = file.length;
		let includeLineNb = 0;

		this.path = Preparser.getPath(filename);

		// Remove file option so it does not run recursively
		delete this.options['file'];	
	
		// Handle included files
		if (Preparser.includesAnInclude(file)) {
			file = Preparser.include(file, this.path)
			includeLineNb = file.length - fileLineNb;
		}
	
		for (let i = 0; i < file.length; i++) {
			let currentLine = i+1 - includeLineNb;
			// Parse commments & prints
			let line = Preparser.filter(file[i]); 
			if (!line) continue; // Skip if empty line
	
			// Create tokens, profile and determine if line is a definition
			const { tokens, profile, isDef } = Tokenizer.process(
				this.heap,
				line,
				{ line: currentLine, char: -1, text: file[i]}
			);

			this.profile = profile; // Save profile (Variables used in line or definition)
			this.expression = line; // Save raw line

			// Create computation tree
			this.tree = Parser.makeTree(this.heap, tokens, profile, {
				line: currentLine,
				char: -1,
				text: file[i]
			});

			// Dont compute and print if is a definition
			if (!isDef) this.main();
		}
		
	}

	static applyValues(expression: string, values: string, profile: string) {
		for (let i = 0; i < profile.length; i++) {
			expression = Utils.replaceAll(expression, profile[i], values[i])	
		}
		return expression;
	}

	setNoPrint(state: boolean) {
		this.noprint = state;
	}

	// Calculate a single case
	runSingle(_input: string) {
		const input = _input.split('').map(x => +x);
		const output = +Processor.calculate(this.tree, this.profile, input);

		if (!this.noprint) console.log(`${Frontend.applyValues(
			this.expression,
			_input,
			this.profile
		)} = \x1b[33m${output}\x1b[0m`);
	}

	printSingle() {
		if (!this.noprint) console.log(
			`${this.expression} = `+
			`\x1b[33m${+Processor.calculate(this.tree, this.profile, [])}\x1b[0m`
		);
	}

	// Calculate a truth table 
	run() {
		// Run specific function call
		if (this.profile.length === 0) {
			this.printSingle();
			return;
		};

		const cases = Utils.binaryCases(this.profile.length);
		let output:Map<number>[] = [];
		
		for (let i = 0; i < cases.length; i++) {

			let row:Map<number> = {}; 
			for (let j = 0; j < this.profile.length; j++) {
				row[this.profile[j]] = cases[i][j];			
			}
			row.out = +Processor.calculate(this.tree, this.profile, cases[i]);
			output.push(row);
		}

		if (!this.noprint) console.table(output);
		return output;
	}

	save(filename: string) {
		const cases = Utils.binaryCases(this.profile.length);
		let csv =`${this.profile.split('').join(',')},Out\n`;
		for (let i = 0; i < cases.length; i++) {
			for (let j = 0; j < this.profile.length; j++) {
				csv += `${cases[i][j]},`;			
			}
			csv += +Processor.calculate(this.tree, this.profile, cases[i]);
			csv += '\n';
		}
		if (!this.noprint) process.stdout.write(csv);
		if (filename !== undefined)
			writeFileSync(filename, csv, 'utf-8');
	}

	main() {
		if (Object.keys(this.options).length === 0) return this.run();
		for (let query in this.options) {
			if (
				this.options[query].requireParam && 
				this.options[query].param === undefined
			) continue; 
			if (
				this.options[query].param !== undefined
			) {
				this.options[query].action(
					this,
					this.options[query].param || ''	
				);
			}
		}
	}
}



