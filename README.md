# version-check
检查当前分支版本号是否与远程master分支不一样

# 背景
当我们在用多版本进行开发的时候，我们在进行发布前需要更改我们的版本号，以使得我们的更改项目能够生效。但是，由于发布前需要做的事情太多，我们经常会忘记修改版本号。  
此项目的目的就是生成git push触发的pre-push钩子，在用git进行提交前，在客户端对当前分支（允许是master分支）与远程master分支的版本号作对比，如果相同则提醒开发者在发布前进行版本号修改。  
# 实现思路
刚开始，我采用了用git pull拉取远程master分支中package.json文件（git1.7版本以上支持拉取项目中部分文件[详细](http://stackoverflow.com/questions/600079/is-there-any-way-to-clone-a-git-repositorys-sub-directory-only)），然后读取其中的version字段内容并与本地当前分支版本号作对比的方式来实现。但是在最终实现后，始终需要输入远程git仓库的用户名和密码，要解决这个问题需要配置SSH秘钥。要让每个调用的开发者都去配置这个秘钥（即使配置了也可能在使用过程中总是遇到问题）是非常麻烦的。  
在一个安静的晚上，当我在浏览git常用命令的时候，我看到了我们最常用的切换分支的命令：git checkout master -f。于是，另一种思路灵光乍现。  
我们可以由当前分支切换回master分支，然后git pull一下远程master分支代码，读取version版本号值后再切换回目前分支，并与当前分支的版本号作对比，最终得出结论。  
第二天，我早早来到公司，迫不及待的对以上思路进行了实现，虽然中间遇到了些问题，但都很顺畅的一一解决，并最终产出万无一失的方案(src/pre-push-1.js)。  
# 用法
1、如果你要测试该项目，你要先运行index.js进行钩子安装。  
2、对代码随便做些更改（当然不改也没问题），然后git push提交你的代码，即可看到命令行里输出的结果。  
如果你看到类似如下的输出时说明你运行成功了：  
`➜ /Users/wangxiangzhong/test/version-check git:(develop)>git push -f`                    
`Switched to branch 'master'`  
`当前分支: develop 版本号为: 1.0.0`  
`master 分支版本号为: 1.0.0`  
`警告:您当前本地  develop 分支版本号与远程 master 分支版本号一致,请记得在发布前更改版本号!`  
`正在切回当前分支......`  
`Switched to branch 'develop'`  
`Everything up-to-date`

## 后记
后面我在浏览一篇关于git实用命令的时候，我突然发现了个更好的实现思路，那就是使用：`git show branch:file`命令，能直接读到某个分支的某个文件的内容。于是我们使用：`git show origin/master:package.json`命令就能读到远程master分支的package.json文件，从而获取到其版本号。  
这种实现简单方便，实为上上策！
