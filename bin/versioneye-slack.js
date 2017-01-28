#!/usr/bin/env node

'use strict';

const CommandLine = require('../lib/cli');
const cli = new CommandLine(process.argv, process.env, console, process.exit);
cli.execute();
