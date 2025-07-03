from django.http import StreamingHttpResponse
import psutil
import time
import json

def system_stats_event_generator():
    # Yield initial per-core usage, otherwise the first overall reading can be skewed
    psutil.cpu_percent(percpu=True, interval=None)
    time.sleep(0.1) # Short delay before starting the loop

    while True:
        cpu_overall_percent = psutil.cpu_percent(interval=1, percpu=False)
        cpu_per_core_percent = psutil.cpu_percent(interval=None, percpu=True) # Get subsequent per-core without blocking for interval
        memory_stats = psutil.virtual_memory()
        memory_percent = memory_stats.percent

        data = {
            "cpu_overall_percent": cpu_overall_percent,
            "cpu_per_core_percent": cpu_per_core_percent,
            "memory_percent": memory_percent
        }

        # SSE format: event: <type>
        # data: <json_string>

        yield f"event: system_stats\ndata: {json.dumps(data)}\n\n"
        # No need for additional time.sleep here as psutil.cpu_percent(interval=1) already introduces a delay

def sse_system_stats(request):
    response = StreamingHttpResponse(system_stats_event_generator(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # For Nginx
    return response
