const { program } = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

program
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-i, --input <input>', 'Path to the NBU JSON input file')
  .parse(process.argv);

const options = program.opts();

const inputFilePath = path.resolve(options.input);
if (!fs.existsSync(inputFilePath)) {
  console.error('Cannot find input file');
  process.exit(1);
}

let nbuData;
try {
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');
  nbuData = JSON.parse(fileContent);
} catch (error) {
  console.error('Error reading or parsing the input file:', error.message);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(nbuData));
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
  process.exit(1);
});