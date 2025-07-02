from django.http import StreamingHttpResponse
from core.helper import search_the_web, parse_result
from core.notification import send_notification

def sse_demo_2(request):
    def event_stream():
        # Call search_the_web (it will yield its own notifications)
        web_content = None
        gen = search_the_web()
        try:
            while True:
                val = next(gen)
                yield val
        except StopIteration as e:
            web_content = e.value
        
        # Call parse_result (it will also yield its own notifications)
        gen = parse_result(web_content)
        try:
            while True:
                val = next(gen)
                yield val
        except StopIteration as e:
            result = e.value
        
        # Send final result
        yield from send_notification("bot_response", "bot", result)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # For nginx, if you use it
    return response 