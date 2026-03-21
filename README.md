# Golf Charity Subscription Platform

Hey there. This is my submission for the Golf Charity Platform assignment. 

The goal here was to build a subscription-based app where golfers can log their rounds, enter monthly draws, and donate a portion of their subscription to a charity of their choice. 

Instead of going with the typical "green fairways and plaid" golf theme, I decided to build something much more modern and sleek. The UI focuses heavily on the charitable impact and uses a dark, glassmorphism design with Framer Motion for smooth interactions. It's fully responsive and built with mobile in mind.

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS + Framer Motion
- **Backend:** Supabase (Auth, Postgres, Storage)
- **Deployment:** Vercel

## Core Features I Implemented
- **Auth & Subscriptions:** Users can sign up, pick a charity, and "subscribe" to gain access to the dashboard.
- **Score Logging Engine:** Users submit their Stableford scores (1-45). The system automatically tracks their top 5 rolling scores for the monthly draws.
- **Dynamic Draw System:** The core engine that distributes the prize pools. It calculates the Match 3, 4, and 5 winners, handles jackpot rollovers if no one hits all 5, and calculates the exact charity contributions. 
- **Admin Console:** A dedicated CMS where admins can manage the charity roster, manually trigger the monthly draws (random or performance-based algorithms), and verify proof-of-payout receipts uploaded by winners. 

## Scalability additions
Per the assignment constraints regarding scalability, the architecture and UI are already primed for future expansions. If you poke around the Dashboard and Admin panel, you'll see modules ready for:
- Corporate / Team accounts
- Targeted Campaign modules 
- Global (UK) regional rollouts and Mobile app deployment

## How to Test It
Since the requirements stated this needs to be deployed to a fresh Supabase instance, the live database won't have pre-seeded test accounts. To evaluate it:

1. **User Flow:** Just click "Join the club" on the login screen to create a test user. You can pick a charity, log some dummy scores, and check out the dashboard.
2. **Admin Flow:** Once you're logged in with your test user, simply hit the "Admin Console" link in the navigation bar. You'll be able to see the backend Charity CMS, run a simulation of the draw engine, and check out the verification portal. 

---
*Note: Ensure you add your Supabase URL and Anon Key to your `.env` file if you plan on running this locally via `npm run dev`.*
