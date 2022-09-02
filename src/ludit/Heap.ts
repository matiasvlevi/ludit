import { ErrorHandler, error } from './ErrorHandler'
import { Map } from './types'
import TreeNode from './TreeNode'

type HeapSlot = {
	tree: TreeNode | undefined,
	profile: string | undefined
};

export default class Heap {

	data: Map<HeapSlot>

	constructor() {
		this.data = {};
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

	getProfile(key: string, e:error = {line:0, char:-1, text:''}): string | undefined {
		if (this.data[key] === undefined) {
			// Handle not defined
			ErrorHandler.functionNotDef(e);
		}
		return this.data[key].profile
	}

	getTree(key: string, e: error= {line:0, char:-1, text:''}): TreeNode | undefined {
		if (this.data[key] === undefined) {
			// Handle not defined
			ErrorHandler.functionNotDef(e);
		}
		return this.data[key].tree;
	}
} 
