import React, { useState } from "react";
import axios from "axios";
import FileUploader from "./components/FileUploader.jsx";
import FileList from "./components/FileList.jsx";
import Button from "./components/Button.jsx";

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [message, setMessage] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "https://your-backend.onrender.com";

  const onFilesSelected = (incoming) => {
    setFiles((prev) => [...prev, ...incoming]);
  };

  const clearState = () => {
    setFiles([]);
    setLoading(false);
    setDownloadUrl(null);
    setMessage("");
  };

  const send = async (type) => {
    if (!files.length) return alert("Upload at least one file");
    setLoading(true);
    setMessage("Processing your files…");
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const res = await axios.post(`${API_BASE}/convert`, fd, {
        params: { type },
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob"
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setMessage("Your PDF is ready! 🎉");
    } catch (e) {
      console.error(e);
      setMessage("There was an error processing your files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night text-white flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex items-center gap-3 mb-8">
        <img src="/logo1.webp" alt="logo" className="h-10 w-10 rounded-md" />
        <h1 className="text-3xl sm:text-4xl font-bold">
          AnyTo<span className="text-accent">PDF</span>
        </h1>
      </header>

      <main className="w-full max-w-4xl bg-card/80 backdrop-blur rounded-2xl p-6 shadow-soft border border-white/5">
        <p className="text-gray-300 mb-4">
          Upload any file to convert it to PDF, or upload multiple PDFs to merge them in the same order you added them.
        </p>

        <FileUploader onFilesSelected={onFilesSelected} />

        <FileList files={files} />

        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={() => send('convert')} loading={loading} variant="primary">
            Convert to PDF
          </Button>
          <Button onClick={() => send('merge')} loading={loading} variant="accent">
            Merge PDFs
          </Button>
          <button onClick={clearState} className="ml-auto text-sm text-gray-400 hover:text-white transition">
            Reset
          </button>
        </div>

        {message && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm">{message}</p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download="result.pdf"
                className="inline-block mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition shadow-soft"
              >
                Download PDF
              </a>
            )}
          </div>
        )}
      </main>

      <footer className="mt-10 text-xs text-gray-500">
        © {new Date().getFullYear()} AnyToPDF
      </footer>
    </div>
  );
}
