#!/bin/bash
echo deploy_contract.sh NETWORK CONTRACT_ADDRESS CONTRACT_TYPE COLOR LOGO BACKGROUND_IMAGE
echo set DEPLOY_CONTRACT_SECRET env

secret=$DEPLOY_CONTRACT_SECRET
network=$1
contract=$2
contractType=$3
color=$4
logo=$5
bkgImage=$6
if [ "$secret" == "" ]; then
  echo No DEPLOY_CONTRACT_SECRET
  exit -1
fi

curl -X POST -H 'Content-Type: application-json' -d "{\"command\":\"adminSaveStakingContractInfo\", \"data\":{\"network\":\"${network}\",\"contractAddress\":\"${contract}\",\"color\":\"${color}\", \"logo\":\"${logo}\", \"backgroundImage\":\"${bkgImage}\", \"adminSecret\":\"${secret}\", \"maxContribution\":\"${MAX_CONTRIBUTION}\", \"contractType\":\"${contractType}\"}}" https://y6sl343dn6.execute-api.us-east-2.amazonaws.com/default/prod-unifyre-extension-staking-backend

