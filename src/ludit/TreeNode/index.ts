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

	copy(): TreeNode {
		return new TreeNode(
			this.value,
			this.char,
			this.left?.copy(),
			this.right?.copy()
		);
	}

	isCalculated() {
		return this.result !== undefined;
	}

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

	setScope(args: Map<string>, profile:string) {
		this.left?.setScope(args, profile);
		this.right?.setScope(args, profile);
	}
} 

