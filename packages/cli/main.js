#!/usr/bin/env node

// This file is needed because bin/main.js does not exist during the initial `npm install`
// and the executable `osmosfeed` won't be created.
require("./bin/main");
