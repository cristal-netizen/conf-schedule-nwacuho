# Board pilot test guide | NWACUHO 2027

**Board testing URL:** https://nwacuho.app
**Testing phase:** Limited, invited board pilot; not a final attendee launch
**Date:** November 13, 2026
**2027 schedule:** Preliminary outline only. Submitted educational programs, final speakers, and rooms have not been published.

## Suggested board testing (10 to 15 minutes)

1. Open the site and confirm you see the **2027 Vancouver badge** and **NWACUHO logo**. Check that the header and badge are readable on both desktop and iPhone.
2. Explore the schedule, switch dates, search, and star three activities.
3. Choose **Sign in / Create account**. Use a unique password; confirm email if requested. Wait for a visible **Saved to your account** message, not merely **Saved on this device**.
4. Fully close Safari or your browser, reopen https://nwacuho.app, sign in if necessary, and check whether all three activities reappear.
5. On iPhone, use **Add to Home Screen**, open the installed version, sign in, and verify that the agenda follows your account. Verify the **NW** app icon appears instead of the old 2026 icon. Home Screen apps may have separate local storage from Safari, so sign-in and cloud sync are required.
6. Try saving one additional activity while disconnected from Wi-Fi/cellular (if feasible), then reconnect and confirm sync.
7. Visit **Community**, create a profile, and verify that the directory checkbox starts **off**. Test opt-in and opt-out with another tester.
8. Create a test discussion or reply, then explore **Networking**: mentorship interests, first-timer connection options, functional-area filters, and meetups.
9. Open the **2026 Seattle archive** using the year switcher; return to 2027.

## Report bugs consistently

Please collect:
- Device (e.g. iPhone 15), operating system, browser and whether it was a Home Screen installation
- Page or feature
- What you did, what you expected, and what happened
- Whether the app said **Saved on this device**, **Syncing**, or **Saved to your account**
- Screenshot (without passwords, private messages, email addresses or personal data)
- Approximate time and whether you were online

**High-priority issues:** agenda disappears on browser relaunch, iPhone logo fails, login/confirmation fails, private directory profiles become visible without opt-in, or another attendee's data appears.

## Pilot safeguards

- Test with non-sensitive, clearly labeled information. Do not publish actual personal phone numbers, home addresses, hotel room numbers, or confidential committee discussions.
- This is a **live production site**, so created accounts, discussions, and meetups persist unless explicitly removed; coordinate cleanup of test entries.
- Message board reporting and initial moderator controls exist, but full abuse-prevention policies and real-device testing are still underway.
- The 2027 conference database remains a draft; internal schedules should not be published just for the pilot.

## Logo references

- Header: `public/branding/nwacuho-wordmark.svg` (vectorized from the supplied organizational long logo).
- Homepage: `public/branding/nwacuho-2027-badge.svg` (cropped to remove transparent margins).
- Browser/PWA: `public/branding/nwacuho-app-icon.svg` (vectorized from the supplied NW short mark).
- iPhone: `app/apple-icon.tsx` generates a PNG touch icon from the same short mark.

Log follow-up test outcomes in the board's preferred issue tracker or communications channel. The exact testing results have not yet been independently validated on physical devices.
