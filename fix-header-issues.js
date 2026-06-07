/**
 * fix-header-issues.js v2
 * 
 * দুটো সমস্যা ঠিক করে:
 * 1. Double utility-bar: পুরনো utility-bar block মুছে ফেলা
 * 2. Header background color: পুরনো <style> block থেকে navy site-header override মুছা
 */

const fs = require('fs');
const path = require('path');

const ROOT = '/home/sahadat/workstation/improvetuition';

function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const skip = ['index_old.html', 'navigation.html', 'footer.html', 'nav.html', 'toogle-nav.html'];
      if (!skip.includes(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

/**
 * একটি <div class="utility-bar"> block খুঁজে তার শেষ পর্যন্ত (closing </div></div>)
 * সব content সহ return করে, এবং string থেকে remove করে।
 */
function removeFirstUtilityBar(content) {
  const start = content.indexOf('<div class="utility-bar">');
  if (start === -1) return { content, removed: false };

  // Closing </div></div> খুঁজি (nested: outer=utility-bar, inner=utility-inner)
  let depth = 0;
  let i = start;
  while (i < content.length) {
    if (content.startsWith('<div', i)) {
      depth++;
      i += 4;
    } else if (content.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) {
        // closing found
        const end = i + 6; // </div> length = 6
        const removed = content.slice(start, end);
        const newContent = content.slice(0, start) + content.slice(end);
        return { content: newContent, removed: true, block: removed };
      }
      i += 6;
    } else {
      i++;
    }
  }
  return { content, removed: false };
}

function fixFile(content) {
  let result = content;
  let changed = false;
  const log = [];

  // ─── FIX 1: Double utility-bar ───────────────────────────────────
  // দুটো utility-bar থাকলে প্রথমটা (পুরনো) মুছি
  const count = (result.match(/<div class="utility-bar">/g) || []).length;
  
  if (count >= 2) {
    const r = removeFirstUtilityBar(result);
    if (r.removed) {
      result = r.content;
      // trailing newline cleanup
      result = result.replace(/\n{3,}/g, '\n\n');
      changed = true;
      log.push('  ✂️  Removed duplicate utility-bar');
    }
  }

  // ─── FIX 2: site-header navy background in <style> blocks ────────
  // <style> এর ভেতরে .site-header { background: #242F3A } মুছি
  // এবং .site-header.is-scrolled { background: rgba(36... } মুছি
  
  const newResult = result.replace(
    /(<style>)([\s\S]*?)(<\/style>)/g,
    (match, open, inner, close) => {
      let newInner = inner;

      // .site-header { ... background: #242F3A or rgba(36,47,58 ... } 
      newInner = newInner.replace(
        /\s*\.site-header\s*\{([^}]*background\s*:\s*(?:#242F3A|rgba?\(\s*36[^)]*\))[^}]*)\}/g,
        ''
      );

      // .site-header.is-scrolled { ... }
      newInner = newInner.replace(
        /\s*\.site-header\.is-scrolled\s*\{[^}]*\}/g,
        ''
      );

      if (newInner !== inner) {
        log.push('  🎨 Removed navy site-header background from <style>');
        return open + newInner + close;
      }
      return match;
    }
  );

  if (newResult !== result) {
    result = newResult;
    changed = true;
  }

  return { result, changed, log };
}

// ─── Main ─────────────────────────────────────────────────────────
const htmlFiles = getAllHtmlFiles(ROOT);
let totalChanged = 0;

console.log(`\n📁 ${htmlFiles.length}টি HTML ফাইল চেক করা হচ্ছে...\n`);

for (const filePath of htmlFiles) {
  const relativePath = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const { result, changed, log } = fixFile(content);

  if (changed) {
    fs.writeFileSync(filePath, result, 'utf8');
    log.forEach(l => console.log(l));
    console.log(`✅ Fixed: ${relativePath}\n`);
    totalChanged++;
  }
}

console.log(`✨ মোট ${totalChanged}টি ফাইল আপডেট হয়েছে।\n`);
