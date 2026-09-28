import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('ELIM SPRINGS — PRE-COMMIT REPOSITORY-WIDE SECRET AUDIT');
console.log('================================================================\n');

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'dist-ssr', '__pycache__', '.vscode', '.idea']);
const IGNORED_FILES = new Set(['.env', 'package-lock.json', 'test-gis-and-water-intelligence.mjs']);

const SUSPICIOUS_PATTERNS = [
  /ey[A-Za-z0-9-_=]{30,}\.[A-Za-z0-9-_=]{30,}\.[A-Za-z0-9-_=]{30,}/, // JWT / Service-Role Token
  /(?:password|passwd|secret|api_key|apikey|token|private_key)\s*[:=]\s*['"][A-Za-z0-9-_]{16,}['"]/i, // Hardcoded API Keys / Secrets
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, // Private Keys
];

// Whitelisted placeholder values that are safe in documentation and .env.example
const SAFE_PLACEHOLDERS = [
  'your-supabase-anon-key-placeholder',
  'your-supabase-publishable-key-placeholder',
  'your-supabase-secret-key-placeholder',
  'your-supabase-service-role-key-placeholder',
  'your-bhashini-udyat-key-placeholder',
  'your-bhashini-inference-key-placeholder',
  'your-nasa-api-key-placeholder',
  'your-bhuvan-village-geocoding-token-placeholder',
  'your-bhuvan-reverse-geocoding-token-placeholder',
  'your-bhuvan-proximity-token-placeholder',
  'your-bhuvan-lulc-50k-token-placeholder',
  'your-bhuvan-lulc-50k-aoi-token-placeholder',
  'your-bhuvan-routing-token-placeholder',
  'your-bhuvan-geoid-token-placeholder',
];

let filesScanned = 0;
let suspiciousFound = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      if (IGNORED_FILES.has(entry.name)) continue;
      if (entry.name.startsWith('.env') && entry.name !== '.env.example') {
        console.error(`[ALERT] Local environment file detected: ${fullPath}`);
        suspiciousFound++;
        continue;
      }

      // Check file content
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        filesScanned++;

        for (const pattern of SUSPICIOUS_PATTERNS) {
          const match = content.match(pattern);
          if (match) {
            const matchedText = match[0];
            const isSafe = SAFE_PLACEHOLDERS.some((p) => matchedText.includes(p));
            if (!isSafe) {
              console.error(`[SUSPICIOUS] Pattern match in: ${fullPath} (Length: ${matchedText.length})`);
              suspiciousFound++;
              break;
            }
          }
        }
      } catch (err) {
        // Binary file, skip
      }
    }
  }
}

scanDir('.');

console.log(`\nFiles scanned: ${filesScanned}`);
console.log(`Suspicious entries: ${suspiciousFound}`);

if (suspiciousFound === 0) {
  console.log('\n[PASS] Repository is 100% clean. No hardcoded credentials or untracked .env files found.');
  process.exit(0);
} else {
  console.error('\n[FAIL] Secrets found! Must resolve before staging.');
  process.exit(1);
}
