import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Starts from the seed whatever ran before: every attempt has its own branch of the app.
const seed = ['Apples', 'Bread', 'Coffee'];

test('deletes every item', async ({ app, screen }) => {
  await app.open('/items');
  await expect(screen.getByRole('listitem')).toHaveText(seed);

  await screen.getByRole('button', 'Delete all').click();

  await expect(screen.getByText('No items.')).toBeVisible();
});
