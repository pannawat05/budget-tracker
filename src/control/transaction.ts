export interface TransactionRequest {
  categoryId: string;
  amount: number;
  type: "income" | "expense";
  description: string; // จะถูกส่งไป backend เป็น "note"
}

const link = "https://budget-tracker-backend-aevg.onrender.com";

// จาก server (category list)
export interface Category {
  id: string;
  name: string;
}

// ข้อมูลที่ backend ส่งกลับจาก /transactions
export interface TransactionResponse {
  id: string;
  amount: number;
  type: "income" | "expense";
  note: string;
  createdAt: string;
  categoryName: string; // ✅ backend ส่งเป็น camelCase
}

// ✅ เพิ่ม type สำหรับ return
export async function addTransaction(
  transaction: TransactionRequest,
  token: string,
  categories: Category[]
): Promise<TransactionResponse> {
  // 1️⃣ ตรวจสอบ CategoryId ว่ามีอยู่ไหม
  const categoryExists = categories.some(c => c.id === transaction.categoryId);
  if (!categoryExists) {
    throw new Error("Category not found");
  }

  // 2️⃣ ตรวจสอบค่าอื่น ๆ
  if (!transaction.amount || transaction.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (!["income", "expense"].includes(transaction.type)) {
    throw new Error("Type must be 'income' or 'expense'");
  }

  // 3️⃣ ส่ง request ไป backend
  // ✅ แปลง description → note ให้ตรงกับ backend
  const payload = {
    categoryId: transaction.categoryId,
    amount: transaction.amount,
    type: transaction.type,
    note: transaction.description,
  };

  console.log("Sending payload:", payload);
  console.log("Using token:", token ? "Present" : "Missing");

  const response = await fetch(`${link}/add-transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Adding transaction failed:", errorText);
    throw new Error(`Server error: ${errorText}`);
  }

  const data = await response.json();
  console.log("Transaction added successfully:", data);
  return data.transaction; // ✅ backend ส่งกลับ { message, transaction }
}

export async function fetchTransaction(token: string): Promise<TransactionResponse[]> {
  const response = await fetch(`${link}/transactions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetching transactions failed:", errorText);
    throw new Error(`Server error: ${errorText}`);
  }

  const data = await response.json();
  return data; // ✅ เป็น array ของ TransactionResponse
}