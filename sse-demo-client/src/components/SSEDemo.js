import React, { useEffect, useState } from 'react';

function parseEventData(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function Timeline({ steps }) {
  return (
    <div style={{ position: 'relative', marginTop: 8 }}>
      {/* Continuous timeline line */}
      <div style={{
        position: 'absolute',
        left: 40,
        top: 0,
        bottom: 0,
        width: 2,
        background: '#e9ecef',
        zIndex: 1
      }}></div>
      {steps.map((step, idx) => (
        <div key={step.id} style={{ 
          marginBottom: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          {/* Timeline dot */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 30,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#339af0',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 2
          }}>
            {String(idx + 1).padStart(2, '0')}
          </div>
          {/* Content */}
          <div style={{ 
            flex: 1,
            background: 'white',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 16,
            marginLeft: 60,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: '13px', color: '#868e96', marginBottom: 8 }}>{step.timestamp}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#495057' }}>{step.content.replace(/[🤔💡🔍✅📋🌐📊📦🧠📝🎉❌🤷‍♂️]/g, '')}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResponseSection({ content, isVisible }) {
  if (!isVisible) return null;
  
  return (
    <div style={{
      marginTop: 16,
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 12,
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12,
        fontSize: '16px',
        fontWeight: '500'
      }}>
        AI Analysis Complete
      </div>
      <div style={{ 
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        background: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: '400px'
      }}>
        {content}
      </div>
    </div>
  );
}

function SSEDemo({ endpoint, title, description }) {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [finalResponse, setFinalResponse] = useState(null);
  const [systemStats, setSystemStats] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setEvents([]);
    setError(null);
    setIsConnected(false);
    setThinkingSteps([]);
    setFinalResponse(null);
    setSystemStats(null);

    const fetchSSE = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
          headers: {
            'Accept': 'text/event-stream',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!response.body) {
          throw new Error('Response body is null');
        }

        setIsConnected(true);
        const reader = response.body.getReader();
        let buffer = '';
        let stepCounter = 0;
        
        while (!isCancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += new TextDecoder().decode(value, { stream: true });
          let eventsArr = buffer.split(/\n\n/);
          buffer = eventsArr.pop();
          
          for (let eventBlock of eventsArr) {
            let lines = eventBlock.split(/\r?\n/);
            let type = null;
            let data = '';
            
            for (let line of lines) {
              if (line.startsWith('event:')) {
                type = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                data += line.replace('data:', '').trim();
              }
            }
            
            if (data) {
              if (type) {
                const parsedData = parseEventData(data);
                setEvents((prev) => [...prev, { type, data: parsedData }]);
                
                if (type === 'bot_thinking') {
                  const content = parsedData.message?.content?.preview || data;
                  const step = {
                    id: stepCounter++,
                    title: getStepTitle(content),
                    content: content,
                    timestamp: new Date().toLocaleTimeString(),
                    index: stepCounter - 1
                  };
                  setThinkingSteps(prev => [...prev, step]);
                } else if (type === 'bot_response') {
                  setFinalResponse(parsedData.message?.content?.preview || data);
                } else if (type === 'system_stats') {
                  setSystemStats(parsedData);
                }
              } else {
                setEvents((prev) => [...prev, { type: 'file_data', data: data }]);
              }
            }
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
          setIsConnected(false);
        }
      }
    };

    fetchSSE();
    
    return () => {
      isCancelled = true;
    };
  }, [endpoint]);

  const getStepTitle = (content) => {
    if (content.includes('🤔')) return 'Initial Analysis';
    if (content.includes('💡')) return 'Planning Strategy';
    if (content.includes('🔍')) return 'Website Selection';
    if (content.includes('✅')) return 'Selection Complete';
    if (content.includes('📋')) return 'Analysis Planning';
    if (content.includes('🌐')) return 'Fetching Content';
    if (content.includes('📊')) return 'Content Analysis';
    if (content.includes('📦')) return 'Content Received';
    if (content.includes('🧠')) return 'Processing Data';
    if (content.includes('📝')) return 'Extracting Information';
    if (content.includes('🎉')) return 'Analysis Complete';
    if (content.includes('❌')) return 'Error Encountered';
    if (content.includes('🤷‍♂️')) return 'Error Handling';
    return 'Processing Step';
  };

  // Extract file_data events for file stream demo
  const fileDataEvents = events.filter(e => e.type === 'file_data');

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: 8, color: '#2c3e50' }}>{title}</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>{description}</p>
        {endpoint === 'sse-system-stats' && <SystemStatsDisplay stats={systemStats} />}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ 
            padding: '8px 16px',
            borderRadius: 20,
            background: isConnected ? '#e8f5e8' : '#ffe8e8',
            color: isConnected ? '#2e7d32' : '#d32f2f',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: isConnected ? '#4caf50' : '#f44336',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <button 
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #ddd', 
              borderRadius: 20,
              background: '#f8f9fa',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#e9ecef'}
            onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
          >
            Clear All
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 20,
            border: '1px solid #ffcdd2'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* File stream data display */}
        {endpoint !== 'sse-system-stats' && fileDataEvents.length > 0 && (
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <h3 style={{ color: '#3498db', marginBottom: 12, fontSize: 18 }}>File Content Stream</h3>
            <div style={{ maxHeight: 350, overflowY: 'auto', fontFamily: 'monospace', fontSize: 15 }}>
              {fileDataEvents.map((event, idx) => (
                <div key={idx} style={{ color: '#2c3e50', padding: '4px 0', borderBottom: '1px solid #e9ecef' }}>
                  {event.data}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline accordion */}
        {endpoint !== 'sse-system-stats' && (
        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 0, minHeight: 100, marginBottom: 24 }}>
          <div 
            onClick={() => setTimelineOpen(open => !open)}
            style={{
              cursor: 'pointer',
              padding: '20px 24px',
              borderBottom: timelineOpen ? '1px solid #e9ecef' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: timelineOpen ? '#f8f9fa' : '#f4f4f4',
              fontWeight: 600,
              fontSize: 18,
              color: '#2c3e50',
              borderRadius: '12px 12px 0 0'
            }}
          >
            Thinking...
            <span style={{ fontSize: 18, marginLeft: 12 }}>{timelineOpen ? '▲' : '▼'}</span>
          </div>
          {timelineOpen && thinkingSteps.length > 0 && (
            <div style={{ padding: 24 }}>
              <Timeline steps={thinkingSteps} />
            </div>
          )}
          {timelineOpen && thinkingSteps.length === 0 && !fileDataEvents.length && !error && (
            <div style={{ color: '#6c757d', textAlign: 'center', padding: '60px 20px', fontSize: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: 16 }}>🤖</div>
              Waiting for AI to start thinking...
            </div>
          )}
        </div>
        )}
        {endpoint !== 'sse-system-stats' && <ResponseSection
          content={finalResponse} 
          isVisible={!!finalResponse}
        />}
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SSEDemo;

function SystemStatsDisplay({ stats }) {
  if (!stats) {
    return (
      <div style={{ color: '#6c757d', textAlign: 'center', padding: '40px 20px', fontSize: '16px' }}>
        Waiting for system stats...
      </div>
    );
  }

  const barStyle = (percent) => ({
    width: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
    height: '20px',
  });

  const innerBarStyle = (percent, color) => ({
    width: `${percent}%`,
    backgroundColor: color,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    transition: 'width 0.5s ease-in-out',
  });

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ color: '#17a2b8', marginBottom: 16, fontSize: 18 }}>System Vitals</h3>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: '#343a40' }}>Overall CPU: {stats.cpu_overall_percent}%</strong>
        <div style={barStyle(stats.cpu_overall_percent)}>
          <div style={innerBarStyle(stats.cpu_overall_percent, '#007bff')}>
            {stats.cpu_overall_percent}%
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: '#343a40' }}>Memory: {stats.memory_percent}%</strong>
        <div style={barStyle(stats.memory_percent)}>
          <div style={innerBarStyle(stats.memory_percent, '#28a745')}>
            {stats.memory_percent}%
          </div>
        </div>
      </div>

      {stats.cpu_per_core_percent && (
        <div>
          <strong style={{ color: '#343a40', marginBottom: '8px', display: 'block' }}>CPU Per Core:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {stats.cpu_per_core_percent.map((cpu, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Core {index + 1}</div>
                <div style={barStyle(cpu)}>
                  <div style={innerBarStyle(cpu, '#fd7e14')}>
                    {cpu.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}