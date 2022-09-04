#!/usr/bin/env node

import { Options } from './options'
import Frontend from './Frontend'

const frontend = new Frontend(
	Options.parse(process.argv)
);

