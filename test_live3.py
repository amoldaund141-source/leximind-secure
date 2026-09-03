
import urllib.request, json
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
    data = json.loads(res2.read())
    print('Nodes:', data.get('nodes'))
except Exception as e:
    print(e)

