import { Map } from './types'


export default class Profiler {
	constructor() {}

	static removeDoubles(text: string) {
		let ans = '';
		let obj:Map<boolean> = {};
		for (let i = 0; i < text.length; i++) {
			obj[text[i]] = true;
		}
		for (let key in obj) {
			ans += key;
		}
		return ans;
	}
	static getOrder(tokens: any[]): string {
		return Profiler.removeDoubles(tokens
			.filter(token => (token.type === 'variable'))
			.filter(token => (token.literal !== '.'))
			.map(token => token.literal)
			.sort()
			.join(''));
	}
}
