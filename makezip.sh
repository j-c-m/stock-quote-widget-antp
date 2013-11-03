#!/bin/sh

rm -f chrome.zip
zip -r chrome.zip . -x .\* -x makezip.sh
