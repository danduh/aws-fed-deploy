import * as util from 'util';
import * as chalk from 'chalk';

let params = {EnvironmentName: 'define'};

class Logger {

    static log(msg) {
        console.log(util.format('[%s] %s', chalk.green('[' + params.EnvironmentName + ']'), msg));
    };

    static error(msg: string, err: any = null) {
        console.log(util.format('[%s] %s', chalk.red('[' + params.EnvironmentName + ']'), msg, err));
    };
}

export default Logger;