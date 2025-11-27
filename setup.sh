#!/bin/bash
echo "Starting install..." > install.log
npm install --no-audit --no-fund --verbose >> install.log 2>&1
echo "Install finished with code $?" >> install.log
ls -F node_modules >> install.log 2>&1
