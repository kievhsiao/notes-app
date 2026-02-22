import json
import re
import hashlib
from datetime import datetime

import_file = 'tumblr-api.json'
notes_file = 'data/notes.jsonl'

# Simple function to clean HTML tags and extract img sources
def process_html(html_str):
    media = []
    # Extract images
    # findall <img ... src="url" ...>
    img_tags = re.findall(r'<img[^>]+src="([^"]+)"', html_str)
    for img in img_tags:
        media.append(img)
    
    # Strip HTML tags
    # replace <br> and <p> with newlines for formatting
    text = re.sub(r'<(br|p|div|/p|/div)[^>]*>', '\n', html_str)
    text = re.sub(r'<[^>]+>', '', text)
    
    # Unescape HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&apos;', "'")
    text = text.replace('&ldquo;', '"').replace('&rdquo;', '"')
    
    # Collapse multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text, media

def main():
    existing_notes = []
    try:
        with open(notes_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    existing_notes.append(json.loads(line))
    except FileNotFoundError:
        pass

    existing_titles = set(n.get('title', '') for n in existing_notes)
    existing_contents = set(n.get('content', '') for n in existing_notes)

    with open(import_file, 'r', encoding='utf-8') as f:
        text = f.read()
        json_str = text.replace('var tumblr_api_read = ', '', 1).strip()
        if json_str.endswith(';'): json_str = json_str[:-1]
        data = json.loads(json_str)

    posts = data.get('posts', [])
    new_notes = []
    
    for p in posts:
        if p.get('type') != 'regular':
            continue
            
        content_html = p.get('regular-body', '')
        content, media = process_html(content_html)
        title = p.get('regular-title', '')
        tags = p.get('tags', [])
        
        # parse date
        # "date-gmt":"2026-02-14 07:52:40 GMT" => we should probably use local time "date" 
        # or parse "date-gmt" and convert?
        # Actually gmt is easy to parse.
        date_str = p.get('date-gmt', '')
        # YYYY-MM-DD HH:MM:SS GMT
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S GMT')
            date_formatted = dt.strftime('%Y-%m-%dT%H:%M:%S')
        except:
            date_formatted = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            
        if not title:
            # use date as title if no title provided
            title = dt.strftime('%Y-%m-%d')
            
        # skip duplicates
        if title in existing_titles and content in existing_contents:
            print(f"Skipping duplicate: {title}")
            continue
            
        # compute md5
        hash_input = content + date_formatted + title
        md5_id = hashlib.md5(hash_input.encode('utf-8')).hexdigest()
        
        note = {
            "id": md5_id,
            "title": title,
            "date": date_formatted,
            "tags": tags,
            "media": media,
            "content": content
        }
        new_notes.append(note)
        
    all_notes = existing_notes + new_notes
    all_notes.sort(key=lambda x: x.get('date', ''))
    
    print(f"Parsed {len(posts)} posts. Added {len(new_notes)} new notes. Skipped {len(posts) - len(new_notes)} duplicates.")
    
    with open(notes_file, 'w', encoding='utf-8') as f:
        for n in all_notes:
            f.write(json.dumps(n, ensure_ascii=False) + '\n')
            
if __name__ == '__main__':
    main()
