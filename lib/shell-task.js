'use strict';

var spawn = require('child_process').spawn;

class Task {

    constructor(cmd, opts) {
        this.opts = opts || {
            stdio: 'inherit'
        };

        this.noInterrupt = true;
        this.queue = [];

        this.exec(cmd);
    }

    exec(cmd) {
        if (typeof cmd === 'string') {
            cmd = splitCmd(cmd);
        }

        this.queue[this.queue.length] = cmd;

        return this;
    }

    sleep(time) {
        time = +time || 0;

        this.queue[this.queue.length] = function(callback) {
            setTimeout(callback, time);
        };

        return this;
    }

    run(cb, endCallback) {
        this.cb = cb || defaultCb;
        this.endCallback = endCallback || function() {};

        realRun(this);
    }
}

function realRun(task) {
    var step = task.queue.shift(),
        child;

    if (typeof step === 'function') {
        try {
            step(next);
        } catch (e) {
            handle(e);
        }
    } else {
        child = spawn(step.cmd, step.args, task.opts);
        child.once('error', handle);
        child.once('exit', next);
    }

    function next(code) {
        if (typeof code === 'number' && code !== 0) {
            handle(new Error('process exited with unexpected code: ' + code));
        } else {
            if (task.queue.length) {
                realRun(task);
            } else {
                task.endCallback();
            }
        }
    }

    function handle(err) {
        if (err) {
            cmdErrorInfo(err, step.cmd);

            // 报错时,将是否继续执行下去的权利交给调用者
            task.cb(err, next);
        }
    }
}

function splitCmd(cmd) {
    var splits = cmd.match(/(?:"[^"]*"|'[^']*'|[^\s"']+)+/g);

    return {
        cmd: splits[0],
        args: splits.slice(1).map(processArg),
        raw: cmd
    };
}

function processArg(str) {
    str = str.trim();
    var a = str.charCodeAt(0);
    var b = str.charCodeAt(str.length - 1);
    return a === b && (a === 0x22 || a === 0x27) // 判断开头是单引号或者双引号,写成(a === 34 || a === 39)也可
        ? str.slice(1, -1) : str;
}

function defaultCb(err) {
    if (err) {
        log('Task failed! Error info: "' + err.toString() + '"', 31);
    } else {
        log('Task completed.', 32);
    }
}

function cmdErrorInfo(err, cmd) {
    log('"' + cmd + '" task failed, error info: "' + err.toString() + '"', 31);
}

function log(str, colorCode) {
    console.log('\x1B[' + (colorCode || 36) + 'm> ' + str + '\x1B[39m');
}

module.exports = Task;