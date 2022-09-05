import Tokenizer from '../Tokenizer'
import Token from '../Token'
import { Map } from '../types'

export default class TreeNode {
	value: Token;
	left: TreeNode | Token | undefined;
	right: TreeNode | Token | undefined;
	type: string;
	priority: number;
	result: boolean | undefined;
	char: number;

	constructor(
		value: Token,
		char: number,
		left?: TreeNode | Token | undefined,
		right?: TreeNode | Token | undefined,
	) {
		this.type = 'variable';
		this.priority = -1;
		this.value = value;
		this.left = left;
		this.right = right;
		this.result = undefined;
		this.char = char
	}

  /**
  * create a copy of the TreeNode
  *
  *   @returns an identical copy of the TreeNode 
  */
	copy(): TreeNode {
		return new TreeNode(
			this.value,
			this.char,
			this.left?.copy(),
			this.right?.copy()
		);
	}

  /**
  * Detect wheter or not the TreeNode has already been computed
  *
  *   @returns wheter or not the TreeNode was computed
  */
	isCalculated():boolean {
		return this.result !== undefined;
	}

  /**
  * calculate the TreeNode values
  *
  *   @param input - an array of input bits
  *   @param profile - the expression's profile
  *
  */
	calculate(input: boolean[], profile: string): boolean {
		if (this.left instanceof TreeNode) {
			if (!(this.left?.isCalculated()))
				this.left?.calculate(input, profile);
		}

		if (this.right instanceof TreeNode) {
			if (!(this.right?.isCalculated()))
				this.right?.calculate(input, profile);
		}

		if (
			(this.left instanceof Token || this.left?.isCalculated()) &&
			(this.right instanceof Token || this.right?.isCalculated())
		) {
			this.result = 
				Tokenizer.OPERATORS[this.value.literal].op( // TODO: Clean this shit up
					(this.left instanceof Token) ?
						((this.left.type !== 'constant') ?
							 input[profile.indexOf(this.left?.literal)] :
							!!+this.left.literal): 
						this.left?.result || false,

					(this.right instanceof Token) ?
						((this.right.type !== 'constant') ?
							input[profile.indexOf(this.right?.literal)] :
							!!+this.right.literal):
						this.right?.result || false
				);
		}
		return this.result || false;
	}

  /**
  * sets the arguments of a function into the scope
  *
  *   @param args - The tokens stored in an object
  *   @param profile - The profile of the function
  */
	setScope(args: Map<Token|TreeNode>, profile:string) {

    // If is TreeNode, recurse
		if (this.left instanceof TreeNode) this.left?.setScope(args, profile);
		else {
      // Replace left side with given argument token
			this.left = args[this.left?.literal || '.']
		}


    // If is TreeNode, recurse
		if (this.right instanceof TreeNode) this.right?.setScope(args, profile);
		else {
      // Replace right side with given argument token
			this.right = args[this.right?.literal || '.']
		}
	}
} 

