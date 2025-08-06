'use client';

import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface SurveyResponse {
  name: string;
  weekEnding: string;
  blockedPercentage: number;
  feelSupported: number;
  workload: number;
  learnedNewSkills: number;
  meetingProductivity: number;
  soloProductivity: number;
  weekQuality: number;
  feedback: string;
  timestamp: string;
}

export default function ResultsTab() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch('/api/survey');
      const data = await res.json();
      setResponses(data.responses || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (responses.length > 0 && chartContainerRef.current) {
      drawCharts();
    }

    const handleResize = () => {
      if (responses.length > 0 && chartContainerRef.current) {
        drawCharts();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [responses]);

  const drawCharts = () => {
    if (!chartContainerRef.current) return;

    // Clear previous charts and tooltips
    d3.select(chartContainerRef.current).selectAll('*').remove();
    d3.selectAll('.tooltip').remove();

    // Get container width for responsive sizing
    const containerWidth = chartContainerRef.current.clientWidth;
    
    // Chart dimensions
    const margin = { top: 30, right: 150, bottom: 50, left: 60 };
    const width = Math.min(containerWidth - 40, 800) - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // Process data: group by week and calculate averages
    const weeklyData = d3.rollup(
      responses,
      v => ({
        weekQuality: d3.mean(v, d => d.weekQuality) || 0,
        feelSupported: d3.mean(v, d => d.feelSupported) || 0,
        soloProductivity: d3.mean(v, d => d.soloProductivity) || 0,
        meetingProductivity: d3.mean(v, d => d.meetingProductivity) || 0,
        blockedPercentage: d3.mean(v, d => d.blockedPercentage) || 0,
        workload: d3.mean(v, d => d.workload) || 0,
        learnedNewSkills: d3.mean(v, d => d.learnedNewSkills) || 0,
        count: v.length
      }),
      d => d.weekEnding
    );

    const weeks = Array.from(weeklyData.keys()).sort();
    const dataArray = Array.from(weeklyData.entries());
    
    // Calculate rolling averages (3-week window)
    const calculateRollingAvg = (data: [string, any][], key: string) => {
      const values = data.map(d => d[1][key]);
      const window = 3;
      let sum = 0;
      let count = 0;
      
      for (let i = Math.max(0, values.length - window); i < values.length; i++) {
        sum += values[i];
        count++;
      }
      
      return count > 0 ? sum / count : 0;
    };

    // Metrics to display
    const metrics = [
      { key: 'weekQuality', label: 'Week quality' },
      { key: 'feelSupported', label: 'Feel supported' },
      { key: 'soloProductivity', label: 'Solo productivity' },
      { key: 'meetingProductivity', label: 'Meeting productivity' },
      { key: 'blockedPercentage', label: 'Blocked percentage' },
      { key: 'workload', label: 'Workload' },
      { key: 'learnedNewSkills', label: 'Learned new skills' },
    ];

    // Create a chart for each metric
    metrics.forEach((metric, index) => {
      const container = d3.select(chartContainerRef.current)
        .append('div')
        .attr('class', 'mb-8 relative');

      // Calculate stats
      const lastValue = dataArray[dataArray.length - 1][1][metric.key];
      const previousValue = dataArray.length > 1 ? dataArray[dataArray.length - 2][1][metric.key] : lastValue;
      const rollingAvg = calculateRollingAvg(dataArray, metric.key);
      const trend = lastValue - previousValue;
      const trendSymbol = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
      const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

      // Header with metric name and stats
      const header = container.append('div')
        .attr('class', 'flex justify-between items-center mb-4');

      header.append('h3')
        .attr('class', 'text-lg font-semibold text-gray-800')
        .style('font-family', 'var(--font-roboto-serif)')
        .text(metric.label);

      const stats = header.append('div')
        .attr('class', 'flex gap-6 text-sm')
        .style('font-family', 'var(--font-roboto-mono)');

      stats.append('span')
        .attr('class', 'text-gray-600')
        .html(`Avg: <span class="font-bold text-gray-800">${rollingAvg.toFixed(1)}</span>`);

      stats.append('span')
        .attr('class', 'text-gray-600')
        .html(`Last: <span class="font-bold text-gray-800">${lastValue.toFixed(1)}</span>`);

      stats.append('span')
        .attr('class', trendColor)
        .text(`${trendSymbol} ${Math.abs(trend).toFixed(1)}`);

      const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleTime()
        .domain([new Date(weeks[0]), new Date(weeks[weeks.length - 1])])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, 10])
        .range([height, 0]);

      // Line generator
      const line = d3.line<[string, any]>()
        .x(d => x(new Date(d[0])))
        .y(d => y(d[1][metric.key]))
        .curve(d3.curveMonotoneX);

      // Add X axis
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .tickFormat(d => d3.timeFormat('%d %b')(d as Date))
          .ticks(weeks.length))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      // Add Y axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5));

      // Add Y axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Rating (1-10)');

      // Add gridlines
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => ''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => ''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      // Add the line with animation
      const path = g.append('path')
        .datum(dataArray)
        .attr('fill', 'none')
        .attr('stroke', '#2C6496')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Animate the line
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
      
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .delay(index * 200)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0);

      // Add dots for data points with animation
      g.selectAll('.dot')
        .data(dataArray)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(new Date(d[0])))
        .attr('cy', d => y(d[1][metric.key]))
        .attr('r', 0)
        .attr('fill', '#2C6496')
        .transition()
        .duration(300)
        .delay((d, i) => 1500 + index * 200 + i * 100)
        .attr('r', 4);

      // Add hover tooltips
      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none');

      // Delay tooltip interactions until animation is complete
      setTimeout(() => {
        g.selectAll('.dot')
          .on('mouseover', function(event, d: any) {
            tooltip.transition().duration(200).style('opacity', .9);
            tooltip.html(`Week: ${new Date(d[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}<br/>
                         Average: ${d[1][metric.key].toFixed(1)}<br/>
                         Responses: ${d[1].count}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            tooltip.transition().duration(500).style('opacity', 0);
          });
      }, 2000 + index * 200);
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="py-12 text-gray-500">Loading survey results...</div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="py-12 text-gray-500">
          No survey responses yet.
        </div>
      </div>
    );
  }

  // Get most recent week's feedback
  const recentWeek = [...new Set(responses.map(r => r.weekEnding))].sort().reverse()[0];
  const recentFeedback = responses.filter(r => r.weekEnding === recentWeek && r.feedback);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: 'var(--font-roboto-serif)' }}>
        Team health metrics over time
      </h2>
      
      <div ref={chartContainerRef}></div>

      {recentFeedback.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-roboto-serif)' }}>
            Recent feedback (week of {new Date(recentWeek).toLocaleDateString('en-GB', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })})
          </h3>
          <div className="space-y-3">
            {recentFeedback.map((r, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-lg">
                <span className="font-medium text-[#2C6496]" style={{ fontFamily: 'var(--font-roboto)' }}>
                  {r.name}:
                </span>
                <span className="ml-2 text-gray-700" style={{ fontFamily: 'var(--font-roboto)' }}>
                  {r.feedback}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}