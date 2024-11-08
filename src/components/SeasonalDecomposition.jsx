import React from 'react';
import Plot from 'react-plotly.js';

const SeasonalDecomposition = ({decomposition}) => {
  const {dt, observed, trend, seasonal, residual} = decomposition;

  const plots = [
    {name: 'Observed', y: observed},
    {name: 'Trend', y: trend},
    {name: 'Seasonal', y: seasonal},
    {name: 'Residual', y: residual},
  ];

  return (
    <div>
      {plots.map ((plot, index) => (
        <Plot
          key={index}
          data={[
            {
              x: dt,
              y: plot.y,
              type: 'scatter',
              mode: 'lines',
              name: plot.name,
            },
          ]}
          layout={{
            title: plot.name,
            height: 250,
            margin: {t: 40, b: 40},
            xaxis: {
              type: 'date',
              tickformat: '%Y-%m-%d %H:%M', // Display date and hour
              tickangle: 45,
              automargin: true,
            },
            yaxis: {automargin: true},
          }}
          style={{width: '100%', height: '250px'}}
        />
      ))}
    </div>
  );
};

export default SeasonalDecomposition;
