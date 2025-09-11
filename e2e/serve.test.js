import { test } from 'node:test';
import assert from 'node:assert';
import { exec, spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let httpServerProcess;

test.before(async () => {
  // Start the http-server in the background
  // Use spawn to get a ChildProcess object that we can explicitly kill
  httpServerProcess = spawn('npm', ['start'], { cwd: path.resolve(__dirname, '..'), shell: true });

  // Log server output for debugging
  httpServerProcess.stdout.on('data', (data) => {
    console.log(`http-server stdout: ${data}`);
  });
  httpServerProcess.stderr.on('data', (data) => {
    console.error(`http-server stderr: ${data}`);
  });

  // Wait for the server to be ready
  await new Promise((resolve, reject) => {
    const checkServer = () => {
      const req = http.get('http://localhost:8080', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(checkServer, 100);
        }
      });
      req.on('error', (err) => {
        // Server might not be up yet, retry
        setTimeout(checkServer, 100);
      });
      req.end();
    };
    checkServer();
  });
});

test.after(async () => {
  // Kill the http-server process
  if (httpServerProcess) {
    httpServerProcess.kill();
  }
});

test('index.html should be served correctly via http-server', async (t) => {
  await new Promise((resolve, reject) => {
    http.get('http://localhost:8080', (res) => {
      assert.strictEqual(res.statusCode, 200, 'Expected status code 200');
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        assert.ok(data.includes('<title>uni-verse</title>'), 'HTML should contain uni-verse title');
        assert.ok(data.includes('<canvas id="gameCanvas"></canvas>'), 'HTML should contain gameCanvas');
        resolve();
      });
    }).on('error', (err) => {
      reject(new Error(`Failed to fetch HTML: ${err.message}`));
    });
  });
});
