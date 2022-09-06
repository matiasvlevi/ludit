"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Core_1 = require("../src/ludit/Core");
describe('test', () => {
    it('test 1', () => {
        let x, y;
        x = 10;
        y = 5;
        let n = new Core_1.Tokenizer();
        console.log(n);
        chai_1.assert.equal(x + y, 15);
    });
});
//# sourceMappingURL=index.js.map