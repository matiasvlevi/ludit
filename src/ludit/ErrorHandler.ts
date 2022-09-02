const COLOR = '\x1b[91m';
const RESET = '\x1b[0m';
const DARK = '\x1b[90m'
export type error = {
	line: number;
	char: number;
	text: string;
}

export class ErrorHandler {
	constructor() {}

	static whitespace(str: string) {
		return new Array(str.length).fill(' ').join('');
	}

	static error(msg: string, e:error | undefined = undefined) {

		let coord = ``;

		if (e) coord = `at ${e.line}:${e.char} `;

		console.log(
			`${COLOR}Ludit error ${coord}`+
			`${RESET}[${COLOR} ${msg} ${RESET}]`);

		if (e) {
			console.log('');
			console.log(`   ${DARK}${e.line}${RESET} ${e.text}`);
			console.log(
				`   ${ErrorHandler.whitespace(`${e.line}`)}`+
				`${ErrorHandler.arrow(e.char)}`
			)
		}

		process.exit();
	}

	static arrow(char:number) {
		let space = ' ';
		for (let i = 0; i < char; i++) space += ' ';
		return `${COLOR}${space}^${RESET}`;
	}

	static assignmentError(e: error) {
		ErrorHandler.error(
			'Expected assignment operator',
			e
		);
	}

	static functionNotDef(e: error) {
		ErrorHandler.error(
			'function is not defined',
			e
		);
	}

	static missingVariable(msg: string, e: error) {
		ErrorHandler.error(
			msg,
			e
		);
	}

	static envError(varname: string) {
		ErrorHandler.error(
			`${varname} environement variable not set`
		);
	}

	static includeNotFound(
		includeName: string,
		e: error | undefined 
	) {
		ErrorHandler.error(
			`include file not found ${includeName}`,
			e
		)
	}
}
