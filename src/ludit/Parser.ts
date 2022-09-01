import TreeNode from './TreeNode'
import Token from './Token'

export default class Parser {
	constructor() {};

	static getPriorityOperator(tokens: any[]) { // Specify token array type
		let highest: number = 0;
		let highestIndex = -1;

		// Find highest priority operator
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type === 'operator') {
				if (tokens[i].priority > highest)  {
					highest = tokens[i].priority;
					highestIndex = i;
				}
			}
		}

		return highestIndex;
	}

	static makeTree(tokens: any[]): TreeNode {
	
		// Get index of the operator to parse
		let highest = Parser.getPriorityOperator(tokens);

		// If variable is alone in operation (ex: "A"), multiply with itself
		// to output the value. This is kinda hackish
		if (highest === -1) return new TreeNode(
			new Token('*', 'operator', 1),
			new Token(tokens[0].literal, 'variable', -1),
			new Token(tokens[0].literal, 'variable', -1)
		);

		// Initialise iteration node
		let node = new TreeNode(tokens[highest]);

		let j: number; // parameter look ahead index
		
		// Look for parameter A (left)
		let left;
		let leftIndex = -1;
		if (node.left === undefined) { 
			
			j = highest; 
			do { j-- } while (tokens[j].type !== 'variable');

			left = tokens[j];
			leftIndex = j;
		}

		// Look for parameter B (right)
		let right;
		let rightIndex = -1;
		if (node.right === undefined) {
			j = highest;

			do { j++ } while (tokens[j].type !== 'variable') 
			
			right = tokens[j];
			rightIndex = j;
		}

		// Set each branch
		node.left = left;
		node.right = right;

		// Remove used tokens and replace them with the 
		// Calculation token
		tokens.splice(leftIndex, 1);
		tokens.splice(rightIndex-1, 1);
		tokens.splice(highest-1, 1, node);

		// If only token left is Calculation,
		// return the root node
		if (tokens.length <=1) {
			return node;
		} else {
			// continue recursively
			return Parser.makeTree(tokens);
		}
	}
};
