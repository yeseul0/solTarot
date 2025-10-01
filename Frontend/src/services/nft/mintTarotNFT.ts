//import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";

// 직접 Associated Token Address 계산하는 함수
function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  programId: PublicKey = TOKEN_PROGRAM_ID
): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [
      owner.toBytes(),
      programId.toBytes(),
      mint.toBytes(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

// Metaplex Program ID를 직접 정의
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const TAROT_PROGRAM_ID = new PublicKey("7eDZ3HhU6Gg1hDdVrnS3V98oHN4fWCfGEnum7FxXjoVK");

export async function mintTarotNFT(
  program: Program,
  wallet: { publicKey: PublicKey },
  nftName: string,
  metadataCid: string
) {
  const mintKeypair = Keypair.generate();
  
  const tokenAccount = getAssociatedTokenAddress(
    mintKeypair.publicKey,
    wallet.publicKey
  );
  
  const [tarotReadingPDA] = PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("tarot_reading"), mintKeypair.publicKey.toBytes()],
    program.programId
  );
  
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode("metadata"),
      METADATA_PROGRAM_ID.toBytes(),
      mintKeypair.publicKey.toBytes(),
    ],
    METADATA_PROGRAM_ID
  );
  
  const tx = await program.methods
    .mintTarotNft(nftName, metadataCid)
    .accounts({
      payer: wallet.publicKey,
      mint: mintKeypair.publicKey,
      tokenAccount: tokenAccount,
      tarotReading: tarotReadingPDA,
      metadata: metadataPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenMetadataProgram: METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([mintKeypair])
    .rpc();
  
  return {
    signature: tx,
    mintAddress: mintKeypair.publicKey.toString(),
    tokenAddress: tokenAccount.toString(),
  };
}