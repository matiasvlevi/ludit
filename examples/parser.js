import util from 'util'

// Core
import { 
	Tokenizer,
	Parser,
	Profiler,
	Processor
} from './ludit'

const inputOperation = process.argv[2] || "A*B";
const inputValues = process.argv[3].split('').map(x=>+x) || '11';

const tokens = Tokenizer.process(inputOperation);
const tree = Parser.makeTree(tokens);
const profile = Profiler.getOrder(tokens);
const output = Processor.calculate(
	tree,
	profile,
	inputValues
);

console.log(+output)
