import React, { useState } from "react";
import { addTransaction } from "../control/transaction";

function Add() {
  const [amount, setAmount] = useState(0);
  const [transectionType, setTransectionType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      alert("Please select a category");
      return;
    }

    // retrieve auth token (adjust if you store it elsewhere)
    const token = localStorage.getItem("token") || "";

    // local category list used for client-side validation / to satisfy the addTransaction signature
    const categories = [
      { id: "72ef8cf9-d24a-4e65-8327-9fe804d4642e", name: "Food" },
      { id: "d7e0f59e-de4a-43eb-bb7f-84db31e75936", name: "Transport" },
      { id: "e476fe13-4e40-4bfb-84a6-41efc13fd94b", name: "Entertainment" },
      { id: "deada599-3a96-4f1f-941d-cd74745956f7", name: "Utilities" },
      { id: "84b59c54-8dfc-4e81-b933-8d7c38ee2fef", name: "Other" },
    ];

    await addTransaction(
      {
        amount,
        type: transectionType,
        categoryId: category, // use camelCase to match TransactionRequest
        description: description,
      },
      token,
      categories
    );

    alert("✅ Transaction added successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="rounded-lg shadow-lg p-6 bg-white max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 text-sky-700">Add Transaction</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Enter amount"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              onChange={(e) => setTransectionType(e.target.value as "income" | "expense")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Enter description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sky-500 focus:border-sky-500"
              required
            >
              <option value="">-- Select Category --</option>
              <option value="72ef8cf9-d24a-4e65-8327-9fe804d4642e">Food</option>
              <option value="d7e0f59e-de4a-43eb-bb7f-84db31e75936">Transport</option>
              <option value="e476fe13-4e40-4bfb-84a6-41efc13fd94b">Entertainment</option>
              <option value="deada599-3a96-4f1f-941d-cd74745956f7">Utilities</option>
              <option value="84b59c54-8dfc-4e81-b933-8d7c38ee2fef">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

export default Add;
