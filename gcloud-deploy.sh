#!/usr/bin/env bash

mkdir deploy

# Globbing allows non-alphanumeric filenames (according to bash linter).
mv ./dist/*.dmg ./dist/*.zip ./dist/*.deb ./dist/*.tar.get ./dist/*.exe ./dist/*.msi ./deploy/

# Will use $GCP_PASSWD to decrypt encrypted json key
# janus deploy -to="builds.etcdevteam.com/emerald-wallet/$(janus version -format='v%M.%m.x')/" -files="./deploy/*" -key="./gcloud-travis.json.enc"
janus deploy -to="fake-builds-etcdevteam-com/emerald-wallet/$(janus version -format='v%M.%m.x')/" -files="./deploy/*" -key="./gcloud-travis.json.enc"
