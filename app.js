// app.js

const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();

// =============== Middleware ===============
app.use(express.static(__dirname + '/public'));

// =============== Event Emitter ===============
const chatEmitter = new EventEmitter();

// =============== Response Handlers ===============

// Serve chat.html
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

// Plain text
function respondText(req, res) {
  res.send('hi');
}

// JSON
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Echo
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Chat endpoint
function respondChat(req, res) {
  const { message } = req.query;
  if (message) {
    chatEmitter.emit('message', message);
  }
  res.end();
}

// SSE endpoint
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  // Send messages as they arrive
  const onMessage = (message) => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  // Remove listener on client disconnect
  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// 404
function respondNotFound(req, res) {
  res.status(404).send('Not Found');
}

// =============== Routes ===============
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Catch-all
app.use(respondNotFound);

// =============== Start Server ===============
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
