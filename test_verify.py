
import urllib.request, json
try:
    base_url = 'https://leximind-backend.onrender.com'
    req = urllib.request.Request(base_url + '/api/auth/login/', 
        data=json.dumps({'username': 'io.mehra', 'password': 'secure123'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req, timeout=60)
    token = json.loads(res.read()).get('access')
    
    # get docs to find invoice
    req2 = urllib.request.Request(base_url + '/api/documents/', headers={'Authorization': 'Bearer ' + token})
    docs = json.loads(urllib.request.urlopen(req2).read())
    invoice = next((d for d in docs['results'] if 'Invoice' in d['name']), None)
    if not invoice:
        print('no invoice found')
        exit()
    
    # verify
    req3 = urllib.request.Request(base_url + '/api/blockchain/verify/',
        data=json.dumps({'documentId': invoice['id']}).encode(),
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
    )
    res3 = urllib.request.urlopen(req3)
    print('Verify:', res3.read().decode())
except Exception as e:
    import traceback
    traceback.print_exc()

