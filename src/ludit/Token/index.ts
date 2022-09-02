export default class Token {
	literal: string;
	type: string;
	priority: number;

	constructor(
		char: string,
		type:string,
		priority: number,
	) {
		this.type = type;			
		this.literal = char;
		this.priority = priority;
	}

	copy() {
		return new Token(
			this.literal,
			this.type,
			this.priority
		);
	}
};
