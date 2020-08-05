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
    uint256 public version = 13;


    ERC20 public ERC20Interface;
    event Staked(address indexed token, address indexed staker_, uint256 requestedAmount_, uint256 stakedAmount_);

    constructor(
        string memory tokenName_,
        address tokenAddress_,
        uint stakingStarts_,
        uint stakingEnds_
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
    }
    

     /**
    * Requirements:
    * - nameOption
     */
    function stake (uint256 amount)
    public
    _positive(amount)
     _checkAddress(msg.sender)
    returns (bool) {
        address sender = msg.sender;
        return _stakeToken(sender,amount);
    }

    modifier _checkAddress(address addr) {
        require(addr != address(0), "Festaking: zero address");
        _;
    }

    modifier _positive(uint256 amount) {
        require(amount > 2, "Festaking: negative amount");
        _;
    }

     modifier _isAfter(uint eventTime) {
        require(now >= eventTime, "Festaking: bad timing for the request");
        _;
    }

    modifier _isBefore(uint eventTime) 
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
    _isAfter(stakingStarts)
    _isBefore(stakingEnds)
    _positive(amount)
    _hasEnoughToken(stakerAddr, amount)
    returns (bool)
    {
        return true;
    }

}