const StellarSdk = require('stellar-sdk');
const fs = require('fs');

async function deploy() {
  console.log('🪙 نشر BIDX Token...\n');

  const issuer = StellarSdk.Keypair.random();
  const distributor = StellarSdk.Keypair.random();

  console.log('📛 المُصدر:', issuer.publicKey());
  console.log('📦 الموزع:', distributor.publicKey());

  // تمويل
  console.log('⏳ تمويل الحسابات...');
  await fetch('https://api.testnet.minepi.com/friendbot?addr=' + issuer.publicKey());
  await fetch('https://api.testnet.minepi.com/friendbot?addr=' + distributor.publicKey());
  console.log('✅ تم التمويل');

  // انتظار 5 ثواني لتجهيز الحسابات
  console.log('⏳ انتظار 5 ثواني لتجهيز الحسابات...');
  await new Promise(r => setTimeout(r, 5000));

  const server = new StellarSdk.Horizon.Server('https://api.testnet.minepi.com');
  
  try {
    // تحميل حساب المُصدر
    console.log('⏳ تحميل حساب المُصدر...');
    const account = await server.loadAccount(issuer.publicKey());
    console.log('✅ الحساب جاهز');

    // بناء المعاملة
    const fee = await server.fetchBaseFee();
    console.log('⏳ بناء المعاملة...');
    
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: fee,
      networkPassphrase: 'Pi Testnet ; December 2021'
    })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset('BIDX', issuer.publicKey()),
        source: distributor.publicKey()
      })
    )
    .addOperation(
      StellarSdk.Operation.payment({
        destination: distributor.publicKey(),
        asset: new StellarSdk.Asset('BIDX', issuer.publicKey()),
        amount: '100000000',
        source: issuer.publicKey()
      })
    )
    .setTimeout(60)
    .build();

    console.log('⏳ توقيع المعاملة...');
    tx.sign(issuer);
    tx.sign(distributor);

    console.log('⏳ إرسال المعاملة...');
    const result = await server.submitTransaction(tx);
    
    console.log('');
    console.log('🎉🎉🎉 تم النشر بنجاح! 🎉🎉🎉');
    console.log('TX:', result.hash);

    // حفظ
    const config = {
      token: {
        code: 'BIDX',
        name: 'BIDX Token',
        issuer: issuer.publicKey(),
        distributor: distributor.publicKey(),
        totalSupply: '100000000'
      },
      keys: {
        issuerSecret: issuer.secret(),
        distributorSecret: distributor.secret()
      },
      txHash: result.hash,
      network: 'pi_testnet',
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync('token-config.json', JSON.stringify(config, null, 2));
    console.log('✅ token-config.json محفوظ!');

  } catch(err) {
    console.log('');
    console.log('⚠️ فشلت المعاملة - حفظ المفاتيح');
    console.log('❌ خطأ:', err.response?.data?.extras?.result_codes || err.message);
    
    // حفظ المفاتيح للاستخدام اليدوي
    const config = {
      token: {
        code: 'BIDX',
        issuer: issuer.publicKey(),
        distributor: distributor.publicKey()
      },
      keys: {
        issuerSecret: issuer.secret(),
        distributorSecret: distributor.secret()
      },
      network: 'pi_testnet',
      createdAt: new Date().toISOString(),
      note: 'فشلت المعاملة - استخدم Pi Developer Portal'
    };

    fs.writeFileSync('token-config.json', JSON.stringify(config, null, 2));
    console.log('✅ المفاتيح محفوظة في token-config.json');
    console.log('');
    console.log('📋 يمكنك متابعة النشر يدوياً من:');
    console.log('   https://developers.minepi.com');
  }
}

deploy();
