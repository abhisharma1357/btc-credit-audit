const BTCCToken = artifacts.require('BTCCToken.sol');
const TokenA = artifacts.require('TokenA.sol');
const { increaseTimeTo, duration } = require('openzeppelin-solidity/test/helpers/increaseTime');
const { latestTime } = require('openzeppelin-solidity/test/helpers/latestTime');
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract('BTCCToken Token Contract', async (accounts) => {

  it('Should correctly initialize constructor values of BTCCToken Token Contract', async () => {

    this.tokenhold = await BTCCToken.new({ from: accounts[0], gas: 60000000 });

  });

  it('Should check the Total Supply of BTCCToken Tokens', async () => {

    let totalSupply = await this.tokenhold.totalSupply();
    assert.equal(totalSupply / 10 ** 18, 300000000);
  });

  it('Should check the Name of a token of BTCC Token contract', async () => {

    let name = await this.tokenhold.name();
    assert.equal(name, 'BTCCREDIT Token');

  });

  it('Should check the symbol of a token of BTCCToken contract', async () => {

    let symbol = await this.tokenhold.symbol();
    assert.equal(symbol, 'BTCC');

  });

  it('Should check the decimal of a token of BTCCToken contract', async () => {

    let decimal = await this.tokenhold.decimals();
    assert.equal(decimal.toNumber(), 18);

  });

  it('Should check the balance of a Owner', async () => {

    let balanceOfOwner = await this.tokenhold.balanceOf(accounts[0]);
    assert.equal(balanceOfOwner / 10 ** 18, 0);

  });

  it('Should check the owner of a contract', async () => {

    let owner = await this.tokenhold.owner();
    assert.equal(owner, accounts[0]);

  });

  it('Should check the New owner of a contract', async () => {

    let newOwner = await this.tokenhold.newOwner();
    assert.equal(newOwner, 0x0000000000000000000000000000000000000000);

  });

  it('Should check the balance of a contract', async () => {

    let balanceOfOwner = await this.tokenhold.balanceOf(this.tokenhold.address);
    assert.equal(balanceOfOwner / 10 ** 18, 0);

  });

  it('Should check the distributed tokens of a contract', async () => {

    let distributedTokenCount = await this.tokenhold.distributedTokenCount();
    assert.equal(distributedTokenCount / 10 ** 18, 0);

  });

  it('Should check the owner account is not freezed', async () => {

    let frozenAccount = await this.tokenhold.frozenAccount.call(this.tokenhold.address);
    assert.equal(frozenAccount, false);

  });

  it('Should check the minted tokens', async () => {

    let _mintedTokensCount = await this.tokenhold._mintedTokensCount.call();
    assert.equal(_mintedTokensCount/10**18,0);

  });

  it('Should Not be able to distribute tokens to accounts[1] by Non Owner account', async () => {

    try {
      let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[1]);
      assert.equal(balanceOfReceiver, 0);
      let distributedTokenCount = await this.tokenhold.distributedTokenCount();
      assert.equal(distributedTokenCount, 0);
      await this.tokenhold.distributeTokens(accounts[1], 1000000 * 10 ** 18, { from: accounts[2], gas: 5000000 });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert You are not owner';
      assert.equal(error.message, error_, 'Reverted ');
    }
  });

  it('Should Not be able to distribute tokens more then total supply', async () => {

    try {
      let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[1]);
      assert.equal(balanceOfReceiver, 0);
      let distributedTokenCount = await this.tokenhold.distributedTokenCount();
      assert.equal(distributedTokenCount, 0);
      await this.tokenhold.distributeTokens(accounts[1], 300000001 * 10 ** 18, { from: accounts[0], gas: 5000000 });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert Distributed Tokens exceeded Total Suuply';
      assert.equal(error.message, error_, 'Reverted ');
    }

  });

  it('Should be able to distribute tokens to accounts[1]', async () => {

    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[1]);
    assert.equal(balanceOfReceiver, 0);
    let distributedTokenCount = await this.tokenhold.distributedTokenCount();
    assert.equal(distributedTokenCount, 0);
    await this.tokenhold.distributeTokens(accounts[1], 1000000 * 10 ** 18, { from: accounts[0], gas: 5000000 });
    let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[1]);
    assert.equal(balanceOfReceiverLater / 10 ** 18, 1000000);

  });

  it('Should check the distributed tokens of a contract after sent to account[1]', async () => {

    let distributedTokenCount = await this.tokenhold.distributedTokenCount();
    assert.equal(distributedTokenCount / 10 ** 18, 1000000);

  });

  it("Should Not be able to Freeze Accounts[1] by non owner account", async () => {

    try {
      var frozenAccount = await this.tokenhold.frozenAccount.call(accounts[1], { gas: 500000000 });
      assert.equal(frozenAccount, false, 'not freeze Account');
      await this.tokenhold.freezeAccount([accounts[1]], true, { from: accounts[1] });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert You are not owner';
      assert.equal(error.message, error_, 'Reverted ');
    }

  });

  it("Should Freeze Accounts[1]", async () => {

    var frozenAccount = await this.tokenhold.frozenAccount.call(accounts[1], { gas: 500000000 });
    assert.equal(frozenAccount, false, 'not freeze Account');
    await this.tokenhold.freezeAccount([accounts[1]], true, { from: accounts[0] });
    var frozenAccountNow = await this.tokenhold.frozenAccount.call(accounts[1], { gas: 500000000 });
    assert.equal(frozenAccountNow, true, ' Account Freezed');
  });

  it("Should Not be able to transfer Tokens when account is freezed ", async () => {

    try {
      let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[1]);
      assert.equal(balanceOfReceiverLater / 10 ** 18, 1000000);
      await this.tokenhold.transfer(accounts[8], 1000000000000000000, { from: accounts[1], gas: 5000000 });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert Account is frozen';
      assert.equal(error.message, error_, 'Reverted ');
    }

  });

  it("Should Not be able to UnFreeze Accounts[1] by non owner account", async () => {

    try {
      var frozenAccount = await this.tokenhold.frozenAccount.call(accounts[1], { gas: 500000000 });
      assert.equal(frozenAccount, true, 'not freeze Account');
      await this.tokenhold.freezeAccount([accounts[1]], false, { from: accounts[1] });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert You are not owner';
      assert.equal(error.message, error_, 'Reverted ');
    }

  });

  it("Should UnFreeze Accounts[1]", async () => {

    var frozenAccount = await this.tokenhold.frozenAccount.call(accounts[1], { gas: 500000000 });
    assert.equal(frozenAccount, true, 'not freeze Account');
    await this.tokenhold.freezeAccount([accounts[1]], false, { from: accounts[0] });
    var frozenAccountNow = await this.tokenhold.frozenAccount.call(accounts[1], { gas: 500000000 });
    assert.equal(frozenAccountNow, false, ' Account Freezed');
  });

  it("Should be able to transfer Tokens after Unfreeze ", async () => {

    let balanceOfSender = await this.tokenhold.balanceOf(accounts[1]);
    assert.equal(balanceOfSender / 10 ** 18, 1000000, 'balance account 1');
    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[2]);
    assert.equal(balanceOfReceiver / 10 ** 18, 0, 'balance account 2');
    await this.tokenhold.transfer(accounts[2], 1000000 * 10 ** 18, { from: accounts[1], gas: 5000000 });
    let balanceOfSenderLater = await this.tokenhold.balanceOf(accounts[1]);
    assert.equal(balanceOfSenderLater / 10 ** 18, 0);
    let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[2]);
    assert.equal(balanceOfReceiverLater / 10 ** 18, 1000000);

  });

  it('Should Not be able to burn tokens when account doesnt have tokens', async () => {

    try {
      let balanceOfAccount = await this.tokenhold.balanceOf(accounts[4]);
      assert.equal(balanceOfAccount, 0);
      await this.tokenhold.burn(10 * 10 ** 18, { from: accounts[4], gas: 5000000 });
    } catch (error) {

      var error_ = 'VM Exception while processing transaction: revert Not enough balance';
      assert.equal(error.message, error_, 'Reverted ');

    }

  });

  it('Should be able to burn tokens', async () => {

    let balanceOfAccount = await this.tokenhold.balanceOf(accounts[2]);
    assert.equal(balanceOfAccount / 10 ** 18, 1000000);
    await this.tokenhold.burn(1000000 * 10 ** 18, { from: accounts[2], gas: 5000000 });
    let balanceOfBeneficiaryLater = await this.tokenhold.balanceOf(accounts[2]);
    assert.equal(balanceOfBeneficiaryLater / 10 ** 18, 0);
  });

  it('Should check the Total Supply of BTCCToken Tokens after token burnt', async () => {

    let totalSupply = await this.tokenhold.totalSupply();
    assert.equal(totalSupply / 10 ** 18, 299000000);
  });

  it("Should Not be able to Mint Tokens by Non owner account", async () => {

    try {
      let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[3]);
      assert.equal(balanceOfReceiver / 10 ** 18, 0, 'balance account 3');
      await this.tokenhold.mintToken(accounts[3], 1000 * 10 ** 18, { from: accounts[1], gas: 5000000 });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert You are not owner';
      assert.equal(error.message, error_, 'Reverted ');
    }

  });

  it("Should be able to Mint Tokens by owner only and send to accounts[3]", async () => {

    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[3]);
    assert.equal(balanceOfReceiver / 10 ** 18, 0, 'balance account 3');
    await this.tokenhold.mintToken(accounts[3], 1000 * 10 ** 18, { from: accounts[0], gas: 5000000 });
    let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[3]);
    assert.equal(balanceOfReceiverLater / 10 ** 18, 1000);
  });

  it('Should check the minted tokens after minted', async () => {

    let _mintedTokensCount = await this.tokenhold._mintedTokensCount.call();
    assert.equal(_mintedTokensCount/10**18,1000);

  });

  it('Should Not be able to distribute tokens to accounts[6] less then total supply and minted tokens', async () => {

     try {
      let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[6]);
      assert.equal(balanceOfReceiver, 0);
      let distributedTokenCount = await this.tokenhold.distributedTokenCount();
      assert.equal(distributedTokenCount/10**18, 1000000);
      await this.tokenhold.distributeTokens(accounts[6], 298000001 * 10 ** 18, { from: accounts[0], gas: 5000000 });
     }catch(error){
      var error_ = 'VM Exception while processing transaction: revert Distributed Tokens exceeded Total Suuply';
      assert.equal(error.message, error_, 'Reverted ');
     }

  });

  it('Should be able to distribute tokens to accounts[6] less then total supply and minted tokens', async () => {

    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[6]);
    assert.equal(balanceOfReceiver, 0);
    let distributedTokenCount = await this.tokenhold.distributedTokenCount();
    assert.equal(distributedTokenCount/10**18, 1000000);
    await this.tokenhold.distributeTokens(accounts[6], 298000000 * 10 ** 18, { from: accounts[0], gas: 5000000 });

  });

  it('Should check the Total Supply of BTCCToken Tokens after tokens minted', async () => {

    let totalSupply = await this.tokenhold.totalSupply();
    assert.equal(totalSupply / 10 ** 18, 299001000);
  });

  it("Should be able to transfer ownership of token Contract ", async () => {

    let owner = await this.tokenhold.owner.call();
    assert.equal(owner, accounts[0]);
    await this.tokenhold.transferOwnership(accounts[9], { from: accounts[0] });

  });

  it('Should check the New owner of a contract', async () => {

    let newOwner = await this.tokenhold.newOwner();
    assert.equal(newOwner, accounts[9]);

  });

  it("Should be able to Accept ownership of token Contract ", async () => {

    await this.tokenhold.acceptOwnership({ from: accounts[9] });

    let ownerNew = await this.tokenhold.owner.call();
    assert.equal(ownerNew, accounts[9], 'Transfered ownership');
  });

  it('Should check the New owner of a contract after ownership accepted', async () => {

    let owner = await this.tokenhold.owner();
    assert.equal(owner, accounts[9]);

  });

  it("should Approve address to spend specific token ", async () => {

    let allowance = await this.tokenhold.allowance.call(accounts[3], accounts[5]);
    assert.equal(allowance, 0, "allowance is wrong when approve");
    this.tokenhold.approve(accounts[5], 200 * 10 ** 18, { from: accounts[3] });
    let allowanceLater = await this.tokenhold.allowance.call(accounts[3], accounts[5]);
    assert.equal(allowanceLater, 200 * 10 ** 18, "allowance is wrong when approve");

  });

  it("Should be able to transfer Tokens approved by account[3] to acccount[5] ", async () => {

    let balanceOfSender = await this.tokenhold.balanceOf(accounts[5]);
    assert.equal(balanceOfSender / 10 ** 18, 0, 'balance account 5');
    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[3]);
    assert.equal(balanceOfReceiver / 10 ** 18, 1000, 'balance account 3');
    let allowanceLater = await this.tokenhold.allowance.call(accounts[3], accounts[5]);
    assert.equal(allowanceLater, 200 * 10 ** 18, "allowance is wrong when approve");
    await this.tokenhold.transferFrom(accounts[3], accounts[5], 100 * 10 ** 18, { from: accounts[5], gas: 5000000 });
    let balanceOfSenderLater = await this.tokenhold.balanceOf(accounts[3]);
    assert.equal(balanceOfSenderLater / 10 ** 18, 900);
    let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[5]);
    assert.equal(balanceOfReceiverLater / 10 ** 18, 100);

  });

  it("should check the allowance later ", async () => {

    let allowance = await this.tokenhold.allowance.call(accounts[3], accounts[5]);
    assert.equal(allowance.toNumber() / 10 ** 18, 100, "allowance is wrong when approve");

  });

  it("Should be able to burn Tokens approved by account[3] to acccount[5] ", async () => {

    let balanceOfSender = await this.tokenhold.balanceOf(accounts[3]);
    assert.equal(balanceOfSender / 10 ** 18, 900);
    await this.tokenhold.burnFrom(accounts[3], 100 * 10 ** 18, { from: accounts[5], gas: 5000000 });
    let balanceOfSenderLater = await this.tokenhold.balanceOf(accounts[3]);
    assert.equal(balanceOfSenderLater / 10 ** 18, 800);

  });

  it('Should check the Total Supply of BTCCToken Tokens after tokens burn', async () => {

    let totalSupply = await this.tokenhold.totalSupply();
    assert.equal(totalSupply / 10 ** 18, 299000900);
  });

  it('Should correctly initialize constructor values of sample Token Contract', async () => {

    this.sampleHold = await TokenA.new(accounts[0], { from: accounts[0], gas: 60000000 });

  });

  it('Should check the balance of a sample contract Owner', async () => {

    let balanceOfOwner = await this.sampleHold.balanceOf(accounts[0]);
    assert.equal(balanceOfOwner / 10 ** 18, 1000);

  });

  it('Should be able to transfer sample tokens to BTCCToken contract', async () => {

    let balanceOfOwner = await this.sampleHold.balanceOf(accounts[0]);
    assert.equal(balanceOfOwner / 10 ** 18, 1000);
    let balanceOfBeneficiary = await this.sampleHold.balanceOf(this.tokenhold.address);
    assert.equal(balanceOfBeneficiary, 0);
    await this.sampleHold.transfer(this.tokenhold.address, web3.utils.toHex(10 * 10 ** 18), { from: accounts[0], gas: 5000000 });
    let balanceOfOwnerLater = await this.sampleHold.balanceOf(accounts[0]);
    assert.equal(balanceOfOwnerLater / 10 ** 18, 990);
    let balanceOfBeneficiaryLater = await this.sampleHold.balanceOf(this.tokenhold.address);
    assert.equal(balanceOfBeneficiaryLater / 10 ** 18, 10);

  });

  it('Should be able to transfer sample tokens to owner of BTCCToken, sent to contract of BTCCToken', async () => {

    let balanceOfOwnerMMToken = await this.sampleHold.balanceOf(accounts[9]);
    assert.equal(balanceOfOwnerMMToken, 0);
    let balanceOfBeneficiary = await this.sampleHold.balanceOf(this.tokenhold.address);
    assert.equal(balanceOfBeneficiary / 10 ** 18, 10);
    await this.tokenhold.transferAnyERC20Token(this.sampleHold.address, web3.utils.toHex(10 * 10 ** 18), { from: accounts[9], gas: 5000000 });
    let balanceOfOwnerLater = await this.sampleHold.balanceOf(accounts[0]);
    assert.equal(balanceOfOwnerLater / 10 ** 18, 990);
    let balanceOfBeneficiaryLater = await this.sampleHold.balanceOf(accounts[9]);
    assert.equal(balanceOfBeneficiaryLater / 10 ** 18, 10);

  });

  it('Should Not be able to send ethers to contract', async () => {

    try {
      web3.eth.sendTransaction({ from: accounts[0], to: this.tokenhold.address, value: web3.utils.toWei("1", "ether") });
    } catch (error) {
      var error_ = 'VM Exception while processing transaction: revert Reverted the wrongly deposited ETH';
      assert.equal(error.message, error_, 'Reverted ');
    }

  });  

})


