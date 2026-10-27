import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { smol } from '@e2e-dev/smol';
import { chromium } from 'playwright-core';

export default {
  targets: [
    {
      engine: web({
        browser: smol({
          // The app runs inside each browser machine, so every test attempt
          // gets its own branch of the app and the items it keeps on disk.
          app: { start: 'node server.mjs', port: 3000 },
          // Runs once on each warm machine, before any attempt branches it.
          prepare: async (cdpEndpoint) => {
            const browser = await chromium.connectOverCDP(cdpEndpoint);
            const page = browser.contexts()[0]!.pages()[0]!;
            await page.goto('http://localhost:3000/sign-in');
            await page.getByLabel('Email').fill('qa@example.com');
            await page.getByLabel('Password').fill('smol');
            await page.getByRole('button', { name: 'Sign in' }).click();
            await page.waitForURL('**/items');
            // Disconnects and leaves the browser running.
            await browser.close();
          },
        }),
      }),
      app: { url: 'http://localhost:3000' },
    },
  ],
  workers: 2,
} satisfies E2EConfig;
