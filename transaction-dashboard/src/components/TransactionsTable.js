import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getMonthName } from '../utils/monthUtils';
import "../Styles/TransactionsTable.css";
import axios from 'axios';

function TransactionsTable({ selectedMonth, selectedYear, searchText }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, searchText]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions?month=${selectedMonth}&year=${selectedYear}&search=${searchText}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div>
      <div className='divTransactions'><h2>Transactions for {getMonthName(selectedMonth)} {selectedYear}</h2></div>
      {transactions.length > 0 ? (
        <table className='Transaction-table'>
          <thead>
            <tr>
              <th className='Transaction-table-th'>Transaction ID</th>
              <th className='Transaction-table-th'>Product Name</th>
              <th className='Transaction-table-th'>Description</th>
              <th className='Transaction-table-th'>Price</th>
              <th className='Transaction-table-th'>Date of Sale</th>
              <th className='Transaction-table-th'>Category</th>
              <th className='Transaction-table-th'>Sold</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction._id}>
                <td className='Transaction-table-tr'>{transaction._id}</td>
                <td className='Transaction-table-tr'>{transaction.title}</td>
                <td className='Transaction-table-tr'>{transaction.description}</td>
                <td className='Transaction-table-tr'>{transaction.price}</td>
                <td className='Transaction-table-tr'>{transaction.dateOfSale}</td>
                <td className='Transaction-table-tr'>{transaction.category}</td>
                <td className='Transaction-table-tr'>{transaction.sold ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (<div className='noTransactions'><h3 >No transactions found.</h3></div>
        
      )}
    </div>
  );
}

export default TransactionsTable;

