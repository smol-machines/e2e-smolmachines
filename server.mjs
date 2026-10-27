import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';

const PORT = 3000;
const DATA = new URL('./items.json', import.meta.url);
const EMAIL = 'qa@example.com';
const PASSWORD = 'smol';
const sessions = new Set();

const load = () => JSON.parse(readFileSync(DATA, 'utf8'));
const save = (items) => writeFileSync(DATA, JSON.stringify(items));
// Every start seeds the file, so a new app always lists these three items.
save(['Apples', 'Bread', 'Coffee']);

const escape = (text) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const page = (title, body) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body><main><h1>${title}</h1>${body}</main></body>
</html>`;

const signIn = (error = '') => page('Sign in', `
${error && `<p role="alert">${error}</p>`}
<form method="post" action="/sign-in">
  <label>Email <input name="email" type="email"></label>
  <label>Password <input name="password" type="password"></label>
  <button>Sign in</button>
</form>`);

const list = (items) => page('Items', `
${items.length === 0 ? '<p>No items.</p>' : `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`}
<form method="post" action="/items/add">
  <label>New item <input name="name" required></label>
  <button>Add</button>
</form>
<form method="post" action="/items/rename">
  <label>Item <select name="index">${items.map((item, i) => `<option value="${i}">${escape(item)}</option>`).join('')}</select></label>
  <label>New name <input name="name" required></label>
  <button>Rename</button>
</form>
<form method="post" action="/items/delete-all"><button>Delete all</button></form>`);

const changes = {
  '/items/add': (items, form) => [...items, form.get('name')],
  '/items/rename': (items, form) => items.with(Number(form.get('index')), form.get('name')),
  '/items/delete-all': () => [],
};

const readForm = async (req) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  return new URLSearchParams(body);
};

createServer(async (req, res) => {
  const send = (status, html, headers = {}) => res.writeHead(status, { 'content-type': 'text/html', ...headers }).end(html);
  const redirect = (location, headers = {}) => res.writeHead(303, { location, ...headers }).end();
  const { pathname } = new URL(req.url, 'http://localhost');
  const session = /(?:^|; )session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];

  if (pathname === '/sign-in') {
    if (req.method !== 'POST') return send(200, signIn());
    const form = await readForm(req);
    if (form.get('email') !== EMAIL || form.get('password') !== PASSWORD) return send(401, signIn('Wrong email or password.'));
    const token = randomUUID();
    sessions.add(token);
    return redirect('/items', { 'set-cookie': `session=${token}; HttpOnly; Path=/` });
  }
  if (!sessions.has(session)) return redirect('/sign-in');
  if (req.method === 'POST' && pathname in changes) {
    save(changes[pathname](load(), await readForm(req)));
    return redirect('/items');
  }
  if (pathname === '/' || pathname === '/items') return send(200, list(load()));
  send(404, page('Not found', ''));
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
