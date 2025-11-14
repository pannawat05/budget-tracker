import { useState, useEffect } from 'react'; // 1. ลบ 'import React' (ไม่จำเป็น)
import { GetProfile } from '../control/auth';

// 2. (สำคัญ) กำหนด Type ของข้อมูล Profile ที่เราจะได้รับจาก Backend
interface ProfileData {
  id: string;
  email: string;
  createdAt: string; // Backend ส่งมาเป็น string (ISO format)
}

function Profile() {
    // 3. (สำคัญ) บอก useState ว่า Type คือ ProfileData หรือ null
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // 4. เพิ่ม Loading state

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            // 5. (สำคัญ) ตรวจสอบว่ามี token ก่อนเรียก
            if (!token) {
                console.error("No token found. User is not logged in.");
                setIsLoading(false);
                // (ในอนาคต คุณอาจจะ redirect ไปหน้า login ตรงนี้)
                // navigate("/login"); 
                return;
            }

            try {
                const data = await GetProfile(token);
                setProfileData(data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false); // 6. หยุด loading ไม่ว่าจะสำเร็จหรือล้มเหลว
            }
        };
        fetchProfile();
    }, []);

    // 7. ปรับปรุงการแสดงผลให้ดีขึ้น
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!profileData) {
        return <div>Error loading profile. Are you logged in?</div>;
    }

    // ถ้าทุกอย่างเรียบร้อย
    return (
        <div>
            Profile
            <pre>{JSON.stringify(profileData, null, 2)}</pre>
        </div>
    );
}

export default Profile;