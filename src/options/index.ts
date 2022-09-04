import { Map } from '../ludit/types'
import { queries, optionAction, optionConfig } from './queries'

export type option = {
	action: optionAction;
	param?: string;
	requireParam: boolean;
	type: string;
}

export type argv = {
	argument: string;
	queries: Map<option>;
};

export class Options {
	constructor() {}

	static isOption(text: string) {
		return (Options.queries[text] !== undefined);
	}

	static getOptionFromAbreviation(char: string): string | undefined {
		for (let key in Options.queries) {
			if (char === key[0]) return key;
		}
		return;
	}

	static noParam(argv: string[], i: number) {
		return (argv[i+1] !== undefined && argv[i+1][0] !== '-')
	}

	static parse(argv: string[]) {
		let data:argv = {
			argument: '',
			queries: {}
		};
		for (let i = 0; i < argv.length; i++) {
			if (argv[i][0] === '-') {
				if (argv[i][1] === '-') {
					let opt = argv[i].slice(2, argv[i].length);
					if (Options.isOption(opt)) {
						data.queries[opt] = {
							action: Options.queries[opt].action,
							param: Options.noParam(argv, i) ? argv[i+1]:undefined,
							type: 'option',
							requireParam: Options.queries[opt].requireParam
						};
						if (Options.noParam(argv, i)) argv.splice(i+1, 1);
					}
				} else {
					let opt = 
						Options.getOptionFromAbreviation(argv[i][1]);
					if (opt !== undefined) {
						data.queries[opt] = {
							action: Options.queries[opt].action,
							param: Options.noParam(argv, i) ? argv[i+1]:undefined,
							type: 'option',
							requireParam: Options.queries[opt].requireParam
						}
						if (Options.noParam(argv, i)) argv.splice(i+1, 1);
					}	
				}
			} else if (i >= 2) {
				data.argument = argv[i];	
			}
		}
		return data;
	}
	static queries: Map<optionConfig> = queries;
}
