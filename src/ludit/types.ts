
export type syntax = {
	type: string;
	priority: number;
}

export type operation = {
	type: string;
	priority: number;
	op: (a: boolean, b: boolean) => boolean;
}

export type Map<T> = {
	[key:string]: T
}
