import requests
import json

url = 'http://localhost:8000/api/swm/mcmi4/create'
headers = {
    'Authorization': 'Token 90f7ab25a594f47999f4f4b708c2f3f6928ecd4c',
    'Content-Type': 'application/json'
}
data = {
    'subject_user_id': 50,
    'mcmi4_source_data_id': 'MCMI4_TEST_FLOW_001',
    'config': {},
    'metadata': {'test': True}
}

print(f"REQUEST: POST {url}")
print(f"HEADERS: {headers}")
print(f"BODY: {json.dumps(data, indent=2)}")
print("\n--- RESPONSE ---")

try:
    response = requests.post(url, headers=headers, json=data, timeout=10)
    print(f"STATUS: {response.status_code}")
    print(f"HEADERS: {dict(response.headers)}")
    print(f"\nBODY:")
    
    if 'application/json' in response.headers.get('Content-Type', ''):
        print(json.dumps(response.json(), indent=2))
    else:
        # HTML error page
        body = response.text
        if '<h1>' in body:
            # Extract error message from HTML
            start = body.find('<h1>')
            end = body.find('</h1>', start) + 5
            print(body[start:end])
            
            # Look for exception info
            if 'Exception Type:' in body:
                exc_start = body.find('Exception Type:')
                exc_end = body.find('</table>', exc_start)
                if exc_end > exc_start:
                    print("\nEXCEPTION INFO:")
                    print(body[exc_start:exc_end+8])
        else:
            print(body[:500])
            
except Exception as e:
    print(f"ERROR: {e}")
