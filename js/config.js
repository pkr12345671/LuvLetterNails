/* =========================================================
   Luv Letter — backend config
   ---------------------------------------------------------
   Paste your Supabase project values below to turn on LIVE booking
   (client logins, real-time availability, no double-booking, and
   booking notifications). See SETUP-SUPABASE.md for the 10-minute setup.

   Until these are filled in, the site stays in "request mode" — the
   scheduler still works and sends you an email/Formspree request,
   just without live availability or logins. Nothing breaks if empty.

   These two values are SAFE to commit — the anon key is a public key,
   and your data is protected by Row-Level Security in Supabase.
   (Never put your service_role / secret key here.)
   ========================================================= */
window.LUVLETTER = {
  SUPABASE_URL: "",        // e.g. "https://abcdxyz.supabase.co"
  SUPABASE_ANON_KEY: "",   // the project's "anon public" API key
};
