const assert = require('assert');
const { transform } = require('../lib/yarn');

const locks = {
  npm: `
"@babel/runtime@^7.0.0", "@babel/runtime@^7.2.0", "@babel/runtime@^7.3.4", "@babel/runtime@^7.4.5":
  version "7.4.5"
  resolved "https://registry.npmjs.org/@babel/runtime/-/runtime-7.4.5.tgz#582bb531f5f9dc67d2fcb682979894f75e253f12"

core-js@^3.1.3:
  version "3.1.3"
  resolved "https://registry.npmjs.org/core-js/-/core-js-3.1.3.tgz#95700bca5f248f5f78c0ec63e784eca663ec4138"
`,
  yarn: `
"@babel/runtime@^7.0.0", "@babel/runtime@^7.2.0", "@babel/runtime@^7.3.4", "@babel/runtime@^7.4.5":
  version "7.4.5"
  resolved "https://registry.yarnpkg.com/@babel/runtime/-/runtime-7.4.5.tgz#582bb531f5f9dc67d2fcb682979894f75e253f12"

core-js@^3.1.3:
  version "3.1.3"
  resolved "https://registry.yarnpkg.com/core-js/-/core-js-3.1.3.tgz#95700bca5f248f5f78c0ec63e784eca663ec4138"
`,
  taobao: `
"@babel/runtime@^7.0.0", "@babel/runtime@^7.2.0", "@babel/runtime@^7.3.4", "@babel/runtime@^7.4.5":
  version "7.4.5"
  resolved "https://registry.npm.taobao.org/@babel/runtime/download/@babel/runtime-7.4.5.tgz#582bb531f5f9dc67d2fcb682979894f75e253f12"

core-js@^3.1.3:
  version "3.1.3"
  resolved "https://registry.npm.taobao.org/core-js/download/core-js-3.1.3.tgz#95700bca5f248f5f78c0ec63e784eca663ec4138"
`,
  tencent: `
"@babel/runtime@^7.0.0", "@babel/runtime@^7.2.0", "@babel/runtime@^7.3.4", "@babel/runtime@^7.4.5":
  version "7.4.5"
  resolved "https://mirrors.cloud.tencent.com/npm/@babel%2fruntime/-/runtime-7.4.5.tgz#582bb531f5f9dc67d2fcb682979894f75e253f12"

core-js@^3.1.3:
  version "3.1.3"
  resolved "https://mirrors.cloud.tencent.com/npm/core-js/-/core-js-3.1.3.tgz#95700bca5f248f5f78c0ec63e784eca663ec4138"
`,
};

function test(source, target) {
  console.info(`Transform from ${source} to ${target}`);
  const actual = transform(locks[source], target);
  const expected = locks[target];
  assert.strictEqual(actual, expected);
}

const keys = Object.keys(locks);
for (const source of keys) {
  for (const target of keys) {
    test(source, target);
  }
}
