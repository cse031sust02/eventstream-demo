import time
from core.notification import send_notification

def search_the_web():
    # Step 1: Searching the web
    yield from send_notification("bot_thinking", "bot_brain", "Searching the web..")
    time.sleep(2)
    
    # Step 2: Found the result
    yield from send_notification("bot_thinking", "bot_brain", "Found the result web..")
    time.sleep(2)
    
    # Return the web content
    return "web content goes here"

def parse_result(content):
    # Simulate parsing and return result
    time.sleep(2)
    return f"Parsed result: {content}" 