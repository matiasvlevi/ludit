import Frontend from '../Frontend'
import { Map } from '../ludit/types'
import TreeNode from '../ludit/TreeNode'

export type optionAction = (frontend:Frontend, param: string) => void;

export type optionConfig = {
	action: optionAction;
	requireParam: boolean;
	helpMsg?: string;
	errorMsg?: string;
}

export const queries: Map<optionConfig> = {
	csv: {
		action:(frontend:Frontend, param: string) => {
			frontend.save(param);
		},
		requireParam: false
	},
	select: {
		action:(frontend: Frontend, param: string) => {
				frontend.runSingle(param);			
		},
		requireParam: true
	}
};


