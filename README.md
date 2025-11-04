# AnyToPDF — Backend (Render)

Node + Express endpoint for converting any file to PDF (via LibreOffice) and merging PDFs in order.

Deploy on Render:
- Build Command: npm install
- Start Command: npm start

Endpoint:
POST /convert?type=convert|merge
Field: files (multipart/form-data)
