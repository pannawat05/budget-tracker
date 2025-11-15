import Swal from "sweetalert2";

const link = "https://budget-tracker-backend-aevg.onrender.com";

interface Payload {
  email: string;
  password: string;
}

export async function Getlogin(payload: Payload) {
  try {
    const res = await fetch(`${link}/login`, {  // ✅ ใช้ backticks
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Server error:", res.status, text);
      throw new Error(`Server error: ${res.status}`);  // ✅ ใช้ backticks
    }

    const data = await res.json();
    const token = data.token;

    if (!token) {
      throw new Error("No token received from server");
    }

    localStorage.setItem("token", token);
    console.log("Login success ✅", token);

    await Swal.fire({
      title: "Success!",
      text: "Login success!",
      icon: "success"
    });

    return data;
  } catch (error) {
    console.error("Login failed:", error);
    await Swal.fire({
      title: "Error!",
      text: error instanceof Error ? error.message : "Login failed",
      icon: "error"
    });
    throw error;
  }
}

export async function GetProfile(token: string) {
  try {
    const res = await fetch(`${link}/profile`, {  // ✅ ใช้ backticks
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Authorization": `Bearer ${token}`  // ✅ ใช้ backticks
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Server error:", res.status, text);
      throw new Error(`Server error: ${res.status}`);  // ✅ ใช้ backticks
    }

    const data = await res.json();
    console.log("Profile data fetched ✅", data);
    return data;
  } catch (error) {
    console.error("Fetching profile failed:", error);
    throw error;
  }
}

export async function Logout(token: string) {
  if (!token) {
    console.warn("No token found, redirecting to login...");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(`${link}/logout`, {  // ✅ ใช้ backticks
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,  // ✅ ใช้ backticks
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("✅ Logout success");
      localStorage.removeItem("token");
      await Swal.fire({
        title: "Success!",
        text: "Logout success!",
        icon: "success"
      });
      window.location.href = "/login";
    } else {
      const err = await response.json().catch(() => ({}));
      console.error("❌ Logout failed:", err);
      await Swal.fire({
        title: "Error!",
        text: "Logout failed",
        icon: "error"
      });
    }
  } catch (error) {
    console.error("🚨 Logout request error:", error);
    await Swal.fire({
      title: "Error!",
      text: "Logout request failed",
      icon: "error"
    });
  }
}

export async function Getregister(payload: Payload) {
  try {
    const res = await fetch(`${link}/register`, {  // ✅ ใช้ backticks
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Server error:", res.status, text);
      throw new Error(`Server error: ${res.status}`);  // ✅ ใช้ backticks
    }

    const data = await res.json();
    console.log("Register success ✅", data);

    await Swal.fire({
      title: "Success!",
      text: "Registration successful! Please log in.",
      icon: "success"
    });
     window.location.href = "/login";

    return data;
  } catch (error) {
    console.error("Registration failed:", error);
    await Swal.fire({
      title: "Error!",
      text: error instanceof Error ? error.message : "Registration failed",
      icon: "error"
    });
    throw error;
  }
}

export type { Payload };