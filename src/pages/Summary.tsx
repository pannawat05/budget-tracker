// 1. ลบ React ที่ไม่ได้ใช้ และ import useMemo
import { useState, useEffect, useRef, useMemo } from 'react'
import { fetchTransaction } from '../control/transaction'
import Chart from 'chart.js/auto'

// 2. 🚀 อัปเกรด Type ให้ตรงกับข้อมูลที่ใช้จริง
type Transaction = {
  id: string // สมมติว่ามี ID
  createdAt: string // API ส่งค่านี้มา
  type: 'income' | 'expense'
  amount: number
  categoryName?: string // บางรายการอาจไม่มีหมวดหมู่
  note?: string
}

function Summary() {
  const [toggle, setToggle] = useState(false) // 🚀 เราจะใช้ State นี้ควบคุม UI
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // 🚀 เพิ่ม Loading/Error States สำหรับการดึงข้อมูล
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states (เหมือนเดิม)
  const [filterType, setFilterType] = useState<'month' | 'dateRange'>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Chart Refs (เหมือนเดิม)
  const incomeExpenseChartRef = useRef<HTMLCanvasElement>(null)
  const categoryChartRef = useRef<HTMLCanvasElement>(null)
  const incomeExpenseChartInstance = useRef<Chart | null>(null)
  const categoryChartInstance = useRef<Chart | null>(null)

  // ✅ ดึงข้อมูลจาก API (อัปเกรดให้มี Loading/Error)
  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    setIsLoading(true)
    fetchTransaction(token)
      .then(data => {
        setTransactions(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching transactions:', error)
        setError('Failed to fetch transactions.')
        setIsLoading(false)
      })
  }, [])

  // 3. 🚀 [Performance] ใช้ useMemo กรองข้อมูลแทน useEffect
  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) return []

    let filtered = [...transactions]

    const isFilterActive = (filterType === 'month' && selectedMonth) || 
                           (filterType === 'dateRange' && startDate && endDate)

    if (!isFilterActive) {
      return filtered 
    }

    if (filterType === 'month' && selectedMonth) {
      return filtered.filter(t => {
        if (!t.createdAt) return false
        try {
          const transactionDate = new Date(t.createdAt)
          const month = transactionDate.getMonth() + 1
          const year = transactionDate.getFullYear()
          return month === parseInt(selectedMonth) && year === parseInt(selectedYear)
        } catch (e) { return false }
      })
    }
    
    if (filterType === 'dateRange' && startDate && endDate) {
      try {
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)

        return filtered.filter(t => {
          if (!t.createdAt) return false
          const transactionDate = new Date(t.createdAt)
          return transactionDate >= start && transactionDate < end
        })
      } catch (e) {
        console.error("Error parsing date filter:", e)
        return filtered
      }
    }
    
    return filtered

  }, [filterType, selectedMonth, selectedYear, startDate, endDate, transactions])

  
  // ✅ คำนวณยอดรวม
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const balance = totalIncome - totalExpense

  // 4. 🚀 [Performance] ใช้ useMemo คำนวณยอดตามหมวดหมู่
  const expenseByCategory = useMemo(() => {
    const summary: { [key: string]: number } = {}
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.categoryName || 'Uncategorized'
        summary[category] = (summary[category] || 0) + (t.amount || 0)
      })
    return summary
  }, [filteredTransactions]) 

  // ✅ กราฟที่ 1: Income vs Expense
  useEffect(() => {
    if (!incomeExpenseChartRef.current) return
    if (incomeExpenseChartInstance.current) incomeExpenseChartInstance.current.destroy()

    const data = {
      labels: ['Income', 'Expense'],
      datasets: [
        {
          label: 'Budget Summary',
          data: [totalIncome, totalExpense],
          backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
          hoverOffset: 6,
        },
      ],
    }
    incomeExpenseChartInstance.current = new Chart(incomeExpenseChartRef.current, { 
      type: 'pie', 
      data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Income vs Expense'
          }
        }
      }
    })
  }, [totalIncome, totalExpense])

  // ✅ กราฟที่ 2: Expense by Category
  useEffect(() => {
    if (!categoryChartRef.current) return
    if (categoryChartInstance.current) categoryChartInstance.current.destroy()

    const labels = Object.keys(expenseByCategory)
    const values = Object.values(expenseByCategory)

    if (labels.length === 0) return

    const data = {
      labels,
      datasets: [
        {
          label: 'Amount',
          data: values,
          backgroundColor: [
            'rgb(54, 162, 235)', 
            'rgb(255, 99, 132)', 
            'rgb(255, 206, 86)', 
            'rgb(75, 192, 192)', 
            'rgb(153, 102, 255)', 
            'rgb(255, 159, 64)'
          ],
          hoverOffset: 8,
        },
      ],
    }
    categoryChartInstance.current = new Chart(categoryChartRef.current, { 
      type: 'doughnut', 
      data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Expenses by Category'
          }
        }
      }
    })
  }, [expenseByCategory])

  // ✅ ฟังก์ชัน Reset Filter
  const handleResetFilter = () => {
    setSelectedMonth('')
    setSelectedYear(new Date().getFullYear().toString())
    setStartDate('')
    setEndDate('')
  }

  // สร้างตัวเลือกปี
  const yearOptions = []
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 5; i++) yearOptions.push(currentYear - i)

  // ✅ ฟังก์ชัน Toggle
  const toggleFilter = () => {
    setToggle(!toggle)
  }

  // ✅ แสดง Loading/Error states
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading transactions...</div>
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <br />
      <h2 className='text-lg font-bold'>Summary</h2>
      <h3>Total Income: {totalIncome.toFixed(2)}</h3>
      <h3>Total Expense: {totalExpense.toFixed(2)}</h3>
      <h3>Balance: {balance.toFixed(2)}</h3>
      <h2><b> Money should saving from income: </b>{(totalIncome * 0.20).toFixed(2)}</h2>

      {/* ✅ Filter Section (ควบคุมด้วย State) */}
      <div 
        style={{ 
          margin: '2rem auto', 
          maxWidth: '700px', 
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          backgroundColor: '#fff'
        }}
      >
        <div 
          style={{ 
            marginBottom: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }} 
          className='filterbtn' 
          onClick={toggleFilter}
        >
          <i 
            className="fa-solid fa-filter" 
            id='filter' 
            style={{ 
              transform: toggle ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          ></i>
          <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>Filter:</span>
        </div>

        {/* 🚀 แก้ไข: ใช้ inline styles แทน Tailwind */}
        <div 
          style={{
            maxHeight: toggle ? '500px' : '0',
            opacity: toggle ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out'
          }}
        >
          {/* เลือกประเภทการกรอง */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                value="month"
                checked={filterType === 'month'}
                onChange={(e) => setFilterType(e.target.value as 'month' | 'dateRange')}
                style={{ marginRight: '5px' }}
              />
              กรองตามเดือน
            </label>
            <label>
              <input
                type="radio"
                value="dateRange"
                checked={filterType === 'dateRange'}
                onChange={(e) => setFilterType(e.target.value as 'month' | 'dateRange')}
                style={{ marginRight: '5px' }}
              />
              กรองตามช่วงวันที่
            </label>
          </div>

          {/* แสดง Filter ตามประเภทที่เลือก */}
          {filterType === 'month' ? (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <label>
                <span style={{ marginRight: '5px' }}>เดือน:</span>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- เลือกเดือน --</option>
                  <option value="1">มกราคม</option>
                  <option value="2">กุมภาพันธ์</option>
                  <option value="3">มีนาคม</option>
                  <option value="4">เมษายน</option>
                  <option value="5">พฤษภาคม</option>
                  <option value="6">มิถุนายน</option>
                  <option value="7">กรกฎาคม</option>
                  <option value="8">สิงหาคม</option>
                  <option value="9">กันยายน</option>
                  <option value="10">ตุลาคม</option>
                  <option value="11">พฤศจิกายน</option>
                  <option value="12">ธันวาคม</option>
                </select>
              </label>

              <label>
                <span style={{ marginRight: '5px' }}>ปี:</span>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year + 543}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <label>
                <span style={{ marginRight: '5px' }}>จากวันที่:</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </label>

              <label>
                <span style={{ marginRight: '5px' }}>ถึงวันที่:</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </label>
            </div>
          )}

          <button 
            onClick={handleResetFilter}
            style={{ 
              marginTop: '15px',
              padding: '8px 20px', 
              cursor: 'pointer',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            🔄 Reset Filter
          </button>
        </div>
        
      </div>

      {/* แสดงจำนวนรายการที่กรอง */}
      <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
        📊 Showing {filteredTransactions.length} of {transactions.length} transactions
      </p>

      {/* กราฟ 1: รายรับ vs รายจ่าย */}
      <div style={{ width: '400px', margin: '2rem auto' }}>
        <canvas ref={incomeExpenseChartRef}></canvas>
      </div>

      {/* กราฟ 2: ค่าใช้จ่ายตามหมวดหมู่ */}
      <div style={{ width: '400px', margin: '2rem auto' }}>
        {Object.keys(expenseByCategory).length > 0 ? (
          <canvas ref={categoryChartRef}></canvas>
        ) : (
          <p style={{ color: '#888' }}>ไม่มีข้อมูลค่าใช้จ่ายเพื่อแสดงกราฟ (ในขอบเขตที่เลือก)</p>
        )}
      </div>
    </div>
  )
}

export default Summary
