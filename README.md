# @gera2ld/locky

![NPM](https://img.shields.io/npm/v/@gera2ld/locky.svg)
![License](https://img.shields.io/npm/l/@gera2ld/locky.svg)
![Downloads](https://img.shields.io/npm/dt/@gera2ld/locky.svg)

Transform `yarn.lock` files for different registries.

Requires Node.js greater than v10.0.

## Why

`yarn.lock` has a `resolved` field that contains the full URL to the tarball of each dependency. When installing with the lock file, the package manager will download the package with the `resolved` URL instead of resolving it with the name and version.

There is a chance that different users have different network conditions, and they may expect different registry to use, resulting as different resolved URLs to download.

For example, in China the NPM registry is slow and people use [taobao registry](https://developer.aliyun.com/mirror/NPM) instead. But for people outside China, it is just the opposite.

With this package, you can always transform the lock file with resolved URLs on an expected registry so that other people could easily install them.

## Installation

You can even use it without installation, via `npx`.

Or install it globally:

```sh
$ yarn global add @gera2ld/locky
```

## Usage

```sh
# transform the yarn.lock to resolve to npm registry
$ locky yarn npm

# use with npx
$ npx @gera2ld/locky yarn npm
```
