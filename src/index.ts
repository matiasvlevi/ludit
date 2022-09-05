#!/usr/bin/env node

import { Options } from './options'
import Frontend from './Frontend'

new Frontend(
	Options.parse(process.argv)
);

