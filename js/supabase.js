/* =========================================================
   Luv Letter — Supabase client + booking API
   ---------------------------------------------------------
   Thin wrapper around supabase-js (loaded as the global `supabase`
   from the CDN <script> in index.html / admin.html).

   Exposes `window.LLBooking`:
     .enabled                 → false until config.js has real keys
     .onAuth(cb)              → subscribe to sign-in/out; returns current user
     .getUser()               → current user or null
     .sendCode(email)         → email a 6-digit sign-in code (OTP)
     .verifyCode(email, code) → verify the code, signing the user in
     .signOut()
     .busyRanges(fromISO, toISO) → [{start_ts, end_ts}] of taken/blocked time
     .createBooking(b)        → insert a booking (returns {data, error, taken})
     .myBookings()            → the signed-in user's upcoming bookings
     .cancelBooking(id)
     .onBusyChange(cb)        → realtime: fires when bookings change
   ========================================================= */
(function () {
  const cfg = window.LUVLETTER || {};
  const lib = window.supabase; // supabase-js UMD global
  const ready = !!(lib && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  if (!ready) {
    window.LLBooking = { enabled: false };
    return;
  }

  const sb = lib.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  // make sure a profile row exists for the signed-in user
  async function ensureProfile(extra) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    await sb.from("profiles").upsert(
      { id: user.id, email: user.email, ...(extra || {}) },
      { onConflict: "id" }
    );
    return user;
  }

  window.LLBooking = {
    enabled: true,
    sb,

    onAuth(cb) {
      sb.auth.onAuthStateChange((_event, session) => cb(session ? session.user : null));
      return sb.auth.getUser().then((r) => r.data.user || null);
    },
    async getUser() {
      const { data } = await sb.auth.getUser();
      return data.user || null;
    },
    sendCode(email) {
      // shouldCreateUser:true → first-timers get an account automatically
      return sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    },
    verifyCode(email, code) {
      return sb.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    },
    signOut() {
      return sb.auth.signOut();
    },

    async busyRanges(fromISO, toISO) {
      const { data, error } = await sb
        .from("busy_slots")
        .select("start_ts,end_ts")
        .gte("end_ts", fromISO)
        .lte("start_ts", toISO);
      if (error) throw error;
      return data || [];
    },

    async createBooking(b) {
      const user = await ensureProfile({ full_name: b.name, phone: b.phone });
      if (!user) return { error: { message: "Please sign in first." } };
      const { data, error } = await sb
        .from("bookings")
        .insert({
          user_id: user.id,
          service_name: b.service_name,
          addons: b.addons || [],
          start_ts: b.start_ts,
          end_ts: b.end_ts,
          price_estimate: b.price_estimate,
          notes: b.notes,
        })
        .select()
        .single();
      // 23P01 = exclusion_violation → the slot was taken in the meantime
      const taken = !!error && (error.code === "23P01" || /exclu/i.test(error.message || ""));
      return { data, error, taken };
    },

    async myBookings() {
      const { data } = await sb
        .from("bookings")
        .select("*")
        .neq("status", "cancelled")
        .gte("start_ts", new Date().toISOString())
        .order("start_ts");
      return data || [];
    },

    cancelBooking(id) {
      return sb.from("bookings").update({ status: "cancelled" }).eq("id", id);
    },

    onBusyChange(cb) {
      return sb
        .channel("busy")
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, cb)
        .subscribe();
    },
  };
})();
