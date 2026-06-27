# Turning on live booking (Supabase) — ~15 minutes

By default the site runs in **request mode** (the scheduler emails you a request).
Follow these steps to upgrade it to **live booking**: client logins, a calendar
that updates in real time (no double-booking), and an email to you for every
booking — all while your site stays a static site on GitHub Pages.

You'll create two free accounts: **Supabase** (the database + logins) and
**Resend** (the notification email). No credit card needed for the free tiers.

---

## 1. Create the Supabase project
1. Go to **https://supabase.com** → sign up → **New project**.
2. Name it (e.g. "luvletter"), set a database password, pick a region near you.
3. Wait ~2 min for it to finish provisioning.

## 2. Create the tables
1. In your project: **SQL Editor → New query**.
2. Open **`supabase/schema.sql`** from this repo, copy everything, paste it in, **Run**.
   You should see "Success". (It's safe to re-run.)

## 3. Connect the site
1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open **`js/config.js`** in this repo and paste them in:
   ```js
   window.LUVLETTER = {
     SUPABASE_URL: "https://YOURPROJECT.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...the anon public key...",
   };
   ```
   Commit/push (these two values are safe to commit — they're public keys, and
   your data is protected by the security rules in the schema).

## 4. Make yourself the admin
1. Open your live site, go to **Book**, start a booking, and **sign in with the
   email code** once (this creates your account). You can stop there.
2. Back in Supabase **SQL Editor**, run (using the email you signed in with):
   ```sql
   update public.profiles set is_admin = true where email = 'YOUR@EMAIL';
   ```
3. Now visit **`/admin.html`** on your site and sign in — you'll see the dashboard.

## 5. Turn on real-time updates (so slots disappear live)
- Supabase: **Database → Replication** → enable replication for the **`bookings`**
  table. (Optional but recommended — without it, the calendar still refreshes
  each time someone opens a date.)

## 6. Booking notification email (Resend)
1. Go to **https://resend.com** → sign up → **API Keys → Create** → copy the key.
2. Deploy the function and set its secrets. Easiest is the Supabase CLI
   (https://supabase.com/docs/guides/cli), from this repo folder:
   ```bash
   supabase login
   supabase link --project-ref YOURPROJECTREF
   supabase functions deploy notify --no-verify-jwt
   supabase secrets set RESEND_API_KEY=re_xxx ARTIST_EMAIL=you@email.com \
     FROM_EMAIL="Luv Letter <onboarding@resend.dev>"
   ```
   (`onboarding@resend.dev` works immediately; later you can verify your own
   domain in Resend to send from your address.)
3. Hook the function to new bookings: Supabase **Database → Webhooks → Create**:
   - Table: **bookings**, Events: **Insert**
   - Type: **Supabase Edge Function** → choose **notify**.

That's it — book a test appointment and you should get an email + see it in
`admin.html`, and the slot should disappear from the calendar.

---

## How it behaves
- **Empty `js/config.js`** → request mode (emails you, like before). Nothing breaks.
- **Keys filled in** → live mode: clients sign in with a 6-digit email code,
  booking a slot writes it to the database, the slot is removed for everyone else
  (enforced atomically — two people can't grab the same time), and you get an
  email + an entry in the admin dashboard.

## Costs
- Supabase + Resend free tiers are generous for a solo business — no expected
  monthly cost. SMS and online deposits are a future (Phase 2) add-on.

## Day-to-day (admin.html)
- **Confirm** or **Cancel** bookings (cancelling frees the slot again).
- **Block off time** for days off / breaks so those times stop being offered.
- Services, hours, add-ons, and prices are still edited in the `BOOKING` object
  in `js/main.js`.
