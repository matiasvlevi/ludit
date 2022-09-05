import { ErrorHandler, error } from './ErrorHandler'
import { Map } from './types'

import Token from './Token'
import TreeNode from './TreeNode'

type HeapSlot = {
	tree: TreeNode | undefined,
	profile: string | undefined
};

export default class Heap {

	data: Map<HeapSlot>
	error: error | undefined;
	errorCall: (((e:error) => void)|undefined);

	constructor() {
		this.data = {};
		this.error = undefined;
		this.errorCall = undefined;
	}

	static emptyTree = new TreeNode(new Token('','',-1,-1), -1);

	hasError() {
		return this.error !== undefined
	}

	initSlot(key: string) {
		if (!this.data[key]) this.data[key] = { tree: undefined, profile: undefined};
	}

	setProfile(key:string, profile:string) {
		this.initSlot(key);
		this.data[key].profile = profile;
	}

	setTree(key:string, tree: TreeNode) {
		this.initSlot(key);
		this.data[key].tree = tree;
	}

	setValue(key: string, content: TreeNode, profile: string) {
		this.data[key] = {
			tree: content,
			profile: profile
		};
	}

	getProfile(key: string, e:error = {line:0, char:-1, text:''}): string {
		if (this.data[key] === undefined) {
			// Handle not defined
			ErrorHandler.functionNotDef(this, e);
		} else {
			return this.data[key].profile || '';
		}
		return '';
	}

	getTree(key: string, e: error= {line:0, char:-1, text:''}): TreeNode {
		if (this.data[key] === undefined) {
			// Handle not defined
			ErrorHandler.functionNotDef(this, e);
		} else {
			return this.data[key].tree || Heap.emptyTree;
		}
		return Heap.emptyTree;
	}
} 
