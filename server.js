import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import libre from "libreoffice-convert";
import { execSync } from "child_process";
import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// 🔧 Detecta si LibreOffice existe
let librePath = null;
try {
  const version = execSync("soffice --version").toString();
  console.log("LibreOffice found:", version);
  librePath = "/usr/bin/soffice";
} catch {
  console.warn("LibreOffice not found, will use fallback conversion.");
}

// 🔄 convierte imágenes a PDF
async function imageToPDF(buffer) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const img = await pdfDoc.embedJpg(buffer).catch(() => pdfDoc.embedPng(buffer));
  const { width, height } = img.scale(0.5);
  page.drawImage(img, {
    x: 50,
    y: 400 - height / 2,
    width,
    height,
  });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// 🔄 convierte .docx usando Mammoth (sin LibreOffice)
async function docxToPDF(buffer) {
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const text = html.replace(/<[^>]+>/g, " ");
  page.drawText(text.substring(0, 3000), {
    x: 50,
    y: 780,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  return Buffer.from(await pdfDoc.save());
}

// 🧩 Ruta principal
app.post("/convert", upload.array("files"), async (req, res) => {
  const { type } = req.query;
  const files = req.files || [];

  try {
    if (!files.length) return res.status(400).send("No files uploaded");

    const pdfBuffers = [];

    for (const file of files) {
      const filePath = path.join(__dirname, file.path);
      const ext = path.extname(file.originalname).toLowerCase();
      const inputBuffer = fs.readFileSync(filePath);

      if (ext === ".pdf") {
        pdfBuffers.push(inputBuffer);
      } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        pdfBuffers.push(await imageToPDF(inputBuffer));
      } else if (ext === ".docx") {
        if (librePath) {
          try {
            libre._path = librePath;
            const pdfBuf = await new Promise((resolve, reject) => {
              libre.convert(inputBuffer, ".pdf", undefined, (err, done) => {
                if (err) reject(err);
                else resolve(done);
              });
            });
            pdfBuffers.push(pdfBuf);
          } catch (err) {
            console.warn("LibreOffice conversion failed, using fallback:", err.message);
            pdfBuffers.push(await docxToPDF(inputBuffer));
          }
        } else {
          pdfBuffers.push(await docxToPDF(inputBuffer));
        }
      } else {
        console.log("Unsupported file type:", ext);
      }
    }

    if (type === "merge" && pdfBuffers.length > 1) {
      const merged = await PDFDocument.create();
      for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const mergedBytes = await merged.save();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
      return res.send(Buffer.from(mergedBytes));
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");
      return res.send(pdfBuffers[0]);
    }
  } catch (e) {
    console.error("Processing error:", e);
    res.status(500).send("Processing error");
  } finally {
    for (const f of req.files || []) fs.unlink(f.path, () => {});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server ready on port ${port}`));
