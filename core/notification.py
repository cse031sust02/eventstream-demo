import json

def send_notification(event_type, sender, message):
    event = {
        "sender": sender,
        "message": {
            "type": "text",
            "content": {
                "preview": message
            }
        }
    }
    yield f"event: {event_type}\ndata: {json.dumps(event)}\n\n"
    yield f": keep-alive\n\n" 