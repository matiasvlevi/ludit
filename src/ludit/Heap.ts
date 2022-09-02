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

	getProfile(key: string): string | undefined {
		return this.data[key].profile
	}

	getTree(key: string): TreeNode | undefined {
		return this.data[key].tree;
	}
} 
