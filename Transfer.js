//importing functions and objects from the library 
const { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Generate sender keypair
const senderKeypair = Keypair.generate();
console.log("Sender wallet address:", senderKeypair.publicKey.toBase58());

// Generate receiver keypair
const receiverKeypair = Keypair.generate();
console.log("Receiver wallet address:", receiverKeypair.publicKey.toBase58());

// Establish connection to the devnet cluster
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Airdrop SOL to the sender wallet
(async () => {
  const airdropSignature = await connection.requestAirdrop(senderKeypair.publicKey, 2* LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSignature);
  const senderBalance = await connection.getBalance(senderKeypair.publicKey);
  console.log(`Sender wallet balance: ${(senderBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
})();

// Wait for airdrop confirmation and transfer half of the sender's balance to the receiver
setTimeout(async () => {
  const senderAccountInfo = await connection.getAccountInfo(senderKeypair.publicKey);
  const senderBalance = senderAccountInfo.lamports;
  const transferAmount = senderBalance / 2;
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: receiverKeypair.publicKey,
      lamports: transferAmount,
    })
  );
  const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
  console.log(`Transfer of ${(transferAmount / LAMPORTS_PER_SOL).toFixed(2)} SOL from sender to receiver confirmed with signature ${signature}`);
  const receiverBalance = await connection.getBalance(receiverKeypair.publicKey);
  console.log(`Receiver wallet balance: ${(receiverBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
}, 10000);