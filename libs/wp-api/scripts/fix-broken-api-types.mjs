import * as fs from 'node:fs';
import * as path from 'node:path';

const broken = ['./src/generated/wp/models/wp_template.ts', './src/generated/wp/models/wp_template_part.ts'];

for (let filePath of broken) {
  let p = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(p, 'utf-8');

  content = content.replace("import type { bool } from './bool';", '');
  content = content.replace(/bool;/g, 'boolean;');

  fs.writeFileSync(p, content);
}
