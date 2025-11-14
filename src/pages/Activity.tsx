import React, { useEffect, useState } from 'react'
import { fetchTransaction } from '../control/transaction'

function Activity() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {   
    const token = localStorage.getItem('token') || ''
    fetchTransaction(token)
      .then(data => setTransactions(data))
      .catch(error => console.error('Error fetching transactions:', error))
  }, [])

  return (
    <div>
      <h1 className='text-3xl font-bold text-center mt-10'>Activity Page</h1>
      <p className='text-center mt-4'>This is where you can view your recent activities.</p>

      <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mx-auto mt-10 text-center text-gray-700">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="px-6 py-3 text-left uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-right uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-center uppercase tracking-wider">Transaction Type</th>
            <th className="px-6 py-3 text-left uppercase tracking-wider">Category</th>
          </tr>
        </thead>

        <tbody className="bg-green-50 divide-y divide-green-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap">
               {new Date(transaction.createdAt)
    .toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{transaction.note}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {transaction.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">{transaction.type}</td>
              <td className="px-6 py-4 whitespace-nowrap">{transaction.categoryName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Activity
