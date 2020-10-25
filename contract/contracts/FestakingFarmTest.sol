pragma solidity ^0.6.0;
import "./FestakingFarm.sol";

contract FestakingFarmTest is FestakingFarm {
    uint public GAP = 60000;
    uint public SEC = 1000;

    constructor (string memory name_,
        address tokenAddress_,
        address rewardTokenAddress_,
        uint256 stakingCap_)
    FestakingFarm(name_, tokenAddress_, rewardTokenAddress_, now, now + GAP, now + GAP, now + GAP * 2, stakingCap_)
    public { }

    function setStakingPeriod() public {
        setStakingStart(now - SEC);
    }

    function setEarlyWithdrawalPeriod(uint offset) public {
        setStakingStart(now - GAP - offset);
    }

    function setAfterWithdrawal() public {
        setStakingStart(now - GAP * 2 - SEC);
    }

    function setPreWithdrawStart() public {
        stakingStarts = now - GAP - SEC;
        stakingEnds = now - SEC;
        withdrawStarts = now + GAP;
        withdrawEnds = now + GAP * 2;
    }

    function setStakingStart(uint time) public {
        stakingStarts = time;
        stakingEnds = time + GAP;
        withdrawStarts = time + GAP;
        withdrawEnds = time + GAP * 2;
    }
}
