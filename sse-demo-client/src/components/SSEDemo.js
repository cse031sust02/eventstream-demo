import React, { useEffect, useState } from 'react';

function parseEventData(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function ThinkingStep({ step, isExpanded, onToggle, isLast }) {
  const getStepColor = (content) => {
    if (content.includes('❌')) return '#ff6b6b';
    if (content.includes('✅')) return '#51cf66';
    if (content.includes('🎉')) return '#339af0';
    return '#339af0';
  };

  const getStepNumber = (index) => {
    return String(index + 1).padStart(2, '0');
  };

  return (
    <div style={{ 
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
        background: getStepColor(step.content),
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
        {getStepNumber(step.index)}
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
        <div 
          onClick={onToggle}
          style={{
            padding: '16px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isExpanded ? '#f8f9fa' : 'white',
            borderBottom: isExpanded ? '1px solid #e9ecef' : 'none',
            transition: 'background-color 0.2s'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 4
            }}>
              {step.title}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#868e96',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{step.timestamp}</span>
              {!isLast && (
                <>
                  <span>•</span>
                  <span style={{ color: '#339af0', fontWeight: '500' }}>Processing...</span>
                </>
              )}
            </div>
          </div>
          
          <div style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: '14px',
            color: '#868e96',
            marginLeft: 12
          }}>
            ▼
          </div>
        </div>
        
        {isExpanded && (
          <div style={{ 
            padding: '20px',
            background: '#f8f9fa',
            borderTop: '1px solid #e9ecef'
          }}>
            <div style={{ 
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#495057'
            }}>
              {step.content.replace(/[🤔💡🔍✅📋🌐📊📦🧠📝🎉❌🤷‍♂️]/g, '')}
            </div>
          </div>
        )}
      </div>
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
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [finalResponse, setFinalResponse] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setEvents([]);
    setError(null);
    setIsConnected(false);
    setThinkingSteps([]);
    setFinalResponse(null);
    setExpandedSteps(new Set());

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
                  setExpandedSteps(prev => new Set([...prev, step.id]));
                } else if (type === 'bot_response') {
                  setFinalResponse(parsedData.message?.content?.preview || data);
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

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const clearEvents = () => {
    setEvents([]);
    setError(null);
    setThinkingSteps([]);
    setFinalResponse(null);
    setExpandedSteps(new Set());
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: 8, color: '#2c3e50' }}>{title}</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>{description}</p>
        
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
            onClick={clearEvents} 
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

        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 24, minHeight: 300 }}>
          {thinkingSteps.length === 0 && !error && (
            <div style={{ 
              color: '#6c757d', 
              textAlign: 'center', 
              padding: '60px 20px',
              fontSize: '16px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 16 }}>🤖</div>
              Waiting for AI to start thinking...
            </div>
          )}
          
          {thinkingSteps.length > 0 && (
            <div style={{ position: 'relative' }}>
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
              
              {thinkingSteps.map((step, idx) => (
                <ThinkingStep
                  key={step.id}
                  step={{ ...step, index: idx }}
                  isExpanded={expandedSteps.has(step.id)}
                  onToggle={() => toggleStep(step.id)}
                  isLast={idx === thinkingSteps.length - 1}
                />
              ))}
            </div>
          )}
          
          <ResponseSection 
            content={finalResponse} 
            isVisible={!!finalResponse}
          />
        </div>
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