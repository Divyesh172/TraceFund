use anchor_lang::prelude::*;

// This is your Program ID. SolPG will update this automatically.
declare_id!("EsmhPV4zewvLtdrnYfQ8DA5bNQRqzuq5W3UvNVwpuqRE");

#[program]
pub mod trace_fund {
    use super::*;

    // 1. Initialize
    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        name: String,
        description: String,
        target_amount: u64,
        image_url: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.admin = *ctx.accounts.user.key;
        campaign.name = name;
        campaign.description = description;
        campaign.target_amount = target_amount;
        campaign.amount_collected = 0;
        campaign.image_url = image_url;
        Ok(())
    }

    // 2. Donate
    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        let instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donor.key(),
            &ctx.accounts.campaign.to_account_info().key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &instruction,
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let campaign = &mut ctx.accounts.campaign;
        campaign.amount_collected += amount;
        Ok(())
    }

    // 3. Withdraw
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let admin = &mut ctx.accounts.admin;
        require!(campaign.admin == *admin.key, ErrorCode::Unauthorized);

        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        let available_funds = **campaign.to_account_info().lamports.borrow() - rent_balance;
        require!(amount <= available_funds, ErrorCode::InsufficientFunds);

        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        **admin.to_account_info().try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

// --- Data Structures ---

#[derive(Accounts)]
// FIX: Added this instruction macro so seeds can use arguments
#[instruction(name: String, description: String, target_amount: u64, image_url: String)]
pub struct InitializeCampaign<'info> {
    #[account(
        init,
        payer = user,
        space = 9000,
        seeds = [b"campaign", user.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub donor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[account]
pub struct Campaign {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub target_amount: u64,
    pub amount_collected: u64,
    pub image_url: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not the admin of this campaign.")]
    Unauthorized,
    #[msg("Not enough funds in the campaign.")]
    InsufficientFunds,
}