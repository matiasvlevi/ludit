import Tokenizer from '../Tokenizer'
import Token from '../Token'

export default class TreeNode {
	value: Token;
	left: TreeNode | Token | undefined;
	right: TreeNode | Token | undefined;
	type: string;
	priority: number;
	result: boolean | undefined;

	constructor(
		value: Token,
		left?: TreeNode | Token | undefined,
		right?: TreeNode | Token | undefined
	) {
		this.type = 'variable';
		this.priority = -1;
		this.value = value;
		this.left = left;
		this.right = right;
		this.result = undefined;
	}

	copy(): TreeNode {
		return new TreeNode(
			this.value,
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
				Tokenizer.OPERATORS[this.value.literal].op(
				(this.left instanceof Token) ?
					input[profile.indexOf(this.left?.literal)] : 
					this.left?.result || false,

				(this.right instanceof Token) ?
					input[profile.indexOf(this.right?.literal)] :
					this.right?.result || false
			);
		}
		return this.result || false;
	}
} 

