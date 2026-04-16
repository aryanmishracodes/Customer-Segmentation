import React, { useState } from 'react';
import UploadPage from './UploadPage';
import DashboardPage from './DashboardPage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('upload');
  const [uploadData, setUploadData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const goToDashboard = (data, file) => {
    setUploadData(data);
    setUploadedFile(file);
    setPage('dashboard');
  };

  const goBack = () => {
    setPage('upload');
    setClusterData(null);
  };

  return (
    <div className="app">
      {page === 'upload' ? (
        <UploadPage onSuccess={goToDashboard} />
      ) : (
        <DashboardPage
          uploadData={uploadData}
          uploadedFile={uploadedFile}
          clusterData={clusterData}
          setClusterData={setClusterData}
          onBack={goBack}
        />
      )}
    </div>
  );
}
