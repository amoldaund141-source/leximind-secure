
import urllib.request, urllib.error, json
try:
    base_url = 'https://leximind-backend.onrender.com'
    req = urllib.request.Request(base_url + '/api/auth/login/', 
        data=json.dumps({'username': 'io.mehra', 'password': 'secure123'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req, timeout=60)
    token = json.loads(res.read()).get('access')
    print('Login successful!')
    req2 = urllib.request.Request(base_url + '/api/ai/cases/CASE-2026-0071/knowledge-graph/',
        headers={'Authorization': 'Bearer ' + token}
    )
    res2 = urllib.request.urlopen(req2, timeout=60)
    data2 = json.loads(res2.read())
    print('Nodes:', len(data2.get('nodes', [])))
except urllib.error.HTTPError as e:
    print('HTTP ERROR:', e.code)
    print(e.read())

