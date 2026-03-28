# PolicyEngine pulse

`pulse` is now a static, topic-first standup review tool.

Instead of randomizing speakers and collecting survey data, the new flow is:

1. Pull the last day of in-scope GitHub activity for the team with `gh`
2. Group the resulting work by topic
3. Review the grouped digest in the app before going person-by-person

## Daily workflow

Generate the daily digest:

```bash
npm run standup:generate
```

That writes a local build artifact at `public/data/standup-report.json`, which the app reads directly.

Then run the app locally:

```bash
npm install
npm run dev
```

## Team config

The generator reads [`public/data/team-members.json`](/Users/maxghenis/PolicyEngine/pulse/public/data/team-members.json).

That file controls:

- which GitHub users are included
- which orgs or repos count as “in scope”
- repo-level fallback topics
- keyword rules used to cluster work into shared standup topics

## Why this shape

The efficient path for PE standup is not “one random person at a time.” It is:

- topic-first review so related work gets discussed together
- raw per-person activity kept available as a secondary check
- static JSON output so you can regenerate with a script, inspect it with Codex, and ship it to GitHub Pages without a backend

## Deployment

The app is still a static Next.js export deployed via GitHub Pages from `main`.

The Pages workflow now regenerates the standup digest during build, so the deployed site does not depend on a committed daily JSON snapshot.

There is also a pull-request preview workflow for Vercel in [`.github/workflows/vercel-preview.yml`](/Users/maxghenis/PolicyEngine/pulse/.github/workflows/vercel-preview.yml). To enable it, add these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow builds in GitHub Actions, runs `npm run standup:generate` there, and deploys the prebuilt output to a Vercel preview URL. It skips automatically for forked pull requests or when the Vercel secrets are missing.
