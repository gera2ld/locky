const assert = require('assert');
const fs = require('fs').promises;

const registries = [
  {
    name: 'npm',
    pattern: 'https://registry.npmjs.org/<scopeName><packageName>/-/<fileName>',
  },
  {
    name: 'yarn',
    pattern: 'https://registry.yarnpkg.com/<scopeName><packageName>/-/<fileName>',
  },
  {
    name: 'taobao',
    pattern: 'https://registry.npm.taobao.org/<scopeName><packageName>/download/<scopeName><fileName>',
  },
];

class Parser {
  constructor(config) {
    this.name = config.name;
    this.pattern = config.pattern;
    const snippets = {
      scopeName: '(?<scopeName>@[^/#?]+/|)',
      packageName: '(?<packageName>[^/#?]+)',
      fileName: '(?<fileName>[^/#?]+)',
    };
    const pattern = config.pattern
      .replace(/<(\w+)>/g, (_, name) => {
        const re = snippets[name];
        snippets[name] = `\\k<${name}>`;
        return re;
      })
      + '(?<query>\\?[^#]*)?(?<hash>#\\w+)?';
    this.re = new RegExp(`^${pattern}`);
  }

  parse(resolved) {
    return resolved.match(this.re);
  }

  build(matches) {
    let url = this.pattern.replace(/<(\w+)>/g, (_, name) => matches[name]);
    // if (matches.query) url += matches.query;
    if (matches.hash) url += matches.hash;
    return url;
  }
}

const parsers = registries.map(config => new Parser(config))
  .reduce((map, parser) => {
    map[parser.name] = parser;
    return map;
  }, {});

function getProcessor(target) {
  const targetParser = parsers[target];
  assert.ok(targetParser, `Target "${target}" not supported`);
  return line => {
    const [, prefix, resolved] = line.match(/^(\s+resolved\s+)"(.*)"|$/);
    if (!resolved) return line;
    let matches;
    let parser;
    for (parser of Object.values(parsers)) {
      matches = parser.parse(resolved);
      if (matches) break;
    }
    if (!matches) {
      console.warn('Unsupported resolved path:', resolved);
      return line;
    }
    if (parser.name === target) return line;
    const url = targetParser.build(matches.groups);
    return `${prefix}"${url}"`;
  };
}

function transform(input, target) {
  return input.split('\n')
    .map(getProcessor(target))
    .join('\n');
}

async function check(target, shouldThrow = false) {
  const originalContent = await fs.readFile('yarn.lock', 'utf8');
  const content = originalContent.split('\n')
  .map(getProcessor(target))
  .join('\n');
  if (originalContent !== content) {
    await fs.writeFile('yarn.lock', content, 'utf8');
    console.error('yarn.lock is updated.');
    if (shouldThrow) process.exit(2);
  }
}

exports.transform = transform;
exports.check = check;
