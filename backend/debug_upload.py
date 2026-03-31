import requests
import os

login_data = {
    "email": "demo.candidate@skillbridge.dev",
    "password": "Demo@1234"
}

res = requests.post("http://localhost:8000/api/auth/login", json=login_data)
token = res.json()["token"]

text = "Python React FastAPI SQL Docker " * 20
pdf_content = f"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<< /Length 1000 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n({text}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000287 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n1180\n%%EOF".encode()

with open("dummy_big.pdf", "wb") as f:
    f.write(pdf_content)

print("Attempting upload...")
with open("dummy_big.pdf", "rb") as f:
    files = {"resume": ("resume.pdf", f, "application/pdf")}
    headers = {"Authorization": f"Bearer {token}"}
    upload_res = requests.post("http://localhost:8000/api/candidates/upload-resume", files=files, headers=headers)

print("Upload response code:", upload_res.status_code)
print("Upload response text:", upload_res.text)
