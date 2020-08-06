// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Staking {
    using SafeMath for uint256;

    // map address to user stake 
    mapping (address => uint256) stakes;

    //staking details
    string public tokenName;
    address  public tokenAddress;
    uint public stakingStarts;
    uint public stakingEnds;
    uint public stakingTotal;
    uint public stakeBalance;
    uint public stakedTotal;
    uint public withdrawStarts;
    uint public withdrawEnds;
    uint256 public totalReward;
    uint256 public earlyWithdrawReward;
    uint256 public rewardBalance;
    uint256 public stakedBalance;

    ERC20 public ERC20Interface;
    event Staked(address indexed token, address indexed staker_, uint256 requestedAmount_, uint256 stakedAmount_);
    event PaidOut(address indexed token, address indexed staker_, uint256 amount_, uint256 reward_);
    event Refunded(address indexed token, address indexed staker_, uint256 amount_);
    
    constructor(
        string memory tokenName_,
        address tokenAddress_,
        uint stakingStarts_,
        uint stakingEnds_,
        uint withdrawStarts_,
        uint withdrawEnds_,
        uint stakingTotal_
    ) public {
        tokenName = tokenName_;
        require(tokenAddress_ != address(0), "Festaking: 0 address");
        tokenAddress = tokenAddress_;

        require(stakingStarts_ > 0, "Festaking: zero staking start time");
        if (stakingStarts_ < now) {
            stakingStarts = now;
        } else {
            stakingStarts = stakingStarts_;
        }

        require(stakingEnds_ > stakingStarts, "Festaking: staking end must be after staking starts");
        stakingEnds = stakingEnds_;

        require(stakingTotal_ > 0, "Festaking: stakingTotal must be positive");
        stakingTotal = stakingTotal_;

        require(withdrawStarts_ >= stakingEnds, "Festaking: withdrawStarts must be after staking ends");
        withdrawStarts = withdrawStarts_;

        require(withdrawEnds_ > withdrawStarts, "Festaking: withdrawEnds must be after withdraw starts");
        withdrawEnds = withdrawEnds_;
    }
    
    

     /**
    * Requirements:
    * - nameOption
     */
    function stake (uint256 amount)
    public
    _positive(amount)
     _realAddress(msg.sender)
    payable
    returns (bool) {
        address sender = msg.sender;
        return _stakeToken(sender,amount);
    }

    modifier _realAddress(address addr) {
        require(addr != address(0), "Festaking: zero address");
        _;
    }

    modifier _positive(uint256 amount) {
        require(amount > 2, "Festaking: negative amount");
        _;
    }

     modifier _after(uint eventTime) {
        require(now >= eventTime, "Festaking: bad timing for the request");
        _;
    }

    modifier _before(uint eventTime) 
    {
        require(now < eventTime, "Festaking: bad timing for the request");
        _;
    }

    modifier _hasEnoughToken(address staker, uint256 amount) {
        ERC20Interface = ERC20(tokenAddress);
        uint256 ourAllowance = ERC20Interface.allowance(staker, address(this));
        require(amount <= ourAllowance, "Festaking: Make sure to add enough allowance");
        _;
    }

    function _stakeToken (address stakerAddr,uint amount) 
    public
    _after(stakingStarts)
    _before(stakingEnds)
    _positive(amount)
    _hasEnoughToken(stakerAddr, amount)
    returns (bool)
    {
        uint remainingToken = amount;
        if(remainingToken > (stakingTotal - remainingToken)){
            remainingToken = (stakingTotal - remainingToken);
        }
        require(remainingToken > 0, "Festaking: Staking cap is filled");
        require((remainingToken + stakedTotal) <= stakingTotal, "Festaking: this will increase staking amount pass the cap");

        if (!_payMe(stakerAddr, remainingToken)) {
            return false;
        }
        emit Staked(tokenAddress, stakerAddr, amount, remainingToken);

        if (remainingToken < amount) {
            // Return the unstaked amount to sender (from allowance)
            uint256 refund = amount.sub(remainingToken);
            // pay/refund remaining funds
            if (_payTo(stakerAddr, stakerAddr, refund)) {
                emit Refunded(tokenAddress, stakerAddr, refund);
            }
        }

        stakedTotal = stakedTotal.add(remainingToken);
        stakedTotal = stakedTotal.add(remainingToken);
        stakes[stakerAddr] = stakes[stakerAddr].add(remainingToken);
        return true;
    }

    function _payMe(address payer, uint256 amount)
    private
    returns (bool) {
        return _payTo(payer, address(this), amount);
    }

    function _payTo(address allower, address receiver, uint256 amount)
    _hasAllowance(allower, amount)
    private
    returns (bool) {
        // Request to transfer amount from the contract to receiver.
        // contract does not own the funds, so the allower must have added allowance to the contract
        // Allower is the original owner.
        ERC20Interface = ERC20(tokenAddress);
        return ERC20Interface.transferFrom(allower, receiver, amount);
    }

    function _payDirect(address to, uint256 amount)
    private
    _positive(amount)
    returns (bool) {
        ERC20Interface = ERC20(tokenAddress);
        return ERC20Interface.transfer(to, amount);
    }

    function addReward(uint256 rewardAmount, uint256 withdrawableAmount)
    public
    _before(withdrawStarts)
    _hasAllowance(msg.sender, rewardAmount)
    returns (bool) {
        require(rewardAmount > 0, "Festaking: reward must be positive");
        require(withdrawableAmount >= 0, "Festaking: withdrawable amount cannot be negative");
        require(withdrawableAmount <= rewardAmount, "Festaking: withdrawable amount must be less than or equal to the reward amount");
        address from = msg.sender;
        if (!_payMe(from, rewardAmount)) {
            return false;
        }

        totalReward = totalReward.add(rewardAmount);
        rewardBalance = totalReward;
        earlyWithdrawReward = earlyWithdrawReward.add(withdrawableAmount);
        return true;
    }

    function stakeOf() public view returns (address) {
        return tokenAddress;
    }

    function withdraw(uint256 amount)
    public
    _after(withdrawStarts)
    _positive(amount)
    _realAddress(msg.sender)
    returns (bool) {
        address from = msg.sender;
        require(amount <= stakes[from], "Festaking: not enough balance");
        if (now < withdrawEnds) {
            return _withdrawEarly(from, amount);
        } else {
            return _withdrawAfterClose(from, amount);
        }
    }

    function _withdrawEarly(address from, uint256 amount)
    private
    _realAddress(from)
    returns (bool) {
        // This is the formula to calculate reward:
        // r = (earlyWithdrawReward / stakedTotal) * (now - stakingEnds) / (withdrawEnds - stakingEnds)
        // w = (1+r) * a
        uint256 denom = (withdrawEnds.sub(stakingEnds)).mul(stakedTotal);
        uint256 reward = (
        ( (now.sub(stakingEnds)).mul(earlyWithdrawReward) ).mul(amount)
        ).div(denom);
        uint256 payOut = amount.add(reward);
        rewardBalance = rewardBalance.sub(reward);
        stakedBalance = stakedBalance.sub(amount);
        stakes[from] = stakes[from].sub(amount);
        if (_payDirect(from, payOut)) {
            emit PaidOut(tokenAddress, from, amount, reward);
            return true;
        }
        return false;
    }

    function _withdrawAfterClose(address from, uint256 amount)
    private
    _realAddress(from)
    returns (bool) {
        uint256 reward = (rewardBalance.mul(amount)).div(stakedBalance);
        uint256 payOut = amount.add(reward);
        stakes[from] = stakes[from].sub(amount);
        if (_payDirect(from, payOut)) {
            emit PaidOut(tokenAddress, from, amount, reward);
            return true;
        }
        return false;
    }

    modifier _hasAllowance(address allower, uint256 amount) {
        // Make sure the allower has provided the right allowance.
        ERC20Interface = ERC20(tokenAddress);
        uint256 ourAllowance = ERC20Interface.allowance(allower, address(this));
        require(amount <= ourAllowance, "Festaking: Make sure to add enough allowance");
        _;
    }
}