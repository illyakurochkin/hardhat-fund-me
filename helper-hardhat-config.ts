export const networkConfig = {
  5: {
    name: 'goerli',
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e'
  },
  137: {
    name: 'polygon',
    ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  },
  31337: {
    name: 'localhost',
    ethUsdPriceFeed: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  }
};

export const developmentChains = ['hardhat', 'ganache'];

export const DECIMALS = 8;
export const INITIAL_ANSWER = 20000000000000;
