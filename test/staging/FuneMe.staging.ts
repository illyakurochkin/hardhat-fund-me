import {FundMe} from '../../typechain-types';
import {ethers, getNamedAccounts, network} from 'hardhat';
import {developmentChains} from '../../helper-hardhat-config';
import {assert} from 'chai';

developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async () => {
    let fundMe: FundMe;
    let deployer: string;
    const sendValue = ethers.utils.parseEther('0.01');

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      fundMe = await ethers.getContract('FundMe', deployer);
    });

    it('should allow to fund and withdraw', async () => {
      await fundMe.fund({ value: sendValue, nonce: 99999 });
      console.log('funded');
      await fundMe.withdraw();
      console.log('withdrawn');
      const endingBalance = await fundMe.provider.getBalance(fundMe.address);
      assert.equal(endingBalance.toString(), '0');
    });
  });

