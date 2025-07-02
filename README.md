# EventStream Demo

A real-time web scraping and content parsing demo using Django Server-Sent Events (SSE) with React frontend.

## Features

- **Real-time Web Scraping**: Fetches content from various websites
- **Smart Content Parsing**: Parses HTML, JSON, and XML content
- **Server-Sent Events**: Real-time streaming updates
- **React Frontend**: Modern UI with real-time message display
- **Docker Support**: Containerized deployment

## Quick Start

### Local Development

**Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Start Django server
python manage.py runserver
```

**Frontend:**
```bash
cd sse-demo-client
npm install
npm start
```

### Docker
```bash
docker-compose up --build
```

## API Endpoints

- `GET /api/health/` - Health check
- `GET /api/sse-demo` - Basic SSE demo
- `GET /api/sse-demo-2` - **Web scraping SSE demo** (fetches real websites)

## Web Scraping Demo

The `/api/sse-demo-2` endpoint:
- Randomly selects from example websites (example.com, httpbin.org, etc.)
- Fetches real content in real-time
- Parses HTML, JSON, and XML intelligently
- Streams progress updates via SSE

### Test with curl:
```bash
curl -N http://localhost:8000/api/sse-demo-2
```

## Project Structure

```
eventstream-demo/
├── core/                 # Django backend
│   ├── helper.py        # Web scraping logic
│   ├── sse_demo_2.py    # Advanced SSE endpoint
│   └── urls.py          # URL routing
├── sse-demo-client/     # React frontend
├── requirements.txt     # Python dependencies
└── docker-compose.yml  # Docker setup
```

## Technology Stack

- **Backend**: Django, Requests, BeautifulSoup4
- **Frontend**: React, EventSource API
- **DevOps**: Docker, Docker Compose

## Development

### Adding New Websites
Update the `websites` list in `core/helper.py`:

```python
websites = [
    "https://example.com",
    "https://your-website.com",
    # Add more URLs here
]
```

### Testing
```bash
# Backend
python manage.py check

# Frontend
cd sse-demo-client
npm test
```

## Troubleshooting

- **CORS Issues**: Check Django CORS settings
- **SSE Connection**: Ensure proxy supports SSE
- **Web Scraping**: Some sites may block automated requests

---

**Backend**: http://localhost:8000  
**Frontend**: http://localhost:3000 