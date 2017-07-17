#!/usr/bin/env bash

mkdir deploy

# Note: dont move .exe, AppVeyor will take care of that.
for f in $(ls dist/ | grep -e "dmg" -e "zip" -e "deb" -e "tar.gz" -e "msi");
do
  mv dist/$f deploy/
done

# Will use $GCP_PASSWD to decrypt encrypted json key
janus deploy -to="builds.etcdevteam.com/emerald-wallet/$(janus version -format='v%M.%m.x')" -files="./deploy/*" -key="./gcloud-travis.json.enc"
