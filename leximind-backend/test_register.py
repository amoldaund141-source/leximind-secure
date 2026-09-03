
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.documents.models import Document
from apps.blockchain.services.ledger import get_ledger

doc = Document.objects.filter(name__icontains='Invoice').last()
if doc:
    print('Found doc:', doc.name)
    try:
        ledger = get_ledger()
        ledger.register(doc, doc.uploaded_by)
        print('Registered successfully')
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print('No doc')

