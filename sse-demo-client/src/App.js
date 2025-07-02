import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import SSEDemo from './components/SSEDemo';

function Navigation() {
  return (
    <nav style={{ 
      background: '#2c3e50', 
      padding: '16px 0', 
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            EventStream Demo
          </h1>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link 
              to="/sse-demo-1" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              File Stream
            </Link>
            <Link 
              to="/sse-demo-2" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Simple Demo
            </Link>
            <Link 
              to="/sse-demo-3" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Web Scraping
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Welcome to EventStream Demo
      </h1>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '40px' }}>
        Choose a demo to see Server-Sent Events in action
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '12px' }}>File Stream Demo</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Streams content from a large file with real-time updates
          </p>
          <Link 
            to="/sse-demo-1"
            style={{
              display: 'inline-block',
              background: '#3498db',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Try Demo
          </Link>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '12px' }}>Simple SSE Demo</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Simulated web search with basic SSE streaming
          </p>
          <Link 
            to="/sse-demo-2"
            style={{
              display: 'inline-block',
              background: '#27ae60',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            Try Demo
          </Link>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '12px' }}>Web Scraping Demo</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Real-time web scraping and content parsing
          </p>
          <Link 
            to="/sse-demo-3"
            style={{
              display: 'inline-block',
              background: '#e74c3c',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Try Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sse-demo-1" element={
            <SSEDemo 
              endpoint="sse-demo"
              title="File Stream Demo"
              description="Streams content from a large file with real-time updates. Each line is sent as a separate event."
            />
          } />
          <Route path="/sse-demo-2" element={
            <SSEDemo 
              endpoint="sse-demo-2"
              title="Simple SSE Demo"
              description="Simulated web search with basic SSE streaming. Shows how to structure SSE events with different types."
            />
          } />
          <Route path="/sse-demo-3" element={
            <SSEDemo 
              endpoint="sse-demo-3"
              title="Web Scraping Demo"
              description="Real-time web scraping and content parsing. Fetches content from random websites and parses HTML, JSON, and XML."
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
