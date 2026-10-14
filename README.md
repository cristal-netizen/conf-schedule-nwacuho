This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 2027 conference design preview

Open `/2027` on the local app or on the Vercel deployment for this branch.
The preview is a standalone static prototype under `public/2027-preview`,
served through a Next.js rewrite. It includes the supplied Vancouver logo,
responsive navigation, a community board, attendee discovery by role and
interest, local connections, coffee invitation drafts, and sample sessions.

All attendees, institutions, posts, and session details are fictional samples.
Posts, replies, interests, connections, saved sessions, and invitations persist
only in the current browser, using separate `nwacuho:2027-preview:` storage
keys. Invitations are drafts; the preview does not contact anyone. No account
or shared networking backend has been added. The preview does not use or write
to the existing Google Apps Script schedule or attendance service.

The existing 2026 routes and schedule remain available at their current URLs.
Before a live networking launch, implement attendee authentication, opt-in
directory visibility, authorized shared storage, connection requests and
acceptance, invitation delivery, and board moderation/reporting. Confirm the
2027 program, venue information, and accessibility details with organizers.

To check the prototype interactions, run:

```bash
node --test tests/2027-preview.test.cjs
```
