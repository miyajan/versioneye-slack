#!/usr/bin/env node

'use strict';

const cli = require('../lib/cli');
cli(process.argv, process.env, process.exit);
