const StellarSdk = require('stellar-sdk');
const fs = require('fs');

const PI_TESTNET = {
  horizon: 'https://api.testnet.minepi.com',
  networkPassphrase: 'Pi Testnet ; December 2021'
};

async function setup() {
  const config = JSON.parse(fs.readFileSync('token-config.json', 'utf8'));
  const issuer = StellarSdk.Keypair.fromSecret(config.keys.issuer);
  const server = new StellarSdk.Horizon.Server(PI_TESTNET.horizon);
  const account = await server.loadAccount(issuer.publicKey());

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: PI_TESTNET.networkPassphrase
  })
    .addOperation(StellarSdk.Operation.manageSellOffer({
      selling: new StellarSdk.Asset('BIDX', config.token.issuer),
      buying: StellarSdk.Asset.native(),
      amount: '1000000',
      price: '0.01'
    }))
    .setTimeout(30)
    .build();

  tx.sign(issuer);
  const result = await server.submitTransaction(tx);

  console.log('✅ DEX جاهز!');
  console.log('TX:', result.hash);
  console.log('السعر: 0.01 Pi/BIDX');
}

setup().catch(err => console.error('❌', err.message));
