const DummyToken = artifacts.require("DummyToken");
const GummyToken = artifacts.require("GummyToken");
const StakingFarm = artifacts.require("FestakingFarm");
const StakingFarmTest = artifacts.require("FestakingFarmTest");


module.exports = async function(deployer,network, accounts)  {
  await deployer.deploy(DummyToken);
  await deployer.deploy(GummyToken);
  const tok1 = await DummyToken.deployed();
  const tok2 = await GummyToken.deployed();
  await deployer.deploy(StakingFarmTest, "Test staking contract",
      tok1.address,
      tok2.address,
      1000
  );
  await StakingFarmTest.deployed();
  let now=Date.now();
  let GAP = 60000;
  await deployer.deploy(StakingFarm, "Staking contract",
  tok1.address, tok2.address, now, now+GAP, now+GAP,now+GAP*2,1000);
  await StakingFarm.deployed(); 
};
