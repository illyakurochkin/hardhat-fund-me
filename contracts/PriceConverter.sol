// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
  function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
    (, int256 answer, , ,) = priceFeed.latestRoundData();
    return uint256(answer * 100000000);
  }

  function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
    return (getPrice(priceFeed) * ethAmount) / 100000000000000000;
  }
}
