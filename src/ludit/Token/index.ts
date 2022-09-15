/**
* Token Class
*
*   Serves as a character or keyword with special meaning
*/
export class Token {
  
  /**
  * The raw content of a token
  */ 
  public literal: string;

  /**
  * The type of this token
  * can be either 
  * `operator`, `variable`, `argOpen`, `argClose`, `function`, `functionCall`
  */ 
  public type: string;

  /**
  * The priority of the token.
  *
  * value is `-1` if should not be taken into account in operator calls
  * Variable Tokens are arguments to operators, thus, 
  * they do not have a priority, their operators have.
  */ 
  public priority: number;

  /**
  * The column number of the character for error messages
  */ 
  public char: number;

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
    type: string,
    priority: number,
    char: number,
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
  public copy() {
    return new Token(
      this.literal,
      this.type,
      this.priority,
      this.char,
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
  public calculate(input: boolean[], profile: string) {
    return input[0];
  }
}
