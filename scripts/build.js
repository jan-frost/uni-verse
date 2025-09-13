import esbuild from 'esbuild';
import { join } from 'path';
import { rmSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const projectRoot = join(import.meta.dirname, '..');
const distDir = join(projectRoot, 'dist');

async function build() {
    try {
        // Clean and create dist directory
        if (existsSync(distDir)) {
            rmSync(distDir, { recursive: true, force: true });
        }
        mkdirSync(distDir);

        // Build the main bundle
        await esbuild.build({
            entryPoints: [join(projectRoot, 'main.js')],
            bundle: true,
            outfile: join(distDir, 'bundle.js'),
            minify: true,
            sourcemap: true,
        });

        // Run the build-html script
        execSync('node ' + join(projectRoot, 'scripts', 'build-html.js'), { stdio: 'inherit' });

        console.log('Build successful');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();