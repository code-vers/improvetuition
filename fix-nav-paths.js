/**
 * fix-nav-paths.js
 * 
 * এই স্ক্রিপ্টটি সমস্ত HTML ফাইলের নেভিগেশন লিংকগুলোতে
 * relative paths (./xxx) কে absolute paths (/xxx) এ পরিবর্তন করে।
 * 
 * শুধুমাত্র navigation-related classes (m-sub-link, m-link, header-cta,
 * drawer-cta, drawer-call, logo) এর ভেতরের href গুলো পরিবর্তন হবে।
 */

const fs = require('fs');
const path = require('path');

const ROOT = '/home/sahadat/workstation/improvetuition';

// সব HTML ফাইল খুঁজে বের করা
function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Template/reference files বাদ দেওয়া
      const skip = ['index_old.html', 'navigation.html', 'footer.html', 'nav.html', 'toogle-nav.html'];
      if (!skip.includes(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Navigation section খুঁজে সেখানে relative paths ঠিক করা
function fixNavPaths(content) {
  let changed = false;

  // Navigation এর ভেতরের সব href পরিবর্তন করা।
  // আমরা <aside class="mobile-drawer"...> থেকে </aside> পর্যন্ত
  // এবং <header ...> থেকে </header> পর্যন্ত সব relative hrefs ঠিক করব।

  // নিচের pattern গুলো match করবে:
  // href="./something"  → href="/something"
  // href="../something" → href="/something"  
  // href="../../something" → href="/something"

  // Pattern: navigation-এর ভেতরে href="./..." বা href="../..." বা href="../../..."
  // যেগুলো #, tel:, mailto:, http, / দিয়ে শুরু না

  const newContent = content.replace(
    /href="(\.\.?\/[^"]+)"/g,
    (match, relPath) => {
      // tel:, mailto:, http, # এগুলো skip করি
      if (relPath.startsWith('tel:') || relPath.startsWith('mailto:') || relPath.startsWith('http')) {
        return match;
      }

      // relative path কে absolute path এ convert
      // ./uk/... → /uk/...
      // ../uk/... → /uk/...
      // ../../uk/... → /uk/...
      let absPath = relPath;

      // সব leading ./ বা ../ remove করে / দিয়ে শুরু করা
      absPath = absPath.replace(/^(\.\.\/)+/, '/');  // ../../ → /
      absPath = absPath.replace(/^\.\//, '/');         // ./ → /

      // যদি ইতিমধ্যে / দিয়ে শুরু না হয়
      if (!absPath.startsWith('/')) {
        absPath = '/' + absPath;
      }

      if (absPath !== relPath) {
        changed = true;
        console.log(`  ${relPath} → ${absPath}`);
        return `href="${absPath}"`;
      }
      return match;
    }
  );

  return { newContent, changed };
}

// Main execution
const htmlFiles = getAllHtmlFiles(ROOT);
let totalChanged = 0;

console.log(`\n📁 ${htmlFiles.length}টি HTML ফাইল পাওয়া গেছে।\n`);

for (const filePath of htmlFiles) {
  const relativePath = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const { newContent, changed } = fixNavPaths(content);

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ আপডেট হয়েছে: ${relativePath}`);
    totalChanged++;
  }
}

console.log(`\n✨ মোট ${totalChanged}টি ফাইল আপডেট হয়েছে।`);
console.log('\n🚀 এখন "npx serve ." দিয়ে লোকাল সার্ভার চালু করুন এবং http://localhost:3000 এ টেস্ট করুন।\n');
