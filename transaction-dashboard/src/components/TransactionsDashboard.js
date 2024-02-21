import React, { useState } from 'react';
import TransactionsTable from './TransactionsTable';
import StatisticsBox from './StatisticsBox';
import BarChart from './BarChart';
import "../Styles/TransactionsDashboard.css"

function TransactionsDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2022');
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const months = [
    { value: '00', name: 'January' },
    { value: '01', name: 'February' },
    { value: '02', name: 'March' },
    { value: '03', name: 'April' },
    { value: '04', name: 'May' },
    { value: '05', name: 'June' },
    { value: '06', name: 'July' },
    { value: '07', name: 'August' },
    { value: '08', name: 'September' },
    { value: '09', name: 'October' },
    { value: '10', name: 'November' },
    { value: '11', name: 'December' },
  ];

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleSearch = () => {
    setSearchQuery(searchText);
  };

  return (
    <div>
      <div className='TransactionsDashboard-top'>
      <h1>Transaction Dashboard</h1>
      <select value={selectedYear} onChange={handleYearChange}>
        <option value="2021">2021</option>
        <option value="2022">2022</option>
      </select>
      <select value={selectedMonth} onChange={handleMonthChange}>
        {months.map(month => (
          <option key={month.value} value={month.value}>{month.name}</option>
        ))}
      </select>
      <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search transactions..." />
      <button onClick={handleSearch}>Search</button>
      </div>
     
      <TransactionsTable selectedMonth={selectedMonth} selectedYear={selectedYear} searchText={searchQuery} />
      <StatisticsBox selectedMonth={selectedMonth} selectedYear={selectedYear} />
      <BarChart selectedMonth={selectedMonth} selectedYear={selectedYear} />
    </div>
  );
}

export default TransactionsDashboard;
