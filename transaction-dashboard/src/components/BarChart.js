import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { getMonthName } from '../utils/monthUtils';
import "../Styles/BarChart.css";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

function BarChart({ selectedMonth, selectedYear }) {
  const [barChartData, setBarChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchBarChartData = useCallback(async () => {
    setIsLoading(true); // Set loading state to true while fetching data
    try {
      const response = await axios.get(`http://localhost:5000/api/bar-chart?month=${selectedMonth}&year=${selectedYear}`);
      setBarChartData(response.data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    } finally {
      setIsLoading(false); // Set loading state to false after data is fetched
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBarChartData();
  }, [fetchBarChartData]);

  return (
    <div className="bar-chart">
      <h2>Bar Chart for {getMonthName(selectedMonth)} {selectedYear}</h2> 
      <Bar
        data={{
          labels: barChartData.map(item => item.range),
          datasets: [
            {
              label: 'Number of Items',
              data: barChartData.map(item => item.count),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        }}
        options={{
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        }}
      />
    </div>
  );
}

export default BarChart;
