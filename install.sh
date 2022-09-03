#!/bin/bash
mkdir -p /usr/share/ludit/lib &&
mv ./lib/* /usr/share/ludit/lib/ &&

export LUDIT_PATH=/usr/share/ludit/lib &&
echo "Please set /usr/share/ludit/lib to the LUDIT_PATH environement variable"
