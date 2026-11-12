# NWACUHO 2027 Board Demo

**Board demo date:** November 13, 2026  
**Public URL:** https://nwacuho.app  
**Live deployment:** `dpl_HWXZKbAA8zuwYu8miV2K61zkcvH9`  
**Released source SHA:** `8a559c699a3310655d5147eb32c5d37337bc4ac3`  
**Release environment:** Vercel Production, Supabase configured for Production and Preview.

## Suggested demo flow (5–8 minutes)

1. **Open https://nwacuho.app.** Visitors land in the Vancouver 2027 experience by default. Point out conference identity, dates, venue, official registration/hotel links, and mobile-friendly design.
2. **Explore the preliminary schedule.** Switch February 8–10, search events, filter by type, star a session, and show My Agenda. Clearly describe these as *preliminary planning activities* and not the accepted educational session program.
3. **Explain reliable My Agenda saving.** Guest selections stay on one browser. Signed-in attendees can sync selections to Supabase, receive sync status, queue offline edits, retry, and export/restore a backup. Avoid claiming iPhone persistence is fully verified until device test passes.
4. **Visit Community** at https://nwacuho.app/2027/community. Signed-in attendees can post introductions, discussions, questions, and meetup messages. Networking directory is opt-in; personal email addresses are not displayed.
5. **Visit Networking** at https://nwacuho.app/2027/community/connect. Show mentorship interests, first-time attendee discovery, functional-area filters, and public meeting-point gatherings. These features need separate attendee accounts for interactive testing.
6. **Switch to 2026 Seattle archive** at https://nwacuho.app/2026, which retains access to the previous-year experience.
7. **If appropriate, demonstrate the Committee Workspace** at https://nwacuho.app/admin using an authorized editor account. Do not show attendee PII or private planning notes publicly.

## What is *not* final

- The 2027 Supabase conference record is `draft`, with 63 imported planning records and zero published educational sessions at release time. No committee drafts are publicly published.
- Accepted session titles, speakers and final room allocations have not been published.
- Real iPhone Safari, Home Screen app and cross-device account recovery tests remain release gates.
- Community moderation is in early form; anti-spam rate limits and user reporting exist, but staff escalation procedures, meetup-specific reporting, and full two-account RLS testing remain.
- Supabase Auth leaked-password protection is reported disabled. Enable through Supabase Auth settings before inviting broad attendee registrations.
- The production dependency audit, using the compatible upgraded dependency set, found **zero runtime vulnerabilities** (`npm audit --omit=dev`). The full audit retained seven moderate development-tool findings; no high or critical findings. The repository package lockfile needs reconciliation with the newer package overrides for reproducible `npm ci` installs.
- Email confirmation links, login sessions, and actual posting have not been end-to-end tested in Production.

## Release / rollback

- Current Production deployment: `dpl_HWXZKbAA8zuwYu8miV2K61zkcvH9` on `nwacuho.app`.
- Previous known 2026 Production deployment: `dpl_3eaK9jf33Qs7jjnPSs73zobNSWG9` (verify validity before rollback).
- Previous integrated 2027 Production deployment: `dpl_3RZNnT8C7WN15uRgaPGA9FwY6TV9`.
- For incidents, revert aliases using Vercel deployment promotion/rollback with the appropriate team/project; confirm homepage and auth behavior after any action.

**Important:** Board demo availability is not equivalent to a tested public attendee launch.
