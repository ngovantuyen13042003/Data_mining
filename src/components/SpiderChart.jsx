// SpiderChart.js
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const SpiderChart = ({data}) => {
  return (
    <RadarChart outerRadius={90} width={400} height={400} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="metric" />
      <PolarRadiusAxis angle={30} domain={[0, 100]} />
      <Radar
        name="Weather Metrics"
        dataKey="value"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
    </RadarChart>
  );
};

export default SpiderChart;
