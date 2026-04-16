# Customer Segmentation using K-Means Clustering

## Folder Structure

```
customer-segmentation/
├── backend/
│   ├── app.py
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        ├── UploadPage.js
        ├── UploadPage.css
        ├── DashboardPage.js
        └── DashboardPage.css
```

---

## Step-by-Step Setup (Windows)

### 1. Setup Backend (Terminal 1)

```bash
cd customer-segmentation/backend

# Create virtual environment
python -m venv venv

# Activate it (Windows CMD)
venv\Scripts\activate

# Install dependencies
pip install flask flask-cors pandas numpy scikit-learn

# Run backend
python app.py
```

Backend runs at: http://localhost:5000

---

### 2. Setup Frontend (Terminal 2 — new window)

```bash
cd customer-segmentation/frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend opens at: http://localhost:3000

---

## Dataset

Use the Mall Customer Segmentation dataset.
Download from: https://www.kaggle.com/datasets/vjchoudhary7/customer-segmentation-tutorial-in-python

Required columns:
- `Annual Income (k$)`
- `Spending Score (1-100)`

---

## API Routes

| Route      | Method | Description               |
|------------|--------|---------------------------|
| /upload    | POST   | Upload CSV, get preview   |
| /cluster   | POST   | Run K-Means, get results  |

---

## Features

- Upload any CSV with Income + Spending columns
- Choose K from 2-7
- Scatter plot with colored clusters
- Centroids shown as star markers
- Silhouette score displayed
- Dataset preview table
