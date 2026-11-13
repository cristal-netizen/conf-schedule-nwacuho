# NWACUHO 2027 | Board Pilot Testing Guide

**Updated:** November 13, 2026  
**Live app:** https://nwacuho.app  
**Audience:** NWACUHO Board, limited invited pilot  
**Suggested time:** 30–45 minutes, depending on platform and cross-account testing.  
**Full printable packet:** See the updated Word/PDF versions shared with the board.

## Start here

- Record tester, date/time, device, OS, browser, and whether using a normal browser or installed Home Screen app.
- For each test, mark **Pass / Fail / Not tested** and record exact steps, expected behavior, and actual behavior for failures.
- Use **non-sensitive, clearly labeled TEST** discussions and meetups. The site is live, and records persist until removed.
- 2027 educational sessions are preliminary; imported committee submissions are not public. Exhibitors and speakers only appear after approval.

## First impression and navigation

- [ ] **01** Open https://nwacuho.app and confirm Vancouver 2027 is the default. NWACUHO header logo is clear; removed fuzzy conference badge does not appear.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **02** Use the year switcher to view Seattle 2026 archive and return to 2027.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **03** Open Exhibitors, Speakers, Venue & Maps, Community, and Networking on desktop/mobile; look for clipping and navigation problems.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________

## Accounts and email confirmation

- [ ] **04** Create an account and open the verification link. It should land on nwacuho.app rather than localhost.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **05** Sign out/in. If confirmation does not work, use Resend confirmation email. Report exact error, and try sign-in after the first confirmation attempt.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________

## Schedule and account-backed agenda

- [ ] **06** Browse February 8–10, switch days, search, and filter. Unapproved educational sessions must not be shown.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **07** Save three preliminary activities. Distinguish 'Saved to your account' from locally stored guest selections.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **08** Fully close browser and reopen. Sign in if needed and confirm the saved activities persist.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **09** Test a different device or installed Home Screen app with the same account and check cloud sync.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **10** Optional: Make one offline agenda change, reconnect, and verify it syncs.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________

## Community, profile and directory privacy

- [ ] **11** Create Community profile, save institution/role/interests, reload and check persistence. Database permissions were updated November 13.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **12** Verify directory listing defaults OFF. Ask a second signed-in tester to verify the profile is invisible.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **13** Opt in, save, and check profile visible to second tester. Opt out and check it disappears.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **14** Add a discussion labeled TEST, reply, and check another signed-in account can read it.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **15** Report a test discussion or reply. Do not include sensitive information.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________

## Mentorship and meetups

- [ ] **16** Save mentorship interests, first-timer status, functional areas, and goals; reload and check values.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **17** Test filters and discoverability, confirming opt-out hides the profile.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **18** Create a clearly labeled TEST meetup at a public location, mark/remove interest, verify Vancouver-local time, and cancel as organizer.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________

## Exhibitors, speakers, venue and devices

- [ ] **19** Open Exhibitor Spotlight and directory. No unconfirmed organizations should appear as confirmed.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **20** Open 2027 Speaker page. If no approved profiles exist, check the coming-soon state.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **21** Visit Venue & Maps; try embedded 360° tour on phone, full-screen fallback, and Marriott floor-plan link.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **22** Add app to iPhone/Android Home Screen; check NWACUHO app icon, return visit and account-backed agenda.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________
- [ ] **23** Test portrait and landscape layouts, touch target sizes, and horizontal overflow.  
  Result: [ ] Pass  [ ] Fail  [ ] Not tested  |  Notes: ____________________

## Bug-report template

**Test ID / page:**  
**Severity:** Critical (privacy or data loss) / High (cannot sign in or save) / Medium / Low  
**Device / OS / browser / Home Screen:**  
**Online or offline / approximate time:**  
**Steps taken:**  
**Expected:**  
**Actual error or behavior:**  
**Screenshot with sensitive information obscured:** Yes / No  

## Board feedback

**Overall experience:** Excellent / Good / Needs improvement / Difficult to use  
**Top improvement before attendee launch:**  
**Ready to recommend to attendees?** Yes / Not yet  

## Safety and known limitations

- Supabase RLS and reply permissions for Community profiles and threads were updated on November 13; the board should retest **real browser flows** with two distinct accounts.
- If confirmation opens localhost, try signing in and then request a new confirmation link if necessary. Record the exact error.
- Safari and installed Home Screen apps may have distinct local storage. Use the same account to verify cross-installation cloud agenda sync.
- The embedded hotel tour depends on third-party browser permissions; use the external full-screen link if needed.
- Do not post private board information, phone numbers, hotel rooms, passwords or attendee personally identifiable information.
- Test content persists. Coordinate deletion of clearly labeled TEST posts, profiles and meetups afterward.
- The board pilot is not final acceptance testing for public attendee rollout.
