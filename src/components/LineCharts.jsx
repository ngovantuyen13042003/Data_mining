// src/components/LineCharts.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const LineCharts = ({data}) => {
  const variables = Object.keys (data).filter (key => key !== 'dt'); // Exclude 'dt'

  return (
    <div>
      {variables.map ((variable, index) => (
        <Plot
          key={index}
          data={[
            {
              x: data.dt,
              y: data[variable],
              type: 'scatter',
              mode: 'lines',
              name: variable,
            },
          ]}
          layout={{
            title: variable.toUpperCase (),
            height: 300,
            margin: {t: 40, b: 40},
          }}
          style={{width: '100%', height: '300px'}}
        />
      ))}
    </div>
  );
};

export default LineCharts;
