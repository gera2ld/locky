const assert = require('assert');
const fs = require('fs').promises;

const pathClause = '[^/#?%]+';
const clauses = {
  scopeName: `(?<scopeName>@${pathClause})`,
  packageName: `(?<packageName>${pathClause})`,
  fileName: `(?<fileName>${pathClause})`,
  query: `(?<query>\\?[^#]*)?`,
  hash: `(?<hash>#\\w+)?`,
};

const registries = [
  {
    name: 'npm',
    pattern: 'https://registry.npmjs.org/<scopeNameWithSep><packageName>/-/<fileName>',
  },
  {
    name: 'yarn',
    pattern: 'https://registry.yarnpkg.com/<scopeNameWithSep><packageName>/-/<fileName>',
  },
  {
    name: 'taobao',
    pattern: 'https://registry.npm.taobao.org/<scopeNameWithSep><packageName>/download/<scopeNameWithSep><fileName>',
  },
  {
    name: 'tencent',
    scopeSep: '%2f',
    pattern: 'https://mirrors.cloud.tencent.com/npm/<scopeNameWithSep><packageName>/-/<fileName>',
  },
];

class Parser {
  constructor(config) {
    this.name = config.name;
    this.pattern = config.pattern;
    this.scopeSep = config.scopeSep || '/';
    const snippets = {
      ...clauses,
      scopeNameWithSep: `(?<scopeNameWithSep>${clauses.scopeName}${this.scopeSep})?`,
    };
    const pattern = config.pattern
      .replace(/<(\w+)>/g, (_, name) => {
        const re = snippets[name];
        snippets[name] = `\\k<${name}>`;
        return re;
      })
      + clauses.query + clauses.hash;
    this.re = new RegExp(`^${pattern}`);
  }

  parse(resolved) {
    return resolved.match(this.re);
  }

  build(data) {
    const matches = {
      ...data,
      scopeNameWithSep: data.scopeName && (data.scopeName + this.scopeSep),
    };
    let url = this.pattern.replace(/<(\w+)>/g, (_, name) => {
      let match = matches[name];
      return match || '';
    });
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
