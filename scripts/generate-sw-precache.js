const fs = require('fs');
const path = require('path');

try {
  const registryPath = path.join(__dirname, '../src/lib/utils/tool-registry.ts');
  const content = fs.readFileSync(registryPath, 'utf8');

  const keys = [];
  const registryBlockMatch = content.match(/export const TOOL_REGISTRY = \{([\s\S]+?)\}\s*as\s*const/);
  
  if (registryBlockMatch) {
    const block = registryBlockMatch[1];
    const keyRegex = /^\s*['"]?([a-zA-Z0-9-]+)['"]?:\s*\{/gm;
    let keyMatch;
    while ((keyMatch = keyRegex.exec(block)) !== null) {
      keys.push(keyMatch[1]);
    }
  } else {
    // Fallback simple regex if the block match fails
    const keyRegex = /^\s*['"]?([a-zA-Z0-9-]+)['"]?:\s*\{/gm;
    let keyMatch;
    while ((keyMatch = keyRegex.exec(content)) !== null) {
      keys.push(keyMatch[1]);
    }
  }

  const uniqueKeys = Array.from(new Set(keys)).sort();
  const routes = uniqueKeys.map(key => `/tools/${key}`);
  
  const fileContent = `// Generated automatically during build. Do not edit.
self.__precacheRoutes = ${JSON.stringify(routes, null, 2)};
`;

  const outputPath = path.join(__dirname, '../public/sw-precache.js');
  fs.writeFileSync(outputPath, fileContent);
  console.log(`[PWA Precache] Generated sw-precache.js with ${routes.length} routes.`);
} catch (error) {
  console.error('[PWA Precache] Failed to generate sw-precache.js:', error);
  process.exit(1);
}
