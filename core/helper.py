import time
import random
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from core.notification import send_notification

def search_the_web():
    # List of example websites to fetch
    websites = [
        "https://example.com",
        "https://httpbin.org/html",
        "https://jsonplaceholder.typicode.com/posts/1",
        "https://httpbin.org/json",
        "https://httpbin.org/xml"
    ]
    
    # Step 1: Searching the web
    yield from send_notification("bot_thinking", "bot_brain", "Searching the web..")
    time.sleep(1)
    
    # Select a random website
    selected_url = random.choice(websites)
    yield from send_notification("bot_thinking", "bot_brain", f"Selected website: {selected_url}")
    time.sleep(1)
    
    # Step 2: Fetching the content
    yield from send_notification("bot_thinking", "bot_brain", "Fetching content from the website...")
    time.sleep(1)
    
    try:
        # Fetch the website content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(selected_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        yield from send_notification("bot_thinking", "bot_brain", f"Successfully fetched content (Status: {response.status_code})")
        time.sleep(1)
        
        # Return the web content
        return {
            'url': selected_url,
            'content': response.text,
            'content_type': response.headers.get('content-type', 'text/html'),
            'status_code': response.status_code
        }
        
    except requests.RequestException as e:
        yield from send_notification("bot_thinking", "bot_brain", f"Error fetching website: {str(e)}")
        time.sleep(1)
        return {
            'url': selected_url,
            'content': f"Error: {str(e)}",
            'content_type': 'text/plain',
            'status_code': 0
        }

def parse_result(web_data):
    if not isinstance(web_data, dict):
        return f"Error: Invalid web data format - {web_data}"
    
    url = web_data.get('url', 'Unknown URL')
    content = web_data.get('content', '')
    content_type = web_data.get('content_type', 'text/html')
    status_code = web_data.get('status_code', 0)
    
    yield from send_notification("bot_thinking", "bot_brain", "Parsing the website content...")
    time.sleep(1)
    
    try:
        if 'json' in content_type.lower():
            # Parse JSON content
            import json
            parsed_data = json.loads(content)
            result = f"JSON Content from {url}:\n"
            result += f"Status Code: {status_code}\n"
            result += f"Content Type: {content_type}\n"
            result += f"Parsed JSON: {json.dumps(parsed_data, indent=2)[:500]}..."
            
        elif 'xml' in content_type.lower():
            # Parse XML content
            soup = BeautifulSoup(content, 'xml')
            result = f"XML Content from {url}:\n"
            result += f"Status Code: {status_code}\n"
            result += f"Content Type: {content_type}\n"
            result += f"Root Element: {soup.find().name if soup.find() else 'None'}\n"
            result += f"Content Preview: {content[:500]}..."
            
        else:
            # Parse HTML content
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract useful information
            title = soup.find('title')
            title_text = title.get_text().strip() if title else "No title found"
            
            # Get meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else "No description found"
            
            # Get main content (try to find meaningful text)
            main_content = ""
            for tag in ['main', 'article', 'div']:
                main_elem = soup.find(tag)
                if main_elem:
                    main_content = main_elem.get_text().strip()[:200]
                    break
            
            if not main_content:
                # Fallback to body text
                body = soup.find('body')
                if body:
                    main_content = body.get_text().strip()[:200]
            
            result = f"Website Analysis: {url}\n"
            result += f"Status Code: {status_code}\n"
            result += f"Content Type: {content_type}\n"
            result += f"Title: {title_text}\n"
            result += f"Description: {description}\n"
            result += f"Content Preview: {main_content}..."
        
        yield from send_notification("bot_thinking", "bot_brain", "Successfully parsed the content!")
        time.sleep(1)
        return result
        
    except Exception as e:
        error_msg = f"Error parsing content from {url}: {str(e)}"
        yield from send_notification("bot_thinking", "bot_brain", error_msg)
        time.sleep(1)
        return error_msg 