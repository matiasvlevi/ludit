export default class Token {
	literal: string;
	type: string;
	priority: number;
	char: number;

	constructor(
		literal: string,
		type:string,
		priority: number,
		char: number
	) {
		this.type = type;			
		this.literal = literal;
		this.priority = priority;
		this.char = char;
	}

	copy() {
		return new Token(
			this.literal,
			this.type,
			this.priority,
			this.char
		);
	}
};
