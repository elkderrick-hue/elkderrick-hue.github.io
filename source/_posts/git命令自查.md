---
title: 我的 Git 命令速查：从搭 Hexo 博客到日常发布（含这次踩坑用到的全部命令）
date: 2026-02-02 00:20:00
tags:
  - Git
  - GitHub
  - Hexo
  - GitHub Pages
  - GitHub Actions
  - 速查
categories:
  - 技术
---

## 写在前面

这篇是我在搭建 **Hexo + GitHub Pages + GitHub Actions** 博客的过程中，真实用到的 Git 命令整理。

目标不是“讲完 Git 全部”，而是：

- **这次搭站过程中用到的命令**：为什么用、怎么用、什么时候用  
- **后面写博客发布最常用的命令**：一套固定流程  
- 常见报错（push 被拒、rebase 未提交、网络 443、SSH 权限）对应怎么处理

---

## 0. Git 的三个核心区（理解命令很重要）

Git 管理文件时有三个地方：

- **工作区（Working tree）**：你电脑里的真实文件夹（你改文件就是改这里）
- **暂存区（Staging / Index）**：准备提交的“待提交清单”
- **提交历史（Commit history）**：一次一次提交（快照）的记录

发布到 GitHub = 把本地 commit **push** 到远程仓库。

---

## 1. 这次最常用的“发布四连”

每次写/改/删文章或改主题配置，基本都是这套：

### 1.1 看状态：git status
看看当前有哪些修改、哪些已经暂存、哪些还没被 Git 跟踪。

~~~bash
git status
~~~

### 1.2 加到暂存区：git add .
把修改加入暂存区。

~~~bash
git add .
~~~

更保险的写法（包含“删除文件”的变更）：

~~~bash
git add -A
~~~

### 1.3 生成一次提交：git commit -m "..."
把暂存区内容打包成一次提交（快照）。

~~~bash
git commit -m "add first post"
~~~

### 1.4 推送到 GitHub：git push
把本地 commit 上传到 GitHub，触发 Actions 自动部署。

~~~bash
git push
~~~

---

## 2. 初始化仓库 + 第一次推送（这次也用到了）

### 2.1 初始化与首次提交
~~~bash
git init
git add .
git commit -m "init blog"
~~~

### 2.2 设定分支名为 main：git branch -M main
把当前分支强制命名为 `main`（与 GitHub 默认一致）。

~~~bash
git branch -M main
~~~

### 2.3 添加远程仓库：git remote add origin ...
~~~bash
git remote add origin https://github.com/<username>/<repo>.git
~~~

查看远程是否设置正确：

~~~bash
git remote -v
~~~

### 2.4 第一次 push 并设置上游：git push -u origin main
第一次推送常用这个，`-u` 表示记住远程上游分支，以后直接 `git push` 即可。

~~~bash
git push -u origin main
~~~

---

## 3. push 被拒绝（fetch first）：远程比我新怎么办？

这次遇到过类似：

~~~text
! [rejected] main -> main (fetch first)
hint: Updates were rejected because the remote contains work that you do not have locally.
~~~

含义：远程 `main` 上有你本地没有的提交（比如网页端生成 README），所以 Git 不允许你直接覆盖。

### 3.1 推荐解法：git pull --rebase
把远程更新拉下来，并用 rebase 方式整理提交，历史更干净。

~~~bash
git pull --rebase origin main
git push
~~~

### 3.2 如果 rebase 提示“有未提交改动”
会出现：

~~~text
error: cannot pull with rebase: Your index contains uncommitted changes.
error: Please commit or stash them.
~~~

正确做法：先 stash 暂存，再 rebase pull，最后 pop 回来。

~~~bash
git stash
git pull --rebase origin main
git stash pop
~~~

---

## 4. 强推：force-with-lease（这次也用过，但要谨慎）

当你确定“我要用本地覆盖远程”（比如远程只有 README），可以用：

~~~bash
git push --force-with-lease
~~~

它比 `--force` 更安全：远程被别人更新了会拒绝你覆盖。

如果提示 stale info，一般先 fetch 再推：

~~~bash
git fetch origin
git push --force-with-lease
~~~

> 说明：强推有风险，适合你完全确认“远程没重要内容”时使用。

---

## 5. 只下载不合并：git fetch（排查时很有用）

### 5.1 查看远程信息：git remote -v
~~~bash
git remote -v
~~~

### 5.2 只拉取远程信息：git fetch origin
~~~bash
git fetch origin
~~~

### 5.3 看提交历史（简单但好用）
~~~bash
git log --oneline --decorate --graph --max-count=20
~~~

---

## 6. HTTPS 443 网络问题 & 走 SSH（这次的关键）

这次遇到过：

~~~text
Failed to connect to github.com port 443: Could not connect to server
~~~

HTTPS 443 走不通时，**SSH 推送更稳**。

### 6.1 测试 SSH 是否通：ssh -T git@github.com
~~~bash
ssh -T git@github.com
~~~

### 6.2 把远程从 HTTPS 改成 SSH：git remote set-url
~~~bash
git remote set-url origin git@github.com:<username>/<repo>.git
~~~

### 6.3 这次踩的坑：SSH 认证到“另一个账号”
我这次 `ssh -T` 显示的是另一个账号（例如 `Hi 1239662773!`），然后 push 报：

~~~text
ERROR: Permission to <owner>/<repo>.git denied to 1239662773.
fatal: Could not read from remote repository.
~~~

解决思路：为正确账号准备专用 key，并用 `~/.ssh/config` 指定该仓库用哪把 key。

#### 6.3.1 SSH config（示例）
~~~text
Host github-elk
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_elk
  IdentitiesOnly yes
~~~

然后把 origin 改成这个别名：

~~~bash
git remote set-url origin git@github-elk:<owner>/<repo>.git
~~~

验证：

~~~bash
ssh -T git@github-elk
~~~

最后 push：

~~~bash
git push
~~~

---

## 7. 写博客的固定工作流（我现在就按这个来）

### 7.1 新建文章（Hexo）
~~~bash
hexo new post "标题"
~~~

### 7.2 本地预览
~~~bash
hexo clean
hexo s
~~~

### 7.3 发布上线（Git）
~~~bash
git add -A
git commit -m "add post: 标题"
git push
~~~

---

## 8. 高频补充命令（后面很常用）

### 8.1 查看改了什么：git diff
~~~bash
git diff
~~~

看“暂存区”与上次提交的差异：

~~~bash
git diff --staged
~~~

### 8.2 撤销工作区修改（小心！）：git restore
撤销某文件的未提交修改：

~~~bash
git restore path/to/file
~~~

### 8.3 撤销 add（把暂存区退回工作区）：git restore --staged
~~~bash
git restore --staged path/to/file
~~~

### 8.4 删除文件并记录：git rm
删除文章（让 Git 记录删除）：

~~~bash
git rm source/_posts/xxx.md
git commit -m "remove post: xxx"
git push
~~~

---

## 结语

对我来说，Git 真正有用的不是背命令，而是掌握两件事：

1. **写/改/删 → add → commit → push** 的固定流程  
2. 出问题时快速判断：是 **本地状态问题**（未提交、rebase），还是 **远程同步问题**（fetch first），还是 **网络/权限问题**（443、SSH 账号不匹配）

希望这篇能作为我的 Git 速查备忘，也能帮到正在搭博客的你。
