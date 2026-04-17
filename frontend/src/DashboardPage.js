import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import './DashboardPage.css';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const CLUSTER_COLORS = [
  '#7c3aed', // violet
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // purple
  '#14b8a6', // teal
];

const CLUSTER_NAMES = [
  'Budget Conscious',
  'High Value',
  'Moderate Spenders',
  'Careful Savers',
  'Impulsive Buyers',
  'Segment F',
  'Segment G',
];

export default function DashboardPage({ uploadData, uploadedFile, clusterData, setClusterData, onBack }) {
  const [k, setK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const BASE_URL = "https://customer-segmentation-vgb3.onrender.com";
  useEffect(() => {
    runClustering();
    // eslint-disable-next-line
  }, []);

  const runClustering = async (kVal) => {
    const kToUse = kVal ?? k;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('k', kToUse);
      const res = await axios.post(`${BASE_URL}/cluster`, formData);
      setClusterData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Clustering failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleKChange = (newK) => {
    setK(newK);
    runClustering(newK);
  };

  const buildChartData = () => {
    if (!clusterData) return { datasets: [] };

    const grouped = {};
    for (let i = 0; i < clusterData.k; i++) grouped[i] = [];

    clusterData.points.forEach((p) => {
      grouped[p.cluster].push({ x: p.x, y: p.y });
    });

    const datasets = Object.keys(grouped).map((ci) => ({
      label: CLUSTER_NAMES[ci] || `Cluster ${parseInt(ci) + 1}`,
      data: grouped[ci],
      backgroundColor: CLUSTER_COLORS[ci] + 'aa',
      borderColor: CLUSTER_COLORS[ci],
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 7,
    }));

    // Centroids
    datasets.push({
      label: 'Centroids',
      data: clusterData.centroids.map((c) => ({ x: c.x, y: c.y })),
      backgroundColor: '#ffffff',
      borderColor: '#ffffff',
      borderWidth: 2,
      pointRadius: 10,
      pointHoverRadius: 12,
      pointStyle: 'star',
    });

    return { datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e8e8f0',
          font: { family: 'Space Mono', size: 11 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a24',
        borderColor: '#2a2a3a',
        borderWidth: 1,
        titleColor: '#e8e8f0',
        bodyColor: '#6b6b80',
        callbacks: {
          label: (ctx) => {
            return `  Income: ${ctx.parsed.x}k  |  Score: ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: clusterData?.income_col || 'Annual Income (k$)',
          color: '#6b6b80',
          font: { family: 'Space Mono', size: 11 },
        },
        ticks: { color: '#6b6b80', font: { family: 'Space Mono', size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        title: {
          display: true,
          text: clusterData?.spending_col || 'Spending Score (1-100)',
          color: '#6b6b80',
          font: { family: 'Space Mono', size: 11 },
        },
        ticks: { color: '#6b6b80', font: { family: 'Space Mono', size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  // Count per cluster
  const clusterCounts = {};
  if (clusterData) {
    clusterData.points.forEach((p) => {
      clusterCounts[p.cluster] = (clusterCounts[p.cluster] || 0) + 1;
    });
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="sidebar-badge">ANALYSIS</div>
          <h2>Cluster<br /><span>Dashboard</span></h2>
        </div>

        <div className="dataset-info">
          <div className="info-label">DATASET</div>
          <div className="info-value mono">{uploadedFile?.name}</div>
          <div className="info-row">
            <span className="info-label">ROWS</span>
            <span className="info-value mono">{uploadData?.rows?.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">COLUMNS</span>
            <span className="info-value mono">{uploadData?.columns?.length}</span>
          </div>
        </div>

        <div className="k-control">
          <div className="info-label">NUMBER OF CLUSTERS (K)</div>
          <div className="k-buttons">
            {[2, 3, 4, 5, 6, 7].map((v) => (
              <button
                key={v}
                className={`k-btn ${k === v ? 'active' : ''}`}
                onClick={() => handleKChange(v)}
                disabled={loading}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {clusterData && (
          <>
            <div className="score-card">
              <div className="info-label">SILHOUETTE SCORE</div>
              <div className="score-value">{clusterData.silhouette_score}</div>
              <div className="score-hint mono">Higher is better (max 1.0)</div>
            </div>

            <div className="cluster-list">
              <div className="info-label" style={{ marginBottom: '0.6rem' }}>CLUSTER BREAKDOWN</div>
              {Object.keys(clusterCounts).map((ci) => (
                <div className="cluster-item" key={ci}>
                  <span
                    className="cluster-dot"
                    style={{ background: CLUSTER_COLORS[ci] }}
                  />
                  <span className="cluster-label">{CLUSTER_NAMES[ci] || `Cluster ${parseInt(ci)+1}`}</span>
                  <span className="cluster-count mono">{clusterCounts[ci]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <div className="sidebar-error">⚠ {error}</div>}
      </aside>

      <main className="main-area">
        <div className="main-header">
          <h3>Scatter Plot — Customer Segments</h3>
          <div className="point-count mono">
            {clusterData ? `${clusterData.points.length} customers` : ''}
          </div>
        </div>

        <div className="chart-container">
          {loading ? (
            <div className="chart-loading">
              <div className="big-spinner" />
              <p>Running K-Means...</p>
            </div>
          ) : clusterData ? (
            <Scatter data={buildChartData()} options={chartOptions} />
          ) : (
            <div className="chart-loading">
              <p>No data yet</p>
            </div>
          )}
        </div>

        {uploadData?.preview && (
          <div className="table-section">
            <div className="table-header">
              <span>Dataset Preview</span>
              <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>first 10 rows</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {uploadData.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadData.preview.map((row, i) => (
                    <tr key={i}>
                      {uploadData.columns.map((col) => (
                        <td key={col}>{row[col] ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
