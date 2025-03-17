const { program } = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configure command line arguments
program
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-i, --input <input>', 'Path to the NBU JSON input file')
  .parse(process.argv);

const options = program.opts();

// Check if input file exists
const inputFilePath = path.resolve(options.input);
if (!fs.existsSync(inputFilePath)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Read and parse the input file
let nbuData;
try {
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');
  nbuData = JSON.parse(fileContent);
} catch (error) {
  console.error('Error reading or parsing the input file:', error.message);
  process.exit(1);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(nbuData));
});

// Start the server
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error.message);
  process.exit(1);
});