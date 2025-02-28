import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';

// إنشاء سيرفر ويب بسيط لتقديم ملف HTML
const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync('./index.html'));
});

const wss = new WebSocketServer({ server });

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});