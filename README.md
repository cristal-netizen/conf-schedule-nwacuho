# NWACUHO Conference Scheduling App

A Next.js conference companion and committee planning workspace for NWACUHO. The existing production website is **nwacuho.app**. The 2027 work is developed on the **`2027-modernization`** branch and must not be promoted to production until approved and tested.

## Current 2027 development work

The 2027 Vancouver attendee preview is available at `/2027`; the committee workspace is at `/admin`. Preview deployments are generated automatically by Vercel for commits to `2027-modernization`.

**Conference:** NWACUHO Annual Conference, February 8–10, 2027, Sheraton Vancouver Wall Centre, Vancouver, BC. The broader committee planning schedule covers February 6–11, including board and setup/teardown activities. Verify public details, registration and lodging directly against [NWACUHO's conference website](https://nwacuho.org/page/AnnualConference).

### Implemented

- 2027 mobile-responsive attendee homepage with Vancouver-inspired styling and direct links to official registration/hotel information.
- **2027 Community & Networking:** signed-in discussion boards with introductions, meetups, travel/ride sharing, general discussions, and Q&A; threaded replies; report controls; moderator hiding; attendee directory requiring explicit opt-in. Email addresses are not shown publicly.
- Three-day schedule explorer with day tabs, text search, category filtering, device-only guest agenda, and **Supabase-backed attendee accounts** with authenticated agenda syncing across devices.
- Preliminary public outline displayed while the 2027 conference remains unpublished. Only authorized and explicitly published records should enter the live schedule.
- Supabase-backed committee login and role-controlled session, room, track, announcement and guide editing.
- 63 schedule entries imported from the primary 2027 planning workbook as **drafts**, in Vancouver local time.
- Schedule visibility and review fields: 42 attendee-facing entries, 21 internal entries, 7 educational placeholders, and all 63 flagged for review at initial import.
- Ability to create distinct presentation drafts associated with educational program block placeholders.
- Attendee agenda cloud persistence in `attendee_agenda_items` (private RLS by `auth.uid()`), email/password sign-in or sign-up, refreshed sessions, queueing offline changes, and retry on reconnect/reopen. Includes explicit cloud-sync status, guest-to-account import, and JSON export/restore backups.
- Public row-level security that restricts published attendee sessions to approved, ready, non-placeholder, attendee-visible records within a published conference.
- Official 2027 Vancouver conference badge added to `public/branding/nwacuho-2027-badge.svg` and placed in the attendee hero on the development branch; verify its appearance across browsers and viewport sizes.

### Publication safeguards

- The 2027 conference itself remains a **draft**, and all imported entries remain **unpublished** until individually reviewed and approved.
- Internal board/operational activities and placeholder blocks must never appear on the public agenda.
- The primary schedule workbook's alternate Tuesday proposal was **not** imported over primary schedule records.
- Notes in the admin editor flag the Tuesday opening session format and Wednesday Block E/lunch overlap for review.
- Do not modify the production branch or the `nwacuho.app` domain as part of preview development.

### Next priorities

1. Test the new logo on mobile and desktop, including actual image loading and correct aspect ratio. Add approved white/black association wordmarks to the shared header, and consider a simplified app icon.
2. Reconcile the working program outline with the official public conference schedule and the committee's alternate Tuesday proposal. Do not present tentative timings as confirmed.
3. Populate accepted educational sessions, speaker bios, room assignments, tracks and detailed descriptions. Check room/time collisions.
4. Validate Community moderation and participation policies end-to-end: opt-in privacy, posting and replies, reporting, moderator hiding, anti-spam limits, abuse response and retention. Launch should include community guidelines and a staffed reporting process.
5. Build conference navigation, accessible venue map and local area guide after details are verified by LAC.
6. Test sign-in, draft editing, review workflow, RLS, and public visibility with authorized and anonymous accounts.
7. Audit dependencies and remediate build-reported vulnerabilities before production release; Vercel reported 16 vulnerabilities (1 low, 3 moderate, 11 high, 1 critical) during previous builds.
8. Enable Supabase Auth leaked-password protection if available; latest security advisory flagged it as disabled.
9. **iPhone launch gate:** manually test sign-up/email confirmation, login, saved agenda across app relaunches, Safari-to-Home-Screen handoff, airplane mode edits, reconnect, refresh-token expiry, second-device login, browser storage clearing and backup recovery. Cloud status must truthfully reflect server acknowledgement. The new flow has passed build checks, but this real-device testing is not yet complete.
10. Add automated browser E2E and accessibility tests, then plan a separately approved production rollout.

## Project structure

- `app/2027/page.tsx` - 2027 attendee homepage and published-record fetching.
- `app/2027/ScheduleExplorer.tsx` - interactive client-side agenda.
- `app/2027/officialOutline.ts` - **preliminary planning outline**, not a final approved program.
- `app/2027/useAgendaSync.ts` - attendee auth, local/remote agenda reconciliation, offline queue and sync state.
- `app/2027/community/page.tsx` - private community boards, networking directory, and basic moderation tools.
- `public.community_profiles`, `public.community_posts`, `public.community_reports` - community data protected by authenticated row-level security, including opt-in directory visibility.
- `app/admin/page.tsx` - committee login and management workspace.
- `app/admin/SessionManager.tsx` - session editing, draft approval fields, filters and program block tools.
- `public/branding/` - conference brand artwork.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000/2027 for attendee preview and http://localhost:3000/admin for committee tools.

The Preview environment requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; set them through your authorized environment management system. Never commit secrets or copy production credentials into documentation.

## Development history / decisions

- November 2026: provisioned 2027 administrator access and verified sign-in.
- November 2026: imported and secured the 2027 primary schedule; separated internal activities and placeholders; added review controls and individual-presentation drafting.
- November 2026: introduced the 2027 Vancouver attendee homepage, preliminary agenda explorer and official conference badge.
- November 2026: built attendee boards and opt-in networking; initial moderation and reporting included. Community end-to-end tests pending.
- November 2026: addressed 2026 iPhone agenda-loss reports with account-backed persistence and offline queue. Guest saves remain local; account sync requires successful server acknowledgement. Real-device regression testing is pending.
- **Release policy:** all changes stay in Preview pending committee validation and explicit approval for production.
