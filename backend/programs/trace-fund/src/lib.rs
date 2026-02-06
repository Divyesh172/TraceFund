use anchor_lang::prelude::*;

// ⚠️ IMPORTANT: If your terminal says "Program ID mismatch", update this string
// to match what 'anchor keys list' or the error message shows.
declare_id!("ZHHQoMucs84CjvZpQiXMqcGxgeEV6vzeLZvJ4xqadNv");

#[program]
pub mod trace_fund {
    use super::*;

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        name: String,
        description: String,
        target_amount: u64,
        image_url: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.admin = *ctx.accounts.user.key;

        // FIX: We clone the name string here so we can use the original one later for the Event
        campaign.name = name.clone();

        campaign.description = description;
        campaign.target_amount = target_amount;
        campaign.amount_collected = 0;
        campaign.image_url = image_url;

        // Set the start time to the current blockchain timestamp
        campaign.start_time = Clock::get()?.unix_timestamp;

        // Emit an event so the frontend knows a new campaign exists immediately
        emit!(CampaignCreated {
            admin: campaign.admin,
            name, // We use the original 'name' variable here
            target_amount,
        });
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        // Validation: Minimum donation of ~0.001 SOL to prevent spam
        require!(amount >= 1_000_000, ErrorCode::DonationTooSmall);

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

        // Emit event for real-time frontend updates
        emit!(DonationEvent {
            campaign: campaign.key(),
            donor: ctx.accounts.donor.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, reason: String) -> Result<()> {
            let campaign = &mut ctx.accounts.campaign;
            let admin = &mut ctx.accounts.admin;

            require!(campaign.admin == *admin.key, ErrorCode::Unauthorized);

            let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
            let available_funds = **campaign.to_account_info().lamports.borrow() - rent_balance;

            require!(amount <= available_funds, ErrorCode::InsufficientFunds);

            **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
            **admin.to_account_info().try_borrow_mut_lamports()? += amount;

            emit!(WithdrawalEvent {
                campaign: campaign.key(),
                amount,
                reason, // Now we know WHY money moved
                timestamp: Clock::get()?.unix_timestamp,
            });

            Ok(())
        }

    // Allows the admin to close the campaign and recover the rent (SOL) stored in the account
    pub fn close_campaign(_ctx: Context<CloseCampaign>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
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

#[event]
pub struct WithdrawalEvent {
    pub campaign: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub timestamp: i64,
}

#[derive(Accounts)]
pub struct CloseCampaign<'info> {
    #[account(
        mut,
        close = admin, // This magic line closes the account and sends rent to admin
        has_one = admin @ ErrorCode::Unauthorized
    )]
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
    pub start_time: i64,
}

#[event]
pub struct CampaignCreated {
    pub admin: Pubkey,
    pub name: String,
    pub target_amount: u64,
}

#[event]
pub struct DonationEvent {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not the admin of this campaign.")]
    Unauthorized,
    #[msg("Not enough funds in the campaign.")]
    InsufficientFunds,
    #[msg("Donation must be at least 0.001 SOL.")]
    DonationTooSmall,
}