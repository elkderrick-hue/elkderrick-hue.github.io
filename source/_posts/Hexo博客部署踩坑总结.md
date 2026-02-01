---
title: Hexo + GitHub Pages + Butterfly 部署踩坑全记录
date: 2026-02-01 23:00:00
tags:
  - Hexo
  - GitHub Pages
  - Butterfly
  - GitHub Actions
  - 踩坑记录
categories:
  - 技术
---

## 前言

这是我第一次完整使用 **Hexo + GitHub Pages + Butterfly 主题** 搭建个人博客。

原本以为这是一个「半小时就能完成」的事情，结果在 **Git、子模块、GitHub Actions、权限、网络、空白页** 等问题上反复踩坑，用了一整晚才真正上线。

这篇文章不是教程，而是一份 **真实的踩坑复盘**，记录我遇到的问题、原因，以及最终有效的解决方案，希望能帮后来的人少走弯路。

---

## 一、技术选型

- 博客框架：Hexo  
- 主题：Butterfly  
- 托管平台：GitHub Pages  
- 部署方式：GitHub Actions 自动部署  
- 仓库类型：个人主页仓库（`username.github.io`）

选择这套方案的原因很简单：

- 不需要服务器
- 成本几乎为 0
- 自动化程度高
- 可长期维护和折腾

---

## 二、理想中的部署流程

理想情况下，流程应该是：

1. 本地初始化 Hexo
2. 安装 Butterfly 主题
3. 创建 `username.github.io` 仓库
4. 配置 `_config.yml`
5. 使用 GitHub Actions 自动构建并部署
6. 访问 `https://username.github.io/`

但现实是：  
**真正耗时间的不是配置，而是排错。**

---

## 三、踩坑记录

### 1️⃣ Butterfly 被 Git 当成嵌套仓库 / 子模块

**现象：**

~~~text
warning: adding embedded git repository: themes/butterfly
~~~

**原因：**
- Butterfly 是通过 `git clone` 安装的  
- `themes/butterfly` 目录中自带 `.git`  
- Git 自动把它识别为嵌套仓库（submodule）

**后果：**
- 本地可以正常运行  
- GitHub Actions 构建失败  
- Checkout 阶段直接报错

**解决方式：**

~~~bash
Remove-Item -Recurse -Force themes/butterfly/.git
~~~

---

### 2️⃣ GitHub Actions 报错：exit code 128（子模块相关）

**典型错误：**

~~~text
fatal: No url found for submodule path 'themes/butterfly' in .gitmodules
Error: The process '/usr/bin/git' failed with exit code 128
~~~

**根因：**
- 仓库中残留 submodule 记录  
- `.gitmodules` 文件缺失或不完整  
- Actions 在 Checkout 阶段尝试拉取子模块失败

**解决方案（推荐）：**
- 彻底移除 submodule  
- 重新把 Butterfly 作为普通文件夹加入仓库（不使用 submodule）

---

### 3️⃣ GitHub Pages 显示空白页

这是最迷惑、也最容易误判的问题。

**表现：**
- GitHub Actions 显示成功（绿勾）  
- 页面可以访问  
- 页面完全空白  
- 查看网页源代码也是空的

**关键结论：**

> 这不是样式问题，而是 **Pages 实际部署的内容是空的**。

**真正原因：**
- Actions 在 Checkout 阶段失败  
- 后续 build / deploy 没有生成有效的 `index.html`

当 submodule 问题修复后，空白页自然消失。

---

### 4️⃣ 无法推送 workflow（PAT 权限不足）

**报错信息：**

~~~text
refusing to allow a Personal Access Token to create or update workflow
`.github/workflows/pages.yml` without `workflow` scope
~~~

**原因：**
- 使用的 Personal Access Token 没有 `workflow` 权限  
- GitHub 出于安全原因禁止修改 `.github/workflows/*`

**解决方式：**
- 生成 Classic PAT  
- 勾选以下权限：`repo`、`workflow`  
- 清除本地凭据缓存后重新 push

---

### 5️⃣ Git pull / push 失败（网络问题）

**常见报错：**

~~~text
Failed to connect to github.com port 443: Could not connect to server
~~~

**本质原因：**
- 网络环境不稳定（国内常见）  
- HTTPS 443 连接失败

**解决方案：**
- 临时更换网络 / 热点  
- 或使用 SSH（长期推荐）

---

### 6️⃣ rebase 被拒绝（存在未提交改动）

**错误提示：**

~~~text
cannot pull with rebase: Your index contains uncommitted changes.
Please commit or stash them.
~~~

**正确做法：**

~~~bash
git stash
git pull --rebase
git stash pop
~~~

这是 Git 的正常保护机制，不是错误。

---

## 四、最终稳定方案总结

最终采用的稳定组合是：

- 使用个人主页仓库：`username.github.io`
- `_config.yml` 配置如下：

~~~yml
url: https://username.github.io/
root: /
~~~

- Butterfly 主题不使用 submodule  
- 使用 GitHub Actions 自动部署  
- 使用 SSH 或带 `workflow` 权限的 PAT

---

## 五、给后来人的几点建议

1. 新手不要一开始就使用 submodule  
2. Actions 显示成功不等于部署内容正确  
3. 空白页优先检查 HTML 是否存在，再看样式  
4. workflow 权限问题非常常见  
5. 网络问题不代表配置错误  

---

## 结语

这次搭建博客最大的感受是：

> **搭博客并不难，真正难的是排错。**

但正因为踩过这些坑，我对 Git、GitHub Actions、GitHub Pages 的理解有了明显提升。

如果你也在搭建 Hexo 博客，希望这篇踩坑记录能帮你少走一些弯路。
