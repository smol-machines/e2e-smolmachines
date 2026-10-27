# e2e-smolmachines

A sign-in page and a list of items, with three locator tests that each
change the list in their own copy of the running app.

## Run

Use macOS on Apple Silicon or Linux with `/dev/kvm`, and Node 22.22.3+,
24.8+, or 26+. From this folder:

```bash
npm install
npm run test:e2e
```

The first run pulls the Playwright Ubuntu image, so it takes longer.
No account or API key is needed. Results are in `.e2e/report.json`.

To try the app on your computer, `npm start` serves it at
`http://localhost:3000`. Sign in as `qa@example.com` with the password `smol`.

## What smol machines change

[e2e.config.ts](e2e.config.ts) sets the browser to `smol()` from
[`@e2e-dev/smol`](https://e2e.tester.army/docs/integrations/smol). Each
worker boots one microVM with Chromium, copies this folder in, and starts the
app beside the browser. `prepare` signs in once on that machine. Every test
attempt, a retry included, then runs in a copy-on-write branch of the running
machine. The branch has its own browser, its own running app, and its own
`items.json`, and it is deleted when the attempt ends.

So each test in [tests/](tests/) deletes, adds, or renames items and still
starts from the three seeded ones, on two workers and in any order. With
`scope: 'worker'`, the attempts on a worker share one machine, and a test
after the first would see the list the first one left.

Last checked with e2e 0.21.3, @e2e-dev/web 0.15.3, @e2e-dev/smol 0.1.2,
smolmachines 1.32.2, and Node 26.
