var Task = require('../lib/shell-task.js'),
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    stripJsonComments = require('strip-json-comments'),
    exec = require('child_process').exec,
    execSync = require('child_process').execSync,
    newDirExists = false,
    isMyGitRepository = false,
    newDirName = 'package',
    pullFileName = 'package.json',
    tasks = ['git init ',
        'cd ',
        'git remote rm origin',
        'git remote add origin ',
        'git config core.sparsecheckout true',
        'echo "' + pullFileName + '" >> .git/info/sparse-checkout',
        'git pull --depth=2 origin master'
    ],
    gitUrlIndex = tasks.indexOf('git remote add origin ');

var newDirPath = path.join(__dirname, newDirName),
    newGitPullFilePath = path.join(__dirname, newDirName, pullFileName),
    packageJsonPath = path.join(__dirname, pullFileName);

if (fs.existsSync(newDirPath)) {
    if (checkIsGitRepository(newDirPath)) {
        // 判断是否是我们自己拉的仓库
        if (fs.existsSync(newGitPullFilePath)) {
            newDirExists = true;
            if (fs.readFileSync(newGitPullFilePath, 'utf-8').indexOf('package.json from master') > -1) {
                isMyGitRepository = true;
            }
        } else {
            newDirExists = false;
            newDirName = newDirName + '-1';
        }
    }
}

if (newDirExists && !isMyGitRepository) {
    newDirPath = path.join(__dirname, newDirName);
    newGitPullFilePath = path.join(__dirname, newDirName, pullFileName);
}

tasks[0] += newDirName;
tasks[1] += newDirName;

if (isMyGitRepository) {
    new Task(tasks[tasks.length - 1]).run(function(err, next) {
        if (err) {
            console.log('task exec error:', err);
        }

        if (next) {
            next();
        }
    }, taskEndsCallback);
} else {
    exec('git config --list', {
        cwd: __dirname
    }, function(err, data) {
        var ary = data.split(/\n/),
            gitUrl = '',
            tasksLen = tasks.length - 1,
            curTask = 0,
            subAry, taskIns;

        ary.forEach(function(item) {
            subAry = item.trim().split('=');

            if (subAry[0] === 'remote.origin.url') {
                gitUrl = subAry[1];
                return false;
            }
        });

        tasks[gitUrlIndex] += gitUrl;

        taskIns = new Task(tasks[0]);

        while (curTask++ < tasksLen) {
            taskIns = taskIns.exec(tasks[curTask]);
        }

        taskIns.run(function(err, next) {
            if (err) {
                console.log('task exec error:', err);
            }

            if (next) {
                next();
            }
        }, taskEndsCallback);
    });
}

function taskEndsCallback() {
    // 命令行执行结束
    var masterVersion, branchVersion, newPullPackagefileContent, packageFileContent;

    if (fs.existsSync(newGitPullFilePath)) {
        newPullPackagefileContent = fs.readFileSync(newGitPullFilePath, 'utf-8');
        packageFileContent = fs.readFileSync(packageJsonPath, 'utf-8');

        // 标识为我们自己的仓库文件
        fs.writeFileSync(newGitPullFilePath, '// package.json from master \n' + newPullPackagefileContent);

        masterVersion = JSON.parse(stripJsonComments(newPullPackagefileContent)).version.trim();
        branchVersion = JSON.parse(stripJsonComments(packageFileContent)).version.trim();

        if (branchVersion === masterVersion) {
            console.warn(chalk.blue('您当前分支与master分支版本号相同,发布前请注意修改版本号!'));
        }
    } else {
        console.error(chalk.red('注意:clone remote master分支代码失败, 无法对当前分支与remote master分支版本号作对比!'));
    }
}

// 检测是否是git仓库
function checkIsGitRepository(newDirPath) {
    var repositoryPath, subRepositoryPath;

    repositoryPath = execSync('git rev-parse --git-dir', {
        cwd: __dirname
    });

    // 不存在会取本项目的.git仓库路径
    subRepositoryPath = execSync('git rev-parse --git-dir', {
        cwd: newDirPath
    });

    if (repositoryPath && subRepositoryPath) {
        repositoryPath = repositoryPath.toString();
        subRepositoryPath = subRepositoryPath.toString();

        repositoryPath = path.join(__dirname, repositoryPath);

        if (subRepositoryPath === repositoryPath) {
            return false;
        } else {
            return true;
        }
    }

    return false;
}