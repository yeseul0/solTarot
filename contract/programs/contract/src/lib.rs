use anchor_lang::prelude::*;

declare_id!("5xNqgEm9hVUyWydvty8REtEGuLa28JGNtUAoh8x96H2V");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
