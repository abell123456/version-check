/*
 * @Author: xiangzhong.wxz
 * @Date:   2015-12-21
 * @info:   版本检查执行代码
 */

"use strict";

var semver = require('semver'),
    execSync = require('child_process').execSync,
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs'),
    util = require('../lib/util'),

    projectPath = '',
    errorCode = 0,

    resolveObj = {
        result: true
    },

    logSymbols = require('log-symbols'),
    table = require('text-table'),

    curBranch, curVersion, masterVersion;

module.exports = function() {
    projectPath = projectPath;

    // 先更新下最新数据
    execSync('git fetch -p');

    // 执行版本更新检查
    util.latest(function(err) {
        if (err) error(err);
        process.exit(errorCode);
    });

    curBranch = getCurrentBranch(execSync('git branch'));

    try {
        curVersion = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8')).version;
    } catch (e) {
        curVersion = 0;
    }

    // 获取master分支版本号
    try {
        masterVersion = (JSON.parse(execSync('git show remotes/origin/master:package.json').toString()) || {}).version;
    } catch (e) {
        masterVersion = 0;
    }

    if (!curVersion) {
        console.log(logSymbols.error + chalk.red(' 您当前还没有在package.json文件中定义版本号!'));
    } else if (!masterVersion) {
        console.log(logSymbols.error + chalk.red(' 远程master分支版本号获取失败!'));
    } else {
        // console.log(logSymbols.info + chalk.blue(' 本地: %s' + chalk.blue(' 分支版本号为: ') + chalk.bold.red('%s')), chalk.green(curBranch), curVersion);
        // console.log(logSymbols.info + chalk.blue(' 远程: %s' + chalk.blue(' 分支版本号为: ') + chalk.bold.red('%s')), chalk.green('origin/master'), masterVersion);

        console.log(table([
            [chalk.gray('> 本地版本:'), chalk.bold.red(curVersion), chalk.gray(' 分支:'), chalk.green(curBranch)],
            [chalk.gray('> 远程版本:'), chalk.bold.red(masterVersion), chalk.gray(' 分支:'), chalk.green('origin/master')]
        ]));

        console.log();

        if (semver.eq(curVersion, masterVersion)) {
            console.log(logSymbols.warning + chalk.red(' 警告:您当前本地 ' + chalk.green('%s') + ' 分支版本号与远程 ' + chalk.green('origin/master') + ' 分支版本号一致，如有必要，发布前请记得更改版本号!'), curBranch);
        } else if (semver.lt(curVersion, masterVersion)) {
            console.log(logSymbols.warning + chalk.red(' 警告:您当前本地 ' + chalk.green('%s') + ' 分支版本号小于远程 ' + chalk.green('origin/master') + ' 分支版本号，如有必要，发布前请记得更改版本号!'), curBranch);
        }
    }

    return resolveObj;
};


function getCurrentBranch(verBuffer) {
    var ary = verBuffer.toString().split('\n'),
        result = '';

    ary.forEach(function(item) {
        if (item.substring(0, 1) === '*') {
            result = item.slice(1);
            return false;
        }
    });

    return result.replace(/\(|\)|detached|from|\s+/g, '').trim();
}
