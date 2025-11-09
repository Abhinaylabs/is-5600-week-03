const form = document.getElementById('form');
const input = document.getElementById('input');
const messagesDiv = document.getElementById('messages');

// Add new message to DOM
function addMessage(text) {
  const msg = document.createElement('p');
  msg.textContent = text;
  messagesDiv.appendChild(msg);
}

// Listen for form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  input.value = '';
});

// Setup Server-Sent Events connection
const events = new EventSource('/sse');
events.onmessage = (event) => {
  const data = JSON.parse(event.data);
  addMessage(data.message);
};
