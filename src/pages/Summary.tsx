import React, { useState, useEffect, useRef } from 'react'
import { fetchTransaction } from '../control/transaction'
import Chart from 'chart.js/auto'

type Transaction = {
  type: 'income' | 'expense' | string
  amount: number
  categoryName?: string
  date?: string
  [key: string]: any
}

function Summary() {
  const [toggle, setToggle] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [expenseByCategory, setExpenseByCategory] = useState<{ [key: string]: number }>({})
  
  // Filter states
  const [filterType, setFilterType] = useState<'month' | 'dateRange'>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const incomeExpenseChartRef = useRef<HTMLCanvasElement>(null)
  const categoryChartRef = useRef<HTMLCanvasElement>(null)
  const incomeExpenseChartInstance = useRef<Chart | null>(null)
  const categoryChartInstance = useRef<Chart | null>(null)

  // ✅ ดึงข้อมูลจาก API
  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    fetchTransaction(token)
      .then(data => {
        console.log('Fetched transactions:', data)
        console.log('Sample transaction:', data[0]) // ดูข้อมูลตัวอย่าง
        setTransactions(data)
        setFilteredTransactions(data)
      })
      .catch(error => console.error('Error fetching transactions:', error))
  }, [])

  // ✅ ฟังก์ชันกรองข้อมูล
  useEffect(() => {
    if (transactions.length === 0) {
      setFilteredTransactions([])
      return
    }

    let filtered = [...transactions]

    // ถ้าไม่ได้เลือก filter ใดๆ ให้แสดงข้อมูลทั้งหมด
    const isFilterActive = (filterType === 'month' && selectedMonth) || 
                          (filterType === 'dateRange' && startDate && endDate)

    if (!isFilterActive) {
      if (JSON.stringify(filtered) !== JSON.stringify(filteredTransactions)) {
        setFilteredTransactions(filtered)
      }
      return
    }

    if (filterType === 'month' && selectedMonth) {
      // กรองตามเดือนและปี
      filtered = filtered.filter(t => {
        if (!t.createdAt) {
          console.warn('Transaction without created_at:', t)
          return false
        }
        try {
          const transactionDate = new Date(t.createdAt)
          const month = transactionDate.getMonth() + 1
          const year = transactionDate.getFullYear()
          return month === parseInt(selectedMonth) && year === parseInt(selectedYear)
        } catch (error) {
          console.error('Error parsing created_at:', t.createdAt, error)
          return false
        }
      })
    } else if (filterType === 'dateRange' && startDate && endDate) {
      // กรองตามช่วงวันที่
      filtered = filtered.filter(t => {
        if (!t.createdAt) {
          console.warn('Transaction without created_at:', t)
          return false
        }
        try {
          const transactionDate = new Date(t.createdAt).toISOString().split('T')[0]
          return transactionDate >= startDate && transactionDate <= endDate
        } catch (error) {
          console.error('Error parsing created_at:', t.createdAt, error)
          return false
        }
      })
    }

    // ป้องกัน infinite loop โดยตรวจสอบว่าข้อมูลเปลี่ยนจริงหรือไม่
    if (JSON.stringify(filtered) !== JSON.stringify(filteredTransactions)) {
      setFilteredTransactions(filtered)
    }
  }, [filterType, selectedMonth, selectedYear, startDate, endDate, transactions])

  // ✅ คำนวณยอดรวม
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const balance = totalIncome - totalExpense

  // ✅ รวมยอดค่าใช้จ่ายตามหมวดหมู่
  useEffect(() => {
    const summary: { [key: string]: number } = {}
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.categoryName || 'Uncategorized'
        summary[category] = (summary[category] || 0) + (t.amount || 0)
      })
    setExpenseByCategory(summary)
  }, [filteredTransactions])

  // ✅ กราฟที่ 1: Income vs Expense
  useEffect(() => {
    if (!incomeExpenseChartRef.current) return
    if (incomeExpenseChartInstance.current) incomeExpenseChartInstance.current.destroy()

    const data = {
      labels: ['Income', 'Expense'],
      datasets: [
        {
          label: 'Your Budget Summary',
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
          legend: { position: 'right' },
          title: { display: true, text: 'Income vs Expense' },
        },
      },
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
          label: labels,
          data: values,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
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
          legend: { position: 'right' },
          title: { display: true, text: 'Expense Breakdown by Category' },
        },
      },
    })
  }, [expenseByCategory])

  // ✅ ฟังก์ชัน Reset Filter
  const handleResetFilter = () => {
    setSelectedMonth('')
    setSelectedYear(new Date().getFullYear().toString())
    setStartDate('')
    setEndDate('')
  }

  // สร้างตัวเลือกปี (5 ปีย้อนหลัง)
  const yearOptions = []
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 5; i++) {
    yearOptions.push(currentYear - i)
  }
  const toggleFilter = () => {
    setToggle(!toggle);
    if (toggle) {
      document.querySelector('.filter-options')!.classList.remove('active');
      const filterElem = document.getElementById('filter');
      if (filterElem) {
        filterElem.style.rotate = '0deg';
      }
    } else {
      document.querySelector('.filter-options')!.classList.add('active');
      const filterElem = document.getElementById('filter');
      if (filterElem) {
        filterElem.style.rotate = '90deg';
      }
    }
  }



  return (
    <div style={{ textAlign: 'center' }}>
      <br />
      <h2 className='text-lg font-bold'>Summary</h2>
      <h3>Total Income: {totalIncome.toFixed(2)}</h3>
      <h3>Total Expense: {totalExpense.toFixed(2)}</h3>
      <h3>Balance: {balance.toFixed(2)}</h3>
      <h2><b> Money should saving from income: </b>{(totalIncome * 0.20).toFixed(2)}</h2>

      {/* ✅ Filter Section */}
      <div 
        style={{ 
          margin: '2rem auto', 
          maxWidth: '700px', 
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ marginBottom: '15px' }} className='filterbtn' onClick={toggleFilter}>
          <i className="fa-solid fa-filter" id='filter'></i>
          <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>Filter:</span>
        </div>
    <div className="filter-options">
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
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
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
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
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
          <p style={{ color: '#888' }}>ไม่มีข้อมูลค่าใช้จ่ายเพื่อแสดงกราฟ</p>
        )}
      </div>
    </div>
  )
}

export default Summary