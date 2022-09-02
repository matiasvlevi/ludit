import { ErrorHandler, error } from './ErrorHandler'

// Ludi core
import Heap from './Heap'
import Tokenizer from './Tokenizer'
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

	static makeTree(heap: Heap, tokens: any[], e:error): TreeNode {
	
		// Get index of the operator to parse
		let highest = Parser.getPriorityOperator(tokens);

		// If variable is alone in operation (ex: "A" or a declared value ex: "xor"),
		// add the value with 0 to emulate it being alone 
		if (highest === -1) {	
			if (tokens[0]) {
				if (tokens[0].type === 'functionCall') {
					return new TreeNode(
						new Token('+', 'operator', 1, 0),
						0,
						new Token('0', 'constant', -1, 0),
						heap.getTree(tokens[0].literal)
					);
				} else if (tokens[0].type === 'variable') {
					return new TreeNode(
						new Token('+', 'operator', 1, 0),
						0,
						new Token('0', 'constant', -1, 0),
						tokens[0]
					);
				}
			} else {
				// Handle empty line
			}	
		}
		
		// Initialise iteration node
		if (tokens[highest] === undefined) {

			if (tokens[tokens.length-1] !== undefined)
				e.char = tokens[tokens.length-1].char;
			
			ErrorHandler.assignmentError(e);
		}
				

		let node = new TreeNode(tokens[highest], tokens[highest].char);
		if (Tokenizer.isAssign(tokens[highest].literal)) {
			let j = highest-1;
			while(tokens[j].type !== 'functionName') j++;
			let functionName = tokens[j].literal;

			j = highest+1;
			while(tokens[j].type !== 'variable') j++;
			let functionDef = tokens[j];

			// TODO: Assignement error handling
			//
			//

			heap.setTree(functionName, functionDef);	

			return functionDef;
		}

		let j: number; // parameter look ahead index
		
		// Look for parameter A (left)
		let left;
		let leftIndex = -1;
		if (node.left === undefined) { 
				
			j = highest; 
			do { 
				j--
				if (j < 0) {
					e.char = tokens[highest].char;
					ErrorHandler.missingVariable(
						'Missing operator value',
						e
					);
				}
			} while (
				tokens[j].type !== 'variable' &&
				tokens[j].type !== 'functionCall'
			);

			if (tokens[j].type === 'functionCall') {
				left = heap.getTree(tokens[j].literal);
			} else {
				left = tokens[j];
			}
			leftIndex = j;
		}

		// Look for parameter B (right)
		let right;
		let rightIndex = -1;
		if (node.right === undefined) {
			j = highest;

			do { 
				j++
				if (j >= tokens.length) {
					e.char = tokens[tokens.length-1].char;
					ErrorHandler.missingVariable(
						'Missing operator value',
						e
					);
				}
			} while (
				tokens[j].type !== 'variable' && 
				tokens[j].type !== 'functionCall'
			) 

			if (tokens[j].type === 'functionCall') {
				right = heap.getTree(tokens[j].literal);
			} else {
				right = tokens[j];
			}
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
			return Parser.makeTree(heap, tokens, e);
		}
	}
};
