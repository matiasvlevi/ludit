#!/usr/bin/env node

import { Options } from './CLI/options'
import CLI from './CLI'

new CLI(
	Options.parse(
		process.argv
	)
);

