from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import io

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        content = file.read()
        df = pd.read_csv(io.BytesIO(content))
        preview = df.head(10).replace({np.nan: None}).to_dict(orient='records')
        return jsonify({
            'rows': len(df),
            'columns': list(df.columns),
            'preview': preview
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/cluster', methods=['POST'])
def cluster():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    k = int(request.form.get('k', 5))

    try:
        content = file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Find income and spending columns (flexible matching)
        income_col = None
        spending_col = None
        for col in df.columns:
            col_lower = col.lower()
            if 'income' in col_lower:
                income_col = col
            if 'spending' in col_lower or 'score' in col_lower:
                spending_col = col

        if not income_col or not spending_col:
            return jsonify({'error': f'Could not find Income and Spending Score columns. Found: {list(df.columns)}'}), 400

        X = df[[income_col, spending_col]].dropna().values

        if len(X) < k:
            return jsonify({'error': f'Not enough data points ({len(X)}) for {k} clusters'}), 400

        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)
        centroids = kmeans.cluster_centers_.tolist()
        score = silhouette_score(X, labels)

        points = []
        for i in range(len(X)):
            points.append({
                'x': float(X[i][0]),
                'y': float(X[i][1]),
                'cluster': int(labels[i])
            })

        return jsonify({
            'points': points,
            'centroids': [{'x': c[0], 'y': c[1]} for c in centroids],
            'silhouette_score': round(float(score), 4),
            'k': k,
            'income_col': income_col,
            'spending_col': spending_col
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return "Customer Segmentation API is running 🚀"

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
