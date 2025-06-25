"use client";

import { useState, useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customer_type: "individual" | "company";
  company_name?: string;
  vat_number?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  bookings?: Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    status: string;
    paymentStatus: string;
  }>;
  payments?: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
  }>;
};

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"individual" | "company">(
    "individual"
  );
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    vat: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [formError, setFormError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      console.log("Loading customers...");
      const response = await fetch("/api/customers");

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();

        console.log("Loaded customers:", data);
        setCustomers(data);
      } else {
        const errorText = await response.text();

        console.error("Failed to load customers:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      let customerData;

      if (addType === "individual") {
        if (
          !newCustomer.name ||
          !newCustomer.email ||
          !newCustomer.phone ||
          !newCustomer.address
        ) {
          setFormError("Please fill in all required fields.");

          return;
        }
        customerData = {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          customer_type: "individual" as const,
        };
      } else {
        if (
          !newCustomer.companyName ||
          !newCustomer.companyEmail ||
          !newCustomer.companyPhone ||
          !newCustomer.companyAddress
        ) {
          setFormError("Please fill in all required fields.");

          return;
        }
        customerData = {
          name: newCustomer.companyName,
          email: newCustomer.companyEmail,
          phone: newCustomer.companyPhone,
          address: newCustomer.companyAddress,
          customer_type: "company" as const,
          company_name: newCustomer.companyName,
          vat_number: newCustomer.vat || null,
          contact_person: newCustomer.contactPerson || null,
          contact_email: newCustomer.contactEmail || null,
          contact_phone: newCustomer.contactPhone || null,
        };
      }

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        // Reload customers list
        await loadCustomers();

        // Reset form
        setShowAddModal(false);
        setAddType("individual");
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          address: "",
          companyName: "",
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
          vat: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
        });
      } else {
        const error = await response.json();

        setFormError(error.error || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setFormError("Failed to create customer");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Customers</h1>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors duration-300"
          onClick={() => setShowAddModal(true)}
        >
          Add Customer
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300" colSpan={6}>
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300" colSpan={6}>
                  No customers found. Add your first customer using the button
                  above.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {customer.name}
                    {customer.customer_type === "company" &&
                      customer.contact_person && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          Contact: {customer.contact_person}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                        customer.customer_type === "individual"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                          : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      }`}
                    >
                      {customer.customer_type === "individual"
                        ? "Individual"
                        : "Company"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {customer.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] relative transition-colors duration-300">
            {/* Close button */}
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none transition-colors duration-300"
              type="button"
              onClick={() => setShowAddModal(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
            <form
              className="p-8 space-y-6 overflow-y-auto max-h-[70vh]"
              onSubmit={handleAddCustomer}
            >
              <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-light transition-colors duration-300">
                Add Customer
              </h2>
              <div className="flex space-x-2 mb-6">
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors duration-300 ${addType === "individual" ? "bg-primary text-white border-primary shadow" : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                  type="button"
                  onClick={() => setAddType("individual")}
                >
                  Individual
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors duration-300 ${addType === "company" ? "bg-primary text-white border-primary shadow" : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                  type="button"
                  onClick={() => setAddType("company")}
                >
                  Company
                </button>
              </div>
              {formError && (
                <div className="text-red-600 dark:text-red-400 text-sm mb-2 transition-colors duration-300">{formError}</div>
              )}
              {addType === "individual" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Name<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Email<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Phone<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Address<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    Company Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyName}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        type="email"
                        value={newCustomer.companyEmail}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Phone<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyPhone}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyPhone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Address<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyAddress}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyAddress: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VAT Number
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.vat}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            vat: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    Contact Person (optional)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactPerson}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            contactPerson: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        type="email"
                        value={newCustomer.contactEmail}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            contactEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactPhone}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            contactPhone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="mt-8 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow"
                  type="submit"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Customer Details</h2>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedCustomer.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedCustomer.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedCustomer.phone}
                </div>
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {selectedCustomer.address}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Bookings</h3>
                <ul className="space-y-1">
                  {selectedCustomer.bookings &&
                  selectedCustomer.bookings.length > 0 ? (
                    selectedCustomer.bookings.map((b) => (
                      <li key={b.id} className="text-sm text-gray-700">
                        {b.date}: {b.service} (£{b.amount}) -{" "}
                        <span className="capitalize">{b.status}</span> /{" "}
                        <span className="capitalize">{b.paymentStatus}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">No bookings found</li>
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Payments</h3>
                <ul className="space-y-1">
                  {selectedCustomer.payments &&
                  selectedCustomer.payments.length > 0 ? (
                    selectedCustomer.payments.map((p) => (
                      <li key={p.id} className="text-sm text-gray-700">
                        {p.date}: £{p.amount} -{" "}
                        <span className="capitalize">{p.status}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">No payments found</li>
                  )}
                </ul>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
