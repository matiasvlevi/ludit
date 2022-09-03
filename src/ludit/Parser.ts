import util from 'util'
import { ErrorHandler, error } from './ErrorHandler'

// Ludi core
import Heap from './Heap'
import Tokenizer from './Tokenizer'
import TreeNode from './TreeNode'
import Token from './Token'

import { Map } from './types'

export default class Parser {
	constructor() {};

	static getPriorityOperator(tokens: any[]) { // Specify token array type
		let highest: number = 0;
		let highestIndex = -1;

		// Find highest priority operator
		for (let i = 0; i < tokens.length; i++) {
			if (
				tokens[i].type === 'operator' ||
			    tokens[i].type === 'functionCall'
			) {
				if (tokens[i].priority > highest)  {
					highest = tokens[i].priority;
					highestIndex = i;
				}
			}
		}

		return highestIndex;
	}

	static setFunctionScope(
		_tree: TreeNode,
		args: Map<string>,
		profile: string
	) {
		let tree = _tree.copy();
		tree.setScope(args, profile);
		return tree;
	}

	static getArgs(tokens: any[],profile: string, j:number) {
		let args:Map<string> = { '.': '0' };
		let i = j;
		let k = 0;
		while(tokens[i].type !== 'argClose') {
			if (
				tokens[i].type === 'argument' ||
				tokens[i].type === 'constant'
			) {
				args[profile[k]] = (tokens[i].literal);
				k++;
			}
			i++;
		}	
		return args;
	}

	static makeTree(
		heap: Heap,
		tokens: any[],
		profile:string,
		e:error
	): TreeNode {
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
		
		if (tokens[highest].type === 'functionCall') {
			if (
				tokens[highest+1] !== undefined &&
				tokens[highest+1].type === 'argOpen'
			) {
			
				let rawTree = heap.getTree(tokens[highest].literal);
				if (rawTree === undefined) {
					// Function not def
				} else {
					let expectedArgs:string = heap.getProfile(tokens[highest].literal) || profile;
					let tree = Parser.setFunctionScope(
						rawTree,
						Parser.getArgs(tokens, expectedArgs, highest),
						expectedArgs
					)
					let argCount = 0;
					let j = highest+1;
					while (
						j < tokens.length && 
						(tokens[j].type === 'argument' ||
						tokens[j].type === 'constant' ||
						tokens[j].type === 'argOpen' ||
						tokens[j].type === 'argClose')
					) {
						if (
							tokens[j].type === 'argument' ||
							tokens[j].type === 'constant'
						) { 
							argCount++
							e.char = tokens[j].char;
						};


						tokens.splice(j, 1);
					}
					if (argCount !== expectedArgs.length) {
						ErrorHandler.badArgumentSpecification(
							argCount,
							expectedArgs.length,
							e
						);
					} 
	
					tokens.splice(highest, 1, tree);
					return Parser.makeTree(heap, tokens, profile, e);
				}
			}
		}

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
				tokens[j].type !== 'constant' &&
				tokens[j].type !== 'functionCall'
			);

			if (tokens[j].type === 'functionCall') {
				// Integral function call
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
				tokens[j].type !== 'constant' &&
				tokens[j].type !== 'functionCall'
			) 

			if (tokens[j].type === 'functionCall') {
				// Integral function call
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

		//console.log(util.inspect(node, false, null, true));

		// If only token left is Calculation,
		// return the root node
		if (tokens.length <=1) {
			return node;
		} else {
			// continue recursively
			return Parser.makeTree(heap, tokens, profile, e);
		}
	}
};
