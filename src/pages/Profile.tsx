import React from 'react'
import { useState,useEffect } from 'react'
import { GetProfile } from '../control/auth'

function Profile() {
    const [profileData, setProfileData] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token") || "";
            const data = await GetProfile(token);
            setProfileData(data);
        };
        fetchProfile();
    }, []);
  return (
    <div>
      Profile
      <pre>{profileData ? JSON.stringify(profileData, null, 2) : 'Loading...'}</pre>
    </div>
  )
}

export default Profile