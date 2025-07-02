import time
import random
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from core.notification import send_notification

def search_the_web_real():
    # List of example websites to fetch
    websites = [
        "https://example.com",
        "https://httpbin.org/html",
        "https://jsonplaceholder.typicode.com/posts/1",
        "https://httpbin.org/json",
        "https://httpbin.org/xml"
    ]
    
    # Step 1: Initial thinking
    yield from send_notification("bot_thinking", "bot_brain", "Analyzing the task and preparing to search the web.")
    time.sleep(1.5)
    
    # Step 2: Planning
    yield from send_notification("bot_thinking", "bot_brain", "Selecting a website to demonstrate content parsing capabilities.")
    time.sleep(1.5)
    
    # Step 3: Website selection
    selected_url = random.choice(websites)
    yield from send_notification("bot_thinking", "bot_brain", f"Website selected: {selected_url}")
    time.sleep(1)
    
    # Step 4: Fetching
    yield from send_notification("bot_thinking", "bot_brain", "Fetching content from the selected website and preparing for analysis.")
    time.sleep(1.5)
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(selected_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Step 5: Ready for analysis
        yield from send_notification("bot_thinking", "bot_brain", f"Content fetched (HTTP {response.status_code}). Ready to analyze the structure and extract insights.")
        time.sleep(1.5)
        
        return {
            'url': selected_url,
            'content': response.text,
            'content_type': response.headers.get('content-type', 'text/html'),
            'status_code': response.status_code
        }
    except requests.RequestException as e:
        yield from send_notification("bot_thinking", "bot_brain", f"Error fetching website: {str(e)}")
        time.sleep(1.5)
        return {
            'url': selected_url,
            'content': f"Error: {str(e)}",
            'content_type': 'text/plain',
            'status_code': 0
        }

def parse_result_real(web_data):
    if not isinstance(web_data, dict):
        return f"Error: Invalid web data format - {web_data}"
    
    url = web_data.get('url', 'Unknown URL')
    content = web_data.get('content', '')
    content_type = web_data.get('content_type', 'text/html')
    status_code = web_data.get('status_code', 0)
    
    yield from send_notification("bot_thinking", "bot_brain", "Analyzing the website content and extracting key information.")
    time.sleep(1.5)
    
    try:
        if 'json' in content_type.lower():
            import json
            parsed_data = json.loads(content)
            result = f"JSON Analysis Report\n\nURL: {url}\nStatus: HTTP {status_code}\nContent Type: {content_type}\n\nParsed Data:\n{json.dumps(parsed_data, indent=2)[:500]}...\n\nSummary: This appears to be structured JSON data."
        elif 'xml' in content_type.lower():
            soup = BeautifulSoup(content, 'xml')
            result = f"XML Analysis Report\n\nURL: {url}\nStatus: HTTP {status_code}\nContent Type: {content_type}\nRoot Element: {soup.find().name if soup.find() else 'None'}\n\nContent Preview:\n{content[:500]}...\n\nSummary: This XML document has a hierarchical structure."
        else:
            soup = BeautifulSoup(content, 'html.parser')
            title = soup.find('title')
            title_text = title.get_text().strip() if title else "No title found"
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else "No description found"
            main_content = ""
            for tag in ['main', 'article', 'div']:
                main_elem = soup.find(tag)
                if main_elem:
                    main_content = main_elem.get_text().strip()[:200]
                    break
            if not main_content:
                body = soup.find('body')
                if body:
                    main_content = body.get_text().strip()[:200]
            result = f"Website Analysis Report\n\nURL: {url}\nStatus: HTTP {status_code}\nContent Type: {content_type}\nTitle: {title_text}\nDescription: {description}\n\nContent Preview:\n{main_content}...\n\nSummary: This appears to be a well-structured HTML page."
        yield from send_notification("bot_thinking", "bot_brain", "Analysis complete. Preparing the final report.")
        time.sleep(1)
        return result
    except Exception as e:
        yield from send_notification("bot_thinking", "bot_brain", f"Error parsing content: {str(e)}")
        time.sleep(1.5)
        return f"Error parsing content from {url}: {str(e)}" 