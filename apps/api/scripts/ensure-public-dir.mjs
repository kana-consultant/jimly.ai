import { mkdirSync } from 'node:fs';

// This project has no static frontend — api/*.ts functions are the only
// output. Vercel's build step still checks for an output directory, so we
// create an empty one. Cross-platform (no shell mkdir flags) since this
// runs under cmd.exe locally and bash on Vercel's Linux build image.
mkdirSync('apps/api/public', { recursive: true });
