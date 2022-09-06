
/**
* Token Class
*
*   Serves as a character or keyword with special meaning 
*/
export default class Token {
	literal: string;
	type: string;
	priority: number;
	char: number;

  /**
  * Token constructor
  *
  *   @param literal - The literal expression of this token
  *   @param type - The type of this token
  *   @param priority - The priority this token has in an operation (-1, if it should not be considered for running operations, ie a variable)
  *   @param char - The column the character or keyword starts at
  */
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

  /**
  * copy a token
  *
  *   @returns an identical copy of the token
  */
	copy() {
		return new Token(
			this.literal,
			this.type,
			this.priority,
			this.char
		);
	}

  /**
  * calculate a singular token
  *
  *   @param input - an array of input bits 
  *   @param profile - the expression's profile
  * 
  *   @returns the input value 
  */
	calculate(input: boolean[], profile:string) {
		return input[0];
	} 
};
