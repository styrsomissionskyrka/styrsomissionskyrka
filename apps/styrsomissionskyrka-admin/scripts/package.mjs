import { accessSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AdmZip from 'adm-zip';
import { globbySync } from 'globby';

(() => {
  let cwd = process.cwd();
  let zipPath = join(cwd, '../../dist/apps/styrsomissionskyrka-admin/styrsomissionskyrka.zip');
  let items = globbySync([
    '*.php',
    'style.css',
    'screenshot.png',
    'README.md',
    '(assets|dist|inc|languages|vendor|views)/**/*',
  ]);

  let z = new AdmZip();
  for (let item of items) {
    z.addLocalFile(item, dirname(item));
  }

  if (exists(zipPath)) rmSync(zipPath);
  z.writeZip(zipPath);
})();

function exists(file) {
  try {
    accessSync(file);
    return true;
  } catch (error) {
    return false;
  }
}
