
from fpdf import FPDF
import os

ARTIFACTS_DIR = r'C:\Users\akash\.gemini\antigravity\brain\c278bd14-9e1b-4580-9dd7-b3e36d350258'

def make_brief():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('helvetica', 'B', 16)
    pdf.cell(0, 10, 'CASE SUMMARY: State vs. Rakesh Bansal (CASE-2026-0142)', ln=True)
    pdf.set_font('helvetica', '', 12)
    pdf.ln(5)
    
    text = '''Classification: CONFIDENTIAL
Investigating Officer: Insp. Rohan Mehra
Charge: IPC Sec 420 (Cheating), Sec 384 (Extortion), IT Act Sec 66C, 66D

The Story:
Mr. Rakesh Bansal and Mr. Vivek Chandra are business partners sharing joint corporate bank accounts.
On August 8th, 2026, Rakesh Bansal claimed he received a terrifying message on an encrypted chat app. An anonymous hacker threatened to leak all of their company's highly sensitive client data unless a massive ransom was paid. 
Over the next 48 hours, Rs. 1.42 Crore was wired out of their HDFC Bank corporate account to two unknown companies: Silverline Traders and Kunal Enterprises.

The Twist:
Vivek Chandra suspected Rakesh faked the threat. The Police Investigation uncovered two red flags:
1. To transfer that much money, you physically need the hardware Auth Token USB drive stored at the office.
2. The night-shift security guard, Ramlal Yadav, testified that at 11:40 PM, a mysterious man with a black laptop bag showed up, claimed Rakesh had authorized him, and went up to the office for 20 minutes.

The Police Theory: Rakesh faked the message, then sent an accomplice to the office to use the USB token to wire the money to shell companies Rakesh controls.'''

    pdf.multi_cell(0, 8, text)
    pdf.output(os.path.join(ARTIFACTS_DIR, 'Case_Brief_Rakesh_Bansal.pdf'))

def make_fir():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('helvetica', 'B', 18)
    pdf.cell(0, 10, 'FIRST INFORMATION REPORT (F.I.R.)', align='C', ln=True)
    pdf.set_font('helvetica', '', 12)
    pdf.cell(0, 10, 'Police Station: Andheri Police Station, Mumbai', ln=True)
    pdf.cell(0, 10, 'FIR No. / Year: 0142 / 2026', ln=True)
    pdf.cell(0, 10, 'Date & Time: 10-Aug-2026 14:30 HRS', ln=True)
    pdf.cell(0, 10, 'Complainant: Vivek Chandra (Director, Chandra Exports Pvt. Ltd.)', ln=True)
    pdf.cell(0, 10, 'Accused: Rakesh Bansal / Unknown Accomplices', ln=True)
    pdf.ln(10)
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'Details of the Incident:', ln=True)
    pdf.set_font('helvetica', '', 12)
    pdf.multi_cell(0, 8, 'I, Vivek Chandra, register this formal complaint regarding a cyber extortion scheme and unauthorized siphoning of corporate funds. On 08-Aug-2026, Rakesh Bansal claimed to receive an extortion demand via a messaging app on his mobile (+91 98XXX-44127). Following this, Rs. 1,42,00,000 was transferred out of our joint corporate accounts to unknown beneficiary accounts without proper authorization. We suspect Mr. Bansal orchestrated this, as he had exclusive physical access to the corporate authentication tokens stored at his office.')
    pdf.output(os.path.join(ARTIFACTS_DIR, 'FIR_2026_0142.pdf'))

def make_witness():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('times', 'B', 18)
    pdf.cell(0, 10, 'STATEMENT OF WITNESS', align='C', ln=True)
    pdf.set_font('times', '', 12)
    pdf.cell(0, 10, 'Location: Marine Heights Society, Mumbai', ln=True)
    pdf.cell(0, 10, 'Date: 10th August 2026', ln=True)
    pdf.cell(0, 10, 'Witness Name: Ramlal Yadav (Security Guard)', ln=True)
    pdf.ln(10)
    pdf.multi_cell(0, 8, 'I, Ramlal Yadav, am employed as a security guard at Marine Heights Society. On the night of 8th August 2026, my shift began at 6:00 PM. At approximately 6:30 PM, I observed the complainant, Mr. Rakesh Bansal, leave the premises. He did not return during my shift.\n\nAt around 11:40 PM, an unidentified individual carrying a black laptop bag entered the lobby. The individual claimed they were IT support arriving for emergency server maintenance at Bansal Trading Co. They proceeded to the office floor and exited the building approximately 20 minutes later.\n\nI did not log this entry as the individual stated Mr. Bansal had already authorized the visit over the phone, and they appeared to be in a rush.')
    pdf.output(os.path.join(ARTIFACTS_DIR, 'Witness_Statement_02.pdf'))

def make_bank():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('courier', 'B', 18)
    pdf.cell(0, 10, 'HDFC BANK - TRANSACTION AUDIT REPORT', ln=True)
    pdf.set_font('courier', '', 12)
    pdf.cell(0, 10, 'Account: BANSAL TRADING CO. (CURRENT) 502000XXXXXX12', ln=True)
    pdf.cell(0, 10, 'Statement Period: 08-Aug-2026 to 10-Aug-2026', ln=True)
    pdf.ln(10)
    pdf.multi_cell(0, 8, '08-Aug-2026 | IMPS/P2A/8921822 | NEFT VENDOR PAYMENT | DEBIT: 45,000.00\n\n09-Aug-2026 | RTGS/HDFC/090826/A1 | URGENT WIRE - SILVERLINE TRADERS (AUTH TOKEN IP: 192.168.1.44) | DEBIT: 1,15,00,000.00\n\n10-Aug-2026 | RTGS/HDFC/100826/B2 | URGENT WIRE - KUNAL ENTERPRISES (AUTH TOKEN IP: 192.168.1.44) | DEBIT: 27,00,000.00\n\nTOTAL UNAUTHORIZED WITHDRAWALS (09-Aug to 10-Aug): INR 1,42,00,000.00')
    pdf.output(os.path.join(ARTIFACTS_DIR, 'Bank_Transaction_Report_04.pdf'))

try:
    make_brief()
    make_fir()
    make_witness()
    make_bank()
    print('PDFs generated successfully')
except Exception as e:
    import traceback
    traceback.print_exc()

