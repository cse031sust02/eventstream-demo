import React, { useEffect, useState } from 'react';

function parseEventData(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const fetchSSE = async () => {
      const response = await fetch('http://localhost:8000/api/sse-demo-2', {
        headers: {
          'Accept': 'text/event-stream',
          // 'Authorization': 'Bearer <token>' // Uncomment and set token when needed
        },
      });
      if (!response.body) return;
      const reader = response.body.getReader();
      let buffer = '';
      let eventType = null;
      while (!isCancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += new TextDecoder().decode(value, { stream: true });
        let eventsArr = buffer.split(/\n\n/);
        buffer = eventsArr.pop(); // last may be incomplete
        for (let eventBlock of eventsArr) {
          let lines = eventBlock.split(/\r?\n/);
          let type = null;
          let data = '';
          for (let line of lines) {
            if (line.startsWith('event:')) {
              type = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              data += line.replace('data:', '').trim();
            } // ignore comments (lines starting with ':')
          }
          if (type && data) {
            setEvents((prev) => [
              ...prev,
              { type, data: parseEventData(data) }
            ]);
          }
        }
      }
    };
    fetchSSE();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Bot Event Stream Demo</h2>
      <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #eee' }}>
        {events.map((event, idx) => (
          <div key={idx} style={{ marginBottom: 18 }}>
            {event.type === 'bot_thinking' && (
              <div style={{ color: '#888', fontStyle: 'italic' }}>
                {event.data.message?.content?.preview}
              </div>
            )}
            {event.type === 'bot_response' && (
              <div style={{ color: '#222', fontWeight: 'bold', background: '#e0f7fa', padding: 12, borderRadius: 6 }}>
                <span role="img" aria-label="bot">🤖</span> {event.data.message?.content?.preview}
              </div>
            )}
            {event.type === 'error' && (
              <div style={{ color: 'red' }}>{event.data}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
