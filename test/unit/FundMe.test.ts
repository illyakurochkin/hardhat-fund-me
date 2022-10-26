import {utils, Wallet} from 'ethers';
import {deployments, ethers, getNamedAccounts, network} from 'hardhat';
import {FundMe, MockV3Aggregator} from '../../typechain-types';
import {assert, expect} from 'chai';
import {developmentChains} from '../../helper-hardhat-config';

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async () => {
    let fundMe: FundMe;
    let deployer: string;
    let mockV3Aggregator: MockV3Aggregator;

    const sendValue = utils.parseEther('1');

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture('all');
      fundMe = await ethers.getContract('FundMe', deployer);
      mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
      // mockV3Aggregator.
      // await mockV3Aggregator
    });

    describe('constructor', () => {
      it('should set the aggregator addresses correctly', async () => {
        const response = await fundMe.getPriceFeed();
        assert.equal(response, mockV3Aggregator.address);
      });
    });

    describe('fund', () => {
      it('should fail if you don\'t send enough ETH', async () => {
        await expect(fundMe.fund()).to.be.revertedWithCustomError(fundMe, 'FundMe__NotEnoughEth')
      });

      it('should update the amount ', async () => {
        await fundMe.fund({ value: sendValue })
        const response = await fundMe.getAddressToAmountFunded(deployer)
        assert.equal(response.toString(), sendValue.toString());
      });

      it('should add funder to array of funders', async () => {
        await fundMe.fund({ value: sendValue});
        const funder = await fundMe.getFunder(0);
        assert.equal(funder, deployer)
      });
    })

    describe('withdraw', () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      })

      it('should withdraw ETH from a single funder', async () => {
        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.withdraw();
        const { gasUsed, effectiveGasPrice} = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

        assert.equal(endingFundMeBalance.toString(), '0');
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).sub(gasCost).toString(),
          endingDeployerBalance.toString()
        )
      });

      it('should withdraw ETH from multiple funders', async () => {
        const accounts = await ethers.getSigners();

        for(let i = 0; i < 5; i++) {
          const fundMeConnectedContract = await fundMe.connect(accounts[i]);
          await fundMeConnectedContract.fund({ value: sendValue });
        }

        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.withdraw();
        const { gasUsed, effectiveGasPrice} = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

        assert.equal(endingFundMeBalance.toString(), '0');
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).sub(gasCost).toString(),
          endingDeployerBalance.toString()
        )

        await expect(fundMe.getFunder(0)).to.be.reverted;

        for(let i = 0; i < 5; i++) {
          assert.equal((await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(), '0');
        }
      });

      it('should fail if not-deployer tries to withdraw', async () => {
        const accounts = await ethers.getSigners();

        const notDeployer = accounts.find(({address}) =>  address.toString() !== deployer.toString())!
        const fundMeConnectedContract = await fundMe.connect(notDeployer);

        // TODO: find a way to make it running without `{ gasLimit: 999999 }`
        await expect(fundMeConnectedContract.withdraw({gasLimit: 999999}))
          .to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
      });
    })

    describe('cheap_withdraw', () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      })

      it('should cheap_withdraw ETH from a single funder', async () => {
        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.cheap_withdraw();
        const { gasUsed, effectiveGasPrice} = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

        assert.equal(endingFundMeBalance.toString(), '0');
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).sub(gasCost).toString(),
          endingDeployerBalance.toString()
        )
      });

      it('should cheap_withdraw ETH from multiple funders', async () => {
        const accounts = await ethers.getSigners();

        for(let i = 0; i < 5; i++) {
          const fundMeConnectedContract = await fundMe.connect(accounts[i]);
          await fundMeConnectedContract.fund({ value: sendValue });
        }

        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.cheap_withdraw();
        const { gasUsed, effectiveGasPrice} = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

        assert.equal(endingFundMeBalance.toString(), '0');
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).sub(gasCost).toString(),
          endingDeployerBalance.toString()
        )

        await expect(fundMe.getFunder(0)).to.be.reverted;

        for(let i = 0; i < 5; i++) {
          assert.equal((await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(), '0');
        }
      });

      it('should fail if not-deployer tries to withdraw', async () => {
        const accounts = await ethers.getSigners();

        const notDeployer = accounts.find(({address}) =>  address.toString() !== deployer.toString())!
        const fundMeConnectedContract = await fundMe.connect(notDeployer);

        // TODO: find a way to make it running without `{ gasLimit: 999999 }`
        await expect(fundMeConnectedContract.cheap_withdraw({gasLimit: 999999}))
          .to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
      });
    })
  });







