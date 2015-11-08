var fs = require('fs'),
    execSync = require('child_process').execSync,
    stripJsonComments = require('strip-json-comments'),
    path = require('path'),
    packageJsonPath = path.join(__dirname, '..', 'package.json'),
    chalk = require('chalk'),

    curBranch, curVersion, masterVersion;


curBranch = getCurrentBranch(execSync('git branch'));
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
execSync('git pull origin master:' + getCurrentBranch(execSync('git branch')) + ' -f');

masterVersion = JSON.parse(stripJsonComments(fs.readFileSync(packageJsonPath, 'utf-8'))).version;


console.log(chalk.blue('本地: %s' + chalk.blue(' 分支版本号为: ') + chalk.underline.bgMagenta('%s')), chalk.green(curBranch), curVersion);
console.log(chalk.blue('远程: %s' + chalk.blue(' 分支版本号为: ') + chalk.underline.bgMagenta('%s')), chalk.green('master'), masterVersion);

if (curVersion === masterVersion) {
    console.log(chalk.red('警告:您当前本地 ' + chalk.green('%s') + ' 分支版本号与远程 ' + chalk.green('master') + ' 分支版本号一致,请记得在发布前更改版本号!'), curBranch);
}

execSync('git checkout ' + curBranch + ' -f');

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