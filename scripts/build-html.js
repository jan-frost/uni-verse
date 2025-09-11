import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const inputHtmlPath = join(projectRoot, 'index.html');
const outputDir = join(projectRoot, 'dist');
const outputHtmlPath = join(outputDir, 'index.html');

try {
    // Ensure dist directory exists
    mkdirSync(outputDir, { recursive: true });

    let htmlContent = readFileSync(inputHtmlPath, 'utf8');

    // Remove the importmap script block
    htmlContent = htmlContent.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');

    // Replace main.js with bundle.js
    htmlContent = htmlContent.replace(/<script type="module" src="main.js\?v=[0-9]+"><\/script>/, '<script type="module" src="bundle.js"></script>');

    writeFileSync(outputHtmlPath, htmlContent, 'utf8');
    console.log('Successfully built production index.html');
} catch (error) {
    console.error('Error building production index.html:', error);
    process.exit(1);
}
