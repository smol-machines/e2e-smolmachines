import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Starts from the seed whatever ran before: every attempt has its own branch of the app.
const seed = ['Apples', 'Bread', 'Coffee'];

test('renames an item', async ({ app, screen }) => {
  await app.open('/items');
  await expect(screen.getByRole('listitem')).toHaveText(seed);

  await screen.getByLabel('Item').selectOption('Bread');
  await screen.getByLabel('New name').fill('Bagels');
  await screen.getByRole('button', 'Rename').click();

  await expect(screen.getByRole('listitem')).toHaveText(['Apples', 'Bagels', 'Coffee']);
});
