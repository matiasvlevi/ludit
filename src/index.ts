#!/usr/bin/env node

import {CLI} from "./CLI";
import { Options } from "./CLI/options";

new CLI(
  Options.parse(
    process.argv,
  ),
);
