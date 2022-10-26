import '@nomiclabs/hardhat-solhint';
import 'hardhat-deploy';

import {HardhatUserConfig} from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'dotenv/config';

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!;

// type CustomConfig = HardhatUserConfig & { networks: HardhatUserConfig['networks'] & { [networkName: string]: { blockConfirmations?: number }} }

const config: HardhatUserConfig & any = {
  solidity: '0.8.8',
  // solidity: {
  //   compilers: [
  //     {version: '0.8.8'},
  //     {version: '0.6.0'},
  //   ],
  // },
  defaultNetwork: 'hardhat',
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    polygon: {
      url: '',
      chainId: 137,
    },
    ganache: {
      url: 'http://127.0.0.1:7545/',
      // chainId: 1337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    outputFile: 'gas-reporter.txt',
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    }
  }
};

export default config;
