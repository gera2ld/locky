#!/usr/bin/env node

const { Command } = require('commander');
const { yarn } = require('../lib');
const pkg = require('../package.json');

const program = new Command();
program
.version(pkg.version)
.description(pkg.description);

program
.command('yarn <target>')
.option('-t, --throw', 'Throw exception if lock file is changed')
.action((target, cmd) => {
  yarn.check(target, cmd.throw);
});

program.parse(process.argv);
