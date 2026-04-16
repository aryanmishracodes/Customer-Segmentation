import React, { useState, useRef } from 'react';
import axios from 'axios';
import './UploadPage.css';

export default function UploadPage({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a CSV file first.'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('http://localhost:5000/upload', formData);
      onSuccess(res.data, file);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      {/* Background grid */}
      <div className="bg-grid" />

      <div className="upload-container">
        <header className="upload-header">
          <div className="badge">K-MEANS CLUSTERING</div>
          <h1>Customer<br /><span className="accent">Segmentation</span></h1>
          <p className="subtitle">Upload your Mall Customer dataset and discover hidden segments using unsupervised machine learning.</p>
        </header>

        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="drop-icon">
            {file ? '✓' : '⬆'}
          </div>
          {file ? (
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <>
              <p className="drop-text">Drop your CSV here</p>
              <p className="drop-hint">or click to browse</p>
            </>
          )}
        </div>

        {error && <div className="error-box">⚠ {error}</div>}

        <button
          className={`upload-btn ${loading ? 'loading' : ''}`}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? (
            <span className="spinner-row"><span className="spinner" /> Analyzing...</span>
          ) : (
            'Analyze Dataset →'
          )}
        </button>

        <div className="info-cards">
          <div className="info-card">
            <span className="info-icon">📊</span>
            <span>Annual Income</span>
          </div>
          <div className="info-card">
            <span className="info-icon">💯</span>
            <span>Spending Score</span>
          </div>
          <div className="info-card">
            <span className="info-icon">🎯</span>
            <span>K-Means (k=5)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
