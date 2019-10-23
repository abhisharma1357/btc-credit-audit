const BTCCToken = artifacts.require('BTCCToken.sol');
const TokenA = artifacts.require('TokenA.sol');
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract('BTCCToken Token Contract for final audit testing at maximum values', async (accounts) => {

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

  it("Should be able to Mint Tokens by owner only more then total supply", async () => {

    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[1]);
    assert.equal(balanceOfReceiver / 10 ** 18, 0, 'balance account 1');
    await this.tokenhold.mintToken(accounts[1], 400000000*10**18, { from: accounts[0], gas: 5000000 });
    let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[1]);
    assert.equal(balanceOfReceiverLater / 10 ** 18, 400000000);

});

  it('Should check the minted tokens after minted', async () => {

    let _mintedTokensCount = await this.tokenhold._mintedTokensCount.call();
    assert.equal(_mintedTokensCount/10**18,400000000);

  });

  it('Should check the Total Supply of BTCCToken Tokens after tokens minted', async () => {

    let totalSupply = await this.tokenhold.totalSupply();
    assert.equal(totalSupply / 10 ** 18, 700000000);
  });

  it('Should be able to distribute tokens to accounts[1] all the tokens', async () => {

    let balanceOfReceiver = await this.tokenhold.balanceOf(accounts[2]);
    assert.equal(balanceOfReceiver, 0);
    let distributedTokenCount = await this.tokenhold.distributedTokenCount();
    assert.equal(distributedTokenCount, 0);
    await this.tokenhold.distributeTokens(accounts[2], 300000000 * 10 ** 18, { from: accounts[0], gas: 5000000 });
    let balanceOfReceiverLater = await this.tokenhold.balanceOf(accounts[2]);
    assert.equal(balanceOfReceiverLater / 10 ** 18, 300000000);

  });


})


