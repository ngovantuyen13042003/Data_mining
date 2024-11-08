import React, {useState, useEffect} from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import LineCharts from './components/LineCharts';
import Heatmap from './components/Heatmap';
import SeasonalDecomposition from './components/SeasonalDecomposition';

const App = () => {
  const [data, setData] = useState (null);
  const [correlationMatrix, setCorrelationMatrix] = useState (null);
  const [seasonalData, setSeasonalData] = useState (null);

  useEffect (() => {
    const fetchData = async () => {
      try {
        const response = await axios.get ('/weather_analysis.xlsx', {
          responseType: 'arraybuffer',
        });

        const rawData = new Uint8Array (response.data);
        const workbook = XLSX.read (rawData, {type: 'array'});

        const dataSheet = XLSX.utils.sheet_to_json (
          workbook.Sheets[workbook.SheetNames[0]],
          {header: 1}
        );

        const [header, ...rows] = dataSheet;

        const formattedData = rows.reduce ((acc, row) => {
          header.forEach ((key, index) => {
            acc[key] = acc[key] || [];
            acc[key].push (row[index]);
          });
          return acc;
        }, {});

        setData (formattedData);

        const numericData = Object.keys (formattedData).filter (
          key => key !== 'dt'
        );

        const matrix = numericData.map ((_, i) =>
          numericData.map ((_, j) =>
            pearsonCorrelation (
              formattedData[numericData[i]],
              formattedData[numericData[j]]
            )
          )
        );

        setCorrelationMatrix (matrix);

        const dtValues = formattedData.dt.map (
          d =>
            typeof d === 'number'
              ? new Date ((d - 25569) * 86400 * 1000)
              : new Date (d)
        );

        const observed = formattedData.temp;
        const trend = calculateTrend (observed, 24);
        const seasonal = calculateSeasonal (observed, trend, 24);
        const residual = calculateResidual (observed, trend, seasonal);

        setSeasonalData ({dt: dtValues, observed, trend, seasonal, residual});
      } catch (error) {
        console.error ('Error loading data:', error);
      }
    };

    fetchData ();
  }, []);

  const pearsonCorrelation = (x, y) => {
    const n = x.length;
    const [sumX, sumY, sumXY, sumX2, sumY2] = x.reduce (
      ([sx, sy, sxy, sx2, sy2], xi, i) => [
        sx + xi,
        sy + y[i],
        sxy + xi * y[i],
        sx2 + xi * xi,
        sy2 + y[i] * y[i],
      ],
      [0, 0, 0, 0, 0]
    );

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt (
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return numerator / denominator;
  };

  const calculateTrend = (data, windowSize) => {
    const trend = Array (data.length).fill (null);
    const halfWindow = Math.floor (windowSize / 2);

    for (let i = halfWindow; i < data.length - halfWindow; i++) {
      const window = data.slice (i - halfWindow, i + halfWindow + 1);
      trend[i] = window.reduce ((sum, val) => sum + val, 0) / window.length;
    }

    return trend;
  };

  const calculateSeasonal = (observed, trend, period) => {
    const seasonal = Array (period).fill (0);
    const counts = Array (period).fill (0);

    for (let i = 0; i < observed.length; i++) {
      if (trend[i] !== null) {
        const index = i % period;
        seasonal[index] += observed[i] - trend[i];
        counts[index]++;
      }
    }

    for (let i = 0; i < period; i++) {
      seasonal[i] = counts[i] ? seasonal[i] / counts[i] : 0;
    }

    return observed.map ((_, i) => seasonal[i % period]);
  };

  const calculateResidual = (observed, trend, seasonal) => {
    return observed
      .map ((val, i) => {
        const t = trend[i] || 0;
        const s = seasonal[i] || 0;
        return val - t - s;
      })
      .map (r => Math.max (-2, Math.min (2, r))); // Ensure residuals are clamped between -2 and 2
  };

  if (!data || !correlationMatrix || !seasonalData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '50px',
          fontWeight: 'bold',
        }}
      >
        Weather Analysis
      </h1>
      <h1>Line chart</h1>
      <LineCharts data={data} />
      <h1>Heatmap</h1>
      <Heatmap
        matrix={correlationMatrix}
        labels={Object.keys (data).filter (key => key !== 'dt')}
      />
      <h1>Seasonal</h1>
      <SeasonalDecomposition decomposition={seasonalData} />
    </div>
  );
};

export default App;
