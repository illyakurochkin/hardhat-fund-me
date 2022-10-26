// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughEth(uint256 expected, uint256 received);
error FundMe__WithdrawalFailed();

/// @title A contract for crowd funding
/// @author Illia Kurochkin
/// @notice This is a funeme contract
contract FundMe {
  using PriceConverter for uint256;

  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;

  address private immutable i_owner;
  uint256 public constant MINIMUM_USD = 5 * 10 ** 18;

  AggregatorV3Interface private s_priceFeed;

  modifier onlyOwner {
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  constructor(address priceFeedAddress) {
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    i_owner = msg.sender;
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }

  /// @notice This function funds this contract
  function fund() public payable {
    uint256 valueInUsd = msg.value.getConversionRate(s_priceFeed);
//    if(valueInUsd < MINIMUM_USD) {
//      revert FundMe__NotEnoughEth(MINIMUM_USD, valueInUsd);
//    }
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  /// @notice This function withdraws the funds. It can be called only by the creator
  function withdraw() public payable onlyOwner {
    console.log("withdrawing funds by %s", msg.sender);
    for (uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool success,) = i_owner.call{value : address(this).balance}("");

    if(!success) {
      revert FundMe__WithdrawalFailed();
    }
  }

  function cheap_withdraw() public payable onlyOwner {
    address[] memory funders = s_funders;

    for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }

    s_funders = new address[](0);
    (bool success,) = i_owner.call{value : address(this).balance}("");

    if(!success) {
      revert FundMe__WithdrawalFailed();
    }
  }

  function getAddressToAmountFunded(address funderAddress) public view returns(uint256) {
    return s_addressToAmountFunded[funderAddress];
  }

  function getFunder(uint256 index) public view returns(address) {
    return s_funders[index];
  }

  function getPriceFeed() public view returns(AggregatorV3Interface) {
    return s_priceFeed;
  }
}
