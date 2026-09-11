const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // replace `import { API } from "..."`
  if (content.match(/import\s*\{\s*API\s*\}\s*from\s*['"].*?['"]/)) {
    content = content.replace(/import\s*\{\s*API\s*\}\s*from\s*(['"].*?['"])/g, 'import { apiFetch } from $1');
    changed = true;
  }
  
  // replace remaining `fetch(`${API}` just in case
  if (content.match(/fetch\(\s*`\$\{API\}/)) {
    content = content.replace(/fetch\(\s*`\$\{API\}/g, 'apiFetch(`');
    changed = true;
  }
  
  // if API is still used elsewhere (e.g. `${API}/images`), we must re-import API
  if (content.includes('${API}')) {
    if (!content.includes('import { API')) {
       content = content.replace(/import\s*\{\s*apiFetch\s*\}\s*from\s*(['"].*?['"])/, 'import { apiFetch, API } from $1');
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
