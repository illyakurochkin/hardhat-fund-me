import {network} from 'hardhat';
import {developmentChains, networkConfig} from '../helper-hardhat-config';
import {DeployFunction} from 'hardhat-deploy/dist/types';
import {verify} from '../utils/verify';

const deployFundMe: DeployFunction = async ({getNamedAccounts, deployments}) => {
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  const chainId = network.config.chainId as keyof typeof networkConfig;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy('FundMe', {
    from: deployer, args, log: true, waitConfirmations: (network.config as any).blockConfirmations ?? 0
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }

  log('------------------------------------');
};

export default deployFundMe;
deployFundMe.tags = ['all', 'fundme'];
