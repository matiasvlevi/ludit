import Frontend from '../Frontend'
import { Map } from '../ludit/types'
import TreeNode from '../ludit/TreeNode'

export type optionAction = (frontend:Frontend, param: string) => void;

export type optionConfig = {
	action: optionAction;
	requireParam: boolean;
	helpmsg?: string;
	example?: string;
	errormsg?: string;
}

export const queries: Map<optionConfig> = {
	help: {
		action:(frontend:Frontend, param:string) => {
			for (let key in queries) {
				
				console.log(`\n  \x1b[36m--${key}, -${key[0]}\x1b[0m`);
				if (queries[key].helpmsg !== undefined)
					console.log(`\t${queries[key].helpmsg}`);

				if (queries[key].example !== undefined) 
					console.log(`\t\x1b[90mex: ludit "A*B+C" ${queries[key].example}\x1b[0m`)

				console.log('');
			}
		},
		helpmsg: 'show this help menu',
		requireParam: false
	},
	csv: {
		action:(frontend:Frontend, param: string) => {
			frontend.save(param);
		},
		helpmsg: 'save the truth table as a .csv file',
		example: '--csv sheet.csv',
		requireParam: false
	},
	select: {
		action:(frontend: Frontend, param: string) => {
				frontend.runSingle(param);			
		},
		helpmsg: 'select a specific set of inputs to calculate',
		example: '--select 101',
		requireParam: true
	}
};


