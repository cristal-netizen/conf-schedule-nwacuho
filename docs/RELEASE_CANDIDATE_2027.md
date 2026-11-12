# NWACUHO 2027 Release Candidate: production-mode testing

**Date:** November 12, 2026
**Candidate branch:** `2027-release-candidate`
**Source commit:** `2642a161fcca0a9ba7b2080e1a3d79dec9bfba6f` from `2027-modernization`
**Environment:** Vercel isolated Preview candidate; production-optimized Next.js build, **NOT** live domain promotion.
**Existing public domain:** `nwacuho.app` remains assigned to the 2026 production app pending approval.

## Why live production is blocked

- The Vercel project environment includes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only for **Preview**. They do not currently target Production. Promoting 2027 to production with this configuration would disable database-dependent functionality.
- npm audit in Vercel builds reports **16 dependency advisories**, including one critical and eleven high. Investigate, upgrade and re-run security scanning before release.
- The new 2027 attendee sign-in, agenda cloud sync, offline retry, discussion boards, networking privacy, meetup creation and moderation require real account and device E2E testing.
- 2027 programming is in draft; the public homepage still shows a *preliminary planning outline*. The candidate does not publish the 63 committee draft sessions.
- User acceptance and formal confirmation that replacing the older public app is acceptable have not yet happened.

## Testing plan

### 1. Conference routes and navigation
- [ ] /2027 homepage works on desktop, iPhone Safari, and installed iPhone Home Screen app.
- [ ] Branding, icons and contrast correct. Replace badge derivative with archived source artwork.
- [ ] Schedule day tabs, filters, search, event labels and Vancouver time display correct.
- [ ] No internal sessions, unreviewed sessions or placeholders shown publicly.

### 2. Accounts and My Agenda
- [ ] Create attendee account, confirm email, sign in and sign out.
- [ ] Save 3 sessions, receive explicit **Synced to your account** confirmation.
- [ ] Quit Safari completely and reopen. All 3 sessions persist.
- [ ] Install site to iPhone Home Screen, sign in and verify same agenda.
- [ ] Repeat after device restart and after clearing Safari site data (sign back in).
- [ ] Switch to another device with same account. Verify cloud reconciliation.
- [ ] Offline: save/remove, reopen app, reconnect; verify conflict handling and no silent data loss.
- [ ] Guest agenda, export/import backup, and opt-in import to account work.

### 3. Community and privacy
- [ ] Two distinct attendee accounts and one moderator account.
- [ ] Discussion topics, replies, reporting, hiding/restoring and moderator permissions.
- [ ] Directory opt-in defaults to false. Non-opted-in profiles invisible to other accounts.
- [ ] Mentor/mentee compatibility, first-timer and functional area preferences honor privacy.
- [ ] Public meetup posting, organizer cancellation, private interest lists and date/time correctness.
- [ ] Rate limiting, anti-spam controls, content moderation staffing and meetup reporting process before opening to real attendees.

### 4. Security and performance
- [ ] Enable and validate leaked-password protection in Supabase Auth.
- [ ] Audit 16 dependency findings, resolve high/critical risks.
- [ ] Validate all RLS using anonymous, attendee A, attendee B, editor and admin.
- [ ] Confirm no PII/leaked keys in client or logs.
- [ ] Browser accessibility, focus, screen-reader labels and touch targets.
- [ ] Load/performance testing and network interruption recovery.

### 5. Release approval and rollback
- [ ] Ensure Production environment has correct Supabase variables and auth redirect URLs.
- [ ] Create isolated production-configured Vercel deployment with domain assignment disabled.
- [ ] Smoke-test exact release SHA and production configuration.
- [ ] Confirm owner approval to update `nwacuho.app`; verify 2026 legacy links/redirects first.
- [ ] Promote release, verify HTTP response, auth, agenda sync and logs.
- [ ] Document rollback target `dpl_3eaK9jf33Qs7jjnPSs73zobNSWG9` (2026 production at initial assessment) and confirm it remains valid immediately before cutover.

**Do not assume compilation alone proves attendee workflows or iPhone compatibility.**
