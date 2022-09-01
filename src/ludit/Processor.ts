import TreeNode from './TreeNode'
import Tokenizer from './Tokenizer'

export default class Processor {
	constructor() {}

	static calculate(
		tree: TreeNode,
		profile: string,
		_input: number[]
	): boolean {
		// Convert number input to boolean input
		const input: boolean[] = _input.map(b => Boolean(b));

		return tree.copy().calculate(input, profile);
	}
};
