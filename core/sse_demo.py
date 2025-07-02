from django.http import StreamingHttpResponse
import os
import time

# Path to the large file (update as needed)
LARGE_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'large_file.txt')

def file_stream_generator():
    if not os.path.exists(LARGE_FILE_PATH):
        yield f"data: File not found: {LARGE_FILE_PATH}\n\n"
        return
    with open(LARGE_FILE_PATH, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                yield f"data: {line}\n\n"
                time.sleep(0.5)  # Add delay between sentences

def sse_demo(request):
    response = StreamingHttpResponse(file_stream_generator(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response 