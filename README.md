# Unemployment Analysis in India: Economic Intelligence Mining & Neural Forecasting

## 📌 Overview

This project is an End-to-End Data Science and Economic Analytics platform designed to analyze unemployment trends across India during the COVID-19 pandemic (May 2019 – November 2020).

The system combines Data Mining, Machine Learning, Deep Learning, and Business Intelligence techniques to identify unemployment patterns, forecast future unemployment rates, and classify regions based on economic impact. Results are stored in MongoDB and visualized through an interactive React dashboard.

---

## 🎯 Objectives

* Analyze unemployment trends before and during COVID-19.
* Measure regional economic impact across Indian states.
* Forecast unemployment rates using Deep Learning models.
* Identify high-impact economic zones using clustering techniques.
* Generate Power BI-compatible datasets.
* Provide an interactive dashboard for visualization and reporting.

---

## 🏗️ System Architecture

```text
Data Collection
      ↓
Data Cleaning
      ↓
Feature Engineering
      ↓
Statistical Analysis
      ↓
Deep Learning Forecasting
      ↓
Clustering Analysis
      ↓
MongoDB Storage
      ↓
Flask REST API
      ↓
React Dashboard
      ↓
Power BI Reporting
```

---

## 🛠️ Technology Stack

### Backend

* Python 3.10
* Pandas
* NumPy
* Scikit-Learn
* TensorFlow
* Flask

### Database

* MongoDB

### Frontend

* React 18
* Vite
* Tailwind CSS
* Recharts

### Machine Learning & Data Mining

* Linear Regression
* Multi-Layer Perceptron (MLP)
* K-Means Clustering

### Reporting

* Power BI
* CSV Export

---

## 📂 Project Structure

```text
project/
│
├── datasets/
│   ├── Unemployment in India.csv
│   └── Unemployment_Rate_upto_11_2020.csv
│
├── backend/
│   ├── main.py
│   ├── data_loader.py
│   ├── regression.py
│   ├── neural_network.py
│   ├── clustering.py
│   ├── database_manager.py
│   └── server.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── results_for_powerbi.csv
├── requirements.txt
└── README.md
```

---

## 📊 Dataset Information

### Source

Kaggle – Unemployment in India Dataset

### Time Period

May 2019 – November 2020

### Key Features

* Region
* Date
* Estimated Unemployment Rate (%)
* Estimated Employed Population
* Estimated Labour Participation Rate (%)
* Area (Urban/Rural)

---

## ⚙️ Data Processing Pipeline

### Data Ingestion

* Load unemployment datasets.
* Merge multiple sources.
* Handle missing values.

### Data Cleaning

* Remove duplicates.
* Standardize column names.
* Convert date formats.
* Handle null values.

### Feature Engineering

* Monthly unemployment trends.
* Pandemic impact indicators.
* Regional unemployment statistics.

---

## 📈 Statistical Analysis

A Linear Regression model is used to:

* Identify unemployment growth patterns.
* Analyze employment relationships.
* Detect trend shifts during lockdown periods.

### Outputs

* Regression coefficients
* Correlation metrics
* Trend visualizations

---

## 🧠 Deep Learning Forecasting

The forecasting module uses a TensorFlow-based Multi-Layer Perceptron (MLP) Neural Network.

### Features

* Non-linear pattern recognition
* Unemployment forecasting
* Economic impact prediction

### Network Architecture

```text
Input Layer
      ↓
Hidden Layer (ReLU)
      ↓
Hidden Layer (ReLU)
      ↓
Output Layer
```

### Evaluation Metrics

* Mean Squared Error (MSE)
* Mean Absolute Error (MAE)
* R² Score

---

## 🔍 Clustering Analysis

K-Means Clustering is applied to group states and regions according to unemployment characteristics.

### Cluster Categories

* Low Impact Regions
* Moderate Impact Regions
* High Impact Regions
* Critical Economic Impact Zones

### Benefits

* Economic segmentation
* Policy planning support
* Resource allocation insights

---

## 🗄️ MongoDB Integration

The application stores analytical outputs in MongoDB.

### Collections

* Raw Data
* Cleaned Data
* Regression Results
* Forecast Results
* Cluster Assignments

---

## 🌐 REST API

Flask serves as the backend API layer.

### Endpoints

```http
GET /api/data
GET /api/regression
GET /api/forecast
GET /api/clusters
```

---

## 📊 Dashboard Features

### React Dashboard

* Interactive unemployment charts
* State-wise analysis
* Forecast visualization
* Cluster distribution reports

### Visualization Tools

* Recharts
* Tailwind CSS

---

## 📈 Power BI Integration

The project exports enriched analytical results into:

```text
results_for_powerbi.csv
```

This dataset can be imported directly into Power BI for:

* Executive Dashboards
* Trend Analysis
* Regional Impact Monitoring
* Forecast Reporting

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/unemployment-analysis-india.git
cd unemployment-analysis-india
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start MongoDB

```bash
mongod
```

### Run Analysis Pipeline

```bash
python main.py
```

### Start Flask API

```bash
python server.py
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Sample Outputs

* Unemployment Trend Graphs
* Regression Analysis Reports
* Neural Network Forecasts
* Economic Impact Clusters
* Power BI Ready Dataset

---

## 🔮 Future Enhancements

* LSTM-based Time Series Forecasting
* Real-Time Economic Data Integration
* State-Level Prediction APIs
* Geospatial Heatmaps
* Automated Power BI Deployment
* Docker Containerization

---

## 📚 Learning Outcomes

This project demonstrates practical implementation of:

* Data Mining
* Economic Analytics
* Machine Learning
* Deep Learning
* Unsupervised Learning
* Data Engineering
* REST API Development
* Full Stack Data Science
* Business Intelligence Reporting

---

## 👩‍💻 Author

**Drishti Tripathi**
B.Tech (Data Science)
Dev Bhoomi Uttarakhand University

---

## 📜 License

This project is licensed under the MIT License.

Feel free to use, modify, and distribute this project for educational and research purposes.

