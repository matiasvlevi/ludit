import UnitTester from './unit'
const Unit = new UnitTester();

import {
	Heap,
	Tokenizer,
	Parser,
	Profiler,
	Processor
} from '../ludit'


Unit.test('Verifiy tokens of A * B + C', () => {

	const { tokens } = Tokenizer.process(
		new Heap(),
		"A * B + C",
		{line:0,char:0,text:''}
	);

	let tok:any[] = [...tokens]; 

	return (
		tok.length === 5 &&
		tok[0].literal === 'A' &&
		tok[1].literal === '*' &&
		tok[2].literal === 'B' &&
		tok[3].literal === '+' &&
		tok[4].literal === 'C'
	); 

})


Unit.test('Verifiy tokens of A * (B + C)', () => {

	const { tokens } = Tokenizer.process(
		new Heap(),
		"A * (B + C)",
		{line:0,char:0,text:''}
	);
	let tok:any[] = [...tokens]; 

	return (
		tok.length === 5 &&
		tok[0].literal === 'A' &&
		tok[1].literal === '*' &&
		tok[2].literal === 'B' &&
		tok[3].literal === '+' &&
		tok[4].literal === 'C'
	); 
})


Unit.end();
