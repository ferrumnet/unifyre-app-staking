const Staking = artifacts.require("Staking");


module.exports = async function(deployer,network, accounts)  {
  deployer.deploy(Staking);
};
