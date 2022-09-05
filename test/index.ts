import { assert } from 'chai'

import { Tokenizer } from '../src/ludit/Core'

describe('test', () => {

    it('test 1', () => {
        let x:number ,y: number;
        x = 10;
        y = 5;
        let n = new Tokenizer();
        console.log(n);
        assert.equal(x + y, 15);
    })

})

