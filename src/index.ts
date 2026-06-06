import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello, World!');
});

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});