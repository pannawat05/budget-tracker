import { useEffect, useState } from 'react'
import { fetchTransaction } from '../control/transaction'

// 1. (สำคัญ) กำหนด Type ของ Transaction
// (ควรจะเป็น Type เดียวกับที่คุณใช้ใน Summary.tsx)
interface Transaction {
  id: string;
  createdAt: string;
  note: string;
  amount: number;
  type: 'income' | 'expense';
  categoryName: string;
}

function Activity() {
  // 2. (สำคัญ) บอก useState ว่าเป็นอาร์เรย์ของ Transaction[]
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // 3. (แนะนำ) เพิ่ม Loading และ Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {   
    const token = localStorage.getItem('token') || ''
    setIsLoading(true); // 4. เริ่มโหลด
    setError(null);
    
    fetchTransaction(token)
      .then(data => {
        setTransactions(data);
        setIsLoading(false); // 5. โหลดเสร็จ
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions. Please try again.');
        setIsLoading(false); // 6. โหลดล้มเหลว
      })
  }, [])

  // 7. (แนะนำ) แสดงผลตอนกำลังโหลด
  if (isLoading) {
    return <div className='text-center mt-20'>Loading...</div>
  }

  // 8. (แนะนำ) แสดงผลตอน Error
  if (error) {
    return <div className='text-center mt-20 text-red-500'>{error}</div>
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-center mt-10'>Activity Page</h1>
      <p className='text-center mt-4'>This is where you can view your recent activities.</p>
      
      <div className="overflow-x-auto"> {/* 🔧 แก้: เปลี่ยน class เป็น className */}
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
            {/* 9. (แนะนำ) แสดงผลกรณีไม่มีข้อมูล */}
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-green-100 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* 🔧 แก้: เพิ่ม fallback กรณี date ไม่ถูกต้อง */}
                    {transaction.createdAt 
                      ? new Date(transaction.createdAt).toLocaleString("th-TH", { 
                          timeZone: "Asia/Bangkok",
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.note || '-'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {/* 🔧 แก้: เพิ่มเครื่องหมาย +/- */}
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* 🔧 แก้: เพิ่ม Badge สวยๆ */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income' 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.categoryName || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Activity