import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Starts from the seed whatever ran before: every attempt has its own branch of the app.
const seed = ['Apples', 'Bread', 'Coffee'];

test('adds an item', async ({ app, screen }) => {
  await app.open('/items');
  await expect(screen.getByRole('listitem')).toHaveText(seed);

  await screen.getByLabel('New item').fill('Dates');
  await screen.getByRole('button', 'Add').click();

  await expect(screen.getByRole('listitem')).toHaveText([...seed, 'Dates']);
});
