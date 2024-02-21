// components/StatisticsBox.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getMonthName } from '../utils/monthUtils';
import '../Styles/StatisticsBox.css';

function StatisticsBox({ selectedMonth, selectedYear }) {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth, selectedYear]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/statistics?month=${selectedMonth}&year=${selectedYear}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <div className="statistics-box">
      <h2>Statistics for {getMonthName(selectedMonth)} {selectedYear}</h2> 
      <div>
        <p>Total Sale Amount: ${statistics.totalSaleAmount}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>
    </div>
  );
}

export default StatisticsBox;
