import React from 'react';
import Plot from 'react-plotly.js';

const Heatmap = ({matrix, labels}) => {
  return (
    <Plot
      data={[
        {
          z: matrix,
          x: labels,
          y: labels,
          type: 'heatmap',
          colorscale: 'YlOrRd',
          text: matrix.map (row => row.map (value => value.toFixed (2))), // Format values to two decimal places
          texttemplate: '%{text}',
          textfont: {
            color: 'black',
          },
        },
      ]}
      layout={{
        title: 'Correlation Heatmap',
        height: 1200,
        width: 1200,
        xaxis: {tickangle: -45, automargin: true}, // Rotate labels for better readability
        yaxis: {automargin: true},
      }}
    />
  );
};

export default Heatmap;
