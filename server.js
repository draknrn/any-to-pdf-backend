import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";
import libre from "libreoffice-convert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.array("files"), async (req, res) => {
  const { type } = req.query;
  const files = req.files || [];

  try {
    if (!files.length) return res.status(400).send("No files uploaded");

    const pdfBuffers = [];

    for (const file of files) {
      const filePath = path.join(__dirname, file.path);
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === ".pdf") {
        const data = fs.readFileSync(filePath);
        pdfBuffers.push(data);
      } else {
        const inputBuffer = fs.readFileSync(filePath);
        const pdfBuffer = await new Promise((resolve, reject) => {
          libre.convert(inputBuffer, ".pdf", undefined, (err, done) => {
            if (err) reject(err);
            else resolve(done);
          });
        });
        pdfBuffers.push(pdfBuffer);
      }
    }

    if (type === "merge" && pdfBuffers.length > 1) {
      const mergedPdf = await PDFDocument.create();
      for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => mergedPdf.addPage(p));
      }
      const mergedBytes = await mergedPdf.save();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
      return res.send(Buffer.from(mergedBytes));
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");
      return res.send(pdfBuffers[0]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Processing error");
  } finally {
    for (const f of req.files || []) {
      fs.unlink(f.path, () => {});
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server ready on ${port}`));
