import { BrowserRouter , Route, Routes, Outlet } from 'react-router-dom'
import './App.css'
import Add from './pages/Add' 
import Activity from './pages/Activity'
import Summary from './pages/Summary'
import Nav from './components/Nav'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
const AppLayout = () => (
  <>
    <Nav />
    <main className="content-container"> {/* (แนะนำ) หุ้มเนื้อหาหลัก */}
      <Outlet /> 
    </main>
  </>
);

// 3. สร้าง "Layout ว่าง" สำหรับหน้า Login/Register
const AuthLayout = () => (
  <>
    <Outlet /> {/* แสดงแค่เนื้อหา (Login) โดยไม่มี Nav */}
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* 4. กลุ่มของ Route ที่ "ไม่มี Nav" */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
        </Route>

        {/* 5. กลุ่มของ Route ที่ "มี Nav" */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Activity />} /> {/* (แนะนำ) ใช้ path="/" เป็นหน้าหลัก */}
          <Route path="/add" element={<Add />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Signup/>} />
          <Route path="*" element={<Activity />} /> {/* (แนะนำ) หน้าที่หาไม่เจอ ให้กลับไปหน้าหลัก */}
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App