import {network} from 'hardhat';
import {DECIMALS, developmentChains, INITIAL_ANSWER} from '../helper-hardhat-config';
import {DeployFunction} from 'hardhat-deploy/dist/types';

const deployMocks: DeployFunction = async ({deployments, getNamedAccounts}) => {
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();

  log(`Network: ${network.name}`)
  if(developmentChains.includes(network.name)) {
    log('Local network detected! Deploying mocks')
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log('Mocks deployed!')
    log('----------------------')
  }
}

export default deployMocks
deployMocks.tags = ['all', 'mocks']
