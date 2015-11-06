var fs = require('fs'),
    execSync = require('child_process').execSync,
    stripJsonComments = require('strip-json-comments'),
    path = require('path'),
    packageJsonPath = path.join(__dirname, '..', 'package.json'),
    chalk = require('chalk'),

    curBranch, curVersion, masterVersion;


curBranch = getCurrentVersion(execSync('git branch'));
curVersion = JSON.parse(stripJsonComments(fs.readFileSync(packageJsonPath, 'utf-8'))).version;

/**if (curBranch !== 'master') {
    execSync('git checkout origin/master -f');
    // execSync('git pull origin master:master -f');
} else {
    // master分支不做检查
    console.log(chalk.red('您当前处于master分支！'));
    process.exit(0);
}*/

execSync('git checkout origin/master -f');
execSync('git pull origin origin/master:origin/master -f');

masterVersion = JSON.parse(stripJsonComments(fs.readFileSync(packageJsonPath, 'utf-8'))).version;


console.log(chalk.blue('当前分支:') + chalk.red(curBranch) + chalk.blue(' 版本号为: ') + chalk.red(curVersion));
console.log(chalk.red('远程 master ') + chalk.blue('分支版本号为: ') + chalk.red(masterVersion));

if (curVersion === masterVersion) {
    console.log(chalk.red('警告:您当前本地 ' + curBranch + ' 分支版本号与远程 master 分支版本号一致,请记得在发布前更改版本号!'));
}

console.log(chalk.gray('正在切回当前分支......'));
execSync('git checkout ' + curBranch + ' -f');

function getCurrentVersion(verBuffer) {
    var ary = verBuffer.toString().split('\n'),
        result = '';

    ary.forEach(function(item) {
        if (item.substring(0, 1) === '*') {
            result = item.slice(1);
            return false;
        }
    });

    return result.trim();
}