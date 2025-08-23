import React, { useMemo } from 'react';
import { ChartDataPoint } from '../utils/chartUtils';
import './EnhancedMoodChart.css';

interface EnhancedMoodChartProps {
  data: ChartDataPoint[];
  period: '7days' | '30days' | '90days';
}

const MOOD_EMOJIS = ['😞', '🙁', '😐', '🙂', '😊'];
const MOOD_COLORS = [
  '#FF5722', // Very low
  '#FF9800', // Low
  '#FFC107', // Neutral
  '#8BC34A', // Good
  '#4CAF50'  // Great
];

export const EnhancedMoodChart: React.FC<EnhancedMoodChartProps> = ({ data, period }) => {
  const maxValue = 5;
  const minValue = 1;
  
  const getMoodColor = (value: number) => {
    const index = Math.min(Math.floor(value) - 1, 4);
    return MOOD_COLORS[Math.max(0, index)];
  };
  
  const getMoodEmoji = (value: number) => {
    const index = Math.min(Math.floor(value) - 1, 4);
    return MOOD_EMOJIS[Math.max(0, index)];
  };
  
  const average = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, point) => acc + point.value, 0);
    return sum / data.length;
  }, [data]);
  
  const trend = useMemo(() => {
    if (data.length < 2) return 'stable';
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, p) => acc + p.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, p) => acc + p.value, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.3) return 'improving';
    if (secondAvg < firstAvg - 0.3) return 'declining';
    return 'stable';
  }, [data]);
  
  const getTrendMessage = () => {
    switch (trend) {
      case 'improving':
        return { text: 'Your mood is trending upward! 📈', color: '#4CAF50' };
      case 'declining':
        return { text: 'Your mood needs attention 💙', color: '#FF9800' };
      default:
        return { text: 'Your mood is stable', color: '#2196F3' };
    }
  };
  
  const trendMessage = getTrendMessage();
  
  return (
    <div className="enhanced-mood-chart">
      <div className="chart-header">
        <h3 className="chart-title">Mood Journey</h3>
        <div className="chart-period-selector">
          <span className={period === '7days' ? 'active' : ''}>Week</span>
          <span className={period === '30days' ? 'active' : ''}>Month</span>
          <span className={period === '90days' ? 'active' : ''}>Quarter</span>
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="summary-stat">
          <span className="summary-label">Average</span>
          <span className="summary-value" style={{ color: getMoodColor(average) }}>
            {getMoodEmoji(average)} {average.toFixed(1)}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Trend</span>
          <span className="summary-value" style={{ color: trendMessage.color }}>
            {trendMessage.text}
          </span>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-grid">
          {/* Y-axis labels */}
          <div className="chart-y-axis">
            {MOOD_EMOJIS.slice().reverse().map((emoji, index) => (
              <div key={index} className="y-axis-label">
                <span className="emoji-label">{emoji}</span>
                <span className="value-label">{5 - index}</span>
              </div>
            ))}
          </div>
          
          {/* Chart area */}
          <div className="chart-area">
            {/* Grid lines */}
            <div className="chart-grid-lines">
              {[5, 4, 3, 2, 1].map(value => (
                <div 
                  key={value} 
                  className="grid-line" 
                  style={{ bottom: `${((value - 1) / 4) * 100}%` }}
                />
              ))}
            </div>
            
            {/* Bars */}
            <div className="chart-bars">
              {data.map((point, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{
                      height: `${((point.value - minValue) / (maxValue - minValue)) * 100}%`,
                      backgroundColor: getMoodColor(point.value),
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="bar-tooltip">
                      <span className="tooltip-emoji">{getMoodEmoji(point.value)}</span>
                      <span className="tooltip-value">{point.value.toFixed(1)}</span>
                      <span className="tooltip-date">{point.label}</span>
                    </div>
                  </div>
                  <span className="x-axis-label">{point.label}</span>
                </div>
              ))}
            </div>
            
            {/* Trend line */}
            <svg className="trend-line-svg">
              <polyline
                className="trend-line"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((point.value - minValue) / (maxValue - minValue)) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={getMoodColor(average)}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {data.length === 0 && (
        <div className="chart-empty-state">
          <p>No mood data available for this period</p>
          <p className="empty-state-hint">Start tracking your mood to see beautiful visualizations!</p>
        </div>
      )}
    </div>
  );
};