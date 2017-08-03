"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meow = require("meow");
const foo = require("./index");
const cli = meow(`
    Usage
      $ foo <input>

    Options
      -r, --rainbow  Include a rainbow

    Examples
      $ foo unicorns --rainbow
      🌈 unicorns 🌈
`, {
    alias: {
        r: 'rainbow'
    }
});
/*
{
    input: ['unicorns'],
    flags: {rainbow: true},
    ...
}
*/
foo.doUpload(cli.input[0], cli.flags);
//# sourceMappingURL=cli.js.map