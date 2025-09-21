use anchor_lang::prelude::*; // Anchor 기본 기능들
use anchor_spl::{
    associated_token::AssociatedToken, // ATA(Associated Token Account) 생성
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata}, // NFT 메타데이터 생성 함수들
    token::{mint_to, Mint, MintTo, Token, TokenAccount}, // 토큰 민팅 관련
};
use mpl_token_metadata::types::{DataV2, Creator};// NFT 메타데이터 구조체

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

//메인 프로그램 모듈
#[program]
pub mod contracts {
    use super::*;

    pub fn mint_tarot_nft(
        ctx: Context<MintTarotNft>,
        nft_name: String,              // NFT이름 (메타데이터용) "타로 리딩 #001"
        spread_type: String,           // 스프레드 종류
        cards: Vec<TarotCard>,         // 뽑힌 카드들 벡터
        ai_feedback: String,           // AI 해석 텍스트
        image_cid: String,             // 피나타 이미지 CID
        metadata_cid: String,          // 피나타 메타데이터 Json CID
    ) -> Result<()> {
        
        // NFT 1개 민팅
        mint_to(
            CpiContext::new( //Cross-Program Invocation 컨텍스트 생성
                ctx.accounts.token_program.to_account_info(), //SPL 토큰 프로그램 참조
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),//민팅할 토큰(민트계정)
                    to: ctx.accounts.token_account.to_account_info(), //토큰을 받을 계정
                    authority: ctx.accounts.payer.to_account_info(), //민팅 권한자(지갑 소유자)
                },
            ),
            1, //1개!
        )?;

        // 타로 리딩 데이터 저장 (PDA 계정)
        let tarot_reading = &mut ctx.accounts.tarot_reading; //내가 아래에 정의한 타로 리딩 계정임!!
        tarot_reading.spread_type = spread_type; //스프레드 타입 (parameter로 받은 값)
        tarot_reading.cards = cards; //뽑힌 카드들 (parameter로 받은 값)
        tarot_reading.ai_feedback = ai_feedback; //AI 해석 (parameter로 받은 값)
        tarot_reading.reading_timestamp = Clock::get()?.unix_timestamp; //(타임스탬프 자동생성)
        tarot_reading.image_cid = image_cid; //이미지 CID (parameter로 받은 값 복사!!)
        tarot_reading.metadata_cid = metadata_cid.clone(); //메타데이터 CID (parameter로 받은 값) (아래에 메타데이터에 사용할거라서 아직 소유권 이전하면 안됨. ->clone)
        tarot_reading.owner = ctx.accounts.payer.key(); // (민팅 권한자)소유자 지갑 주소
        tarot_reading.mint = ctx.accounts.mint.key(); // 민트 주소

        // NFT 메타데이터 (창작자 정보)
        let creators = vec![Creator {
            address: ctx.accounts.payer.key(), //창작자 지갑 주소
            verified: false, //검증 여부 (false로 설정)
            share: 100, //수익 배분 비율 (100%로 설정) -> 필요한가? 몰라 일단 넣어
        }];

        // NFT 메타데이터 (DataV2 구조체)
        let data_v2 = DataV2 {
            name: nft_name,
            symbol: "SOLTAROT".to_string(),
            uri: format!("https://gateway.pinata.cloud/ipfs/{}", metadata_cid), //json 메타데이터 URI
            seller_fee_basis_points: 500, //판매수수료
            creators: Some(creators),
            collection: None,
            uses: None,
        };

        create_metadata_accounts_v3( 
            CpiContext::new( //Cross-Program Invocation 컨텍스트 생성
                ctx.accounts.token_metadata_program.to_account_info(), //메타플렉스 토큰 메타데이터 프로그램 참조
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),//메타데이터 계정
                    mint: ctx.accounts.mint.to_account_info(),//연결될 민트계정
                    mint_authority: ctx.accounts.payer.to_account_info(),//민트 권한자
                    update_authority: ctx.accounts.payer.to_account_info(),//메타데이터 업데이트 권한자
                    payer: ctx.accounts.payer.to_account_info(), //수수료 지불자
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            data_v2,//위에서 만든 메타데이터 정보
            true, //(is_mutable)메타데이터 수정 가능 여부
            true, // (update_authority_is_signer)업데이트 권한자가 서명자인지 여부
            None,
        )?;

        msg!("타로 NFT 민팅 완료!");
        msg!("스프레드: {}", tarot_reading.spread_type);
        msg!("카드 수: {}", tarot_reading.cards.len());
        
        Ok(())
    }
}

// 타로 카드 구조체
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TarotCard {
    pub name: String, // 카드 이름("The Fool")
    pub is_reversed: bool, // 카드가 역방향인지 여부
    pub position: String, // 카드 위치 설명("Past", "Present", "Future" 등)
}

// 타로 리딩 데이터 계정
#[account]
pub struct TarotReading {
    pub spread_type: String,           // 32 bytes
    pub cards: Vec<TarotCard>,         // 가변 길이
    pub ai_feedback: String,           // 가변 길이
    pub reading_timestamp: i64,        // 8 bytes
    pub image_cid: String,             // 64 bytes
    pub metadata_cid: String,          // 64 bytes
    pub owner: Pubkey,                 // 32 bytes
    pub mint: Pubkey,                  // 32 bytes
}

// 계정 구조체
#[derive(Accounts)]
pub struct MintTarotNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint, //위에서 생성한 mint랑 연결
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    // 타로 데이터 저장 pda 생성
    #[account(
        init,
        payer = payer,
        space = 8 + 1200, // 충분한 공간 할당
        seeds = [b"tarot_reading", mint.key().as_ref()],
        bump
    )]
    pub tarot_reading: Account<'info, TarotReading>,
    
    /// CHECK: 메타플렉스 프로그램에서 검증
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
