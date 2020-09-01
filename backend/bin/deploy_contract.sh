#!/bin/bash
echo deploy_contract.sh NETWORK CONTRACT_ADDRESS COLOR LOGO
echo set DEPLOY_CONTRACT_SECRET env

secret=$DEPLOY_CONTRACT_SECRET
network=$1
contract=$2
color=$3
logo=$4
if [ "$secret" == "" ]; then
  echo No DEPLOY_CONTRACT_SECRET
  exit -1
fi

curl -X POST -H 'Content-Type: application-json' -d "{\"command\":\"adminSaveStakingContractInfo\", \"data\":{\"network\":\"${network}\",\"contractAddress\":\"${contract}\",\"color\":\"${color}\", \"logo\":\"${logo}\", \"adminSecret\":\"${secret}\"}}" https://y6sl343dn6.execute-api.us-east-2.amazonaws.com/default/prod-unifyre-extension-staking-backend

