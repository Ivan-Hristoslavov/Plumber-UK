'use client';

import { useState } from 'react';

// Dummy customer data
const mockCustomers = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '07123 456789',
    address: '123 Main St, London',
    bookings: [
      { id: 'b1', service: 'Emergency Call Out', date: '2024-06-10', amount: 85, status: 'confirmed', paymentStatus: 'paid' },
      { id: 'b2', service: 'Boiler Service', date: '2024-06-15', amount: 120, status: 'completed', paymentStatus: 'paid' },
    ],
    payments: [
      { id: 'p1', amount: 85, date: '2024-06-10', status: 'paid' },
      { id: 'p2', amount: 120, date: '2024-06-15', status: 'paid' },
    ],
  },
  {
    id: 'c2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '07234 567890',
    address: '456 High Rd, Manchester',
    bookings: [
      { id: 'b3', service: 'Bathroom Installation', date: '2024-06-11', amount: 2500, status: 'pending', paymentStatus: 'pending' },
    ],
    payments: [
      { id: 'p3', amount: 2500, date: '2024-06-11', status: 'pending' },
    ],
  },
];

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'individual' | 'company'>('individual');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    vat: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [formError, setFormError] = useState('');
  const [customers, setCustomers] = useState(mockCustomers);

  function handleAddCustomer(e) {
    e.preventDefault();
    setFormError('');
    if (addType === 'individual') {
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.address) {
        setFormError('Please fill in all required fields.');
        return;
      }
      setCustomers([
        ...customers,
        {
          id: (customers.length + 1).toString(),
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          bookings: [],
          payments: [],
        },
      ]);
    } else {
      if (!newCustomer.companyName || !newCustomer.companyEmail || !newCustomer.companyPhone || !newCustomer.companyAddress) {
        setFormError('Please fill in all required fields.');
        return;
      }
      setCustomers([
        ...customers,
        {
          id: (customers.length + 1).toString(),
          name: newCustomer.companyName,
          email: newCustomer.companyEmail,
          phone: newCustomer.companyPhone,
          address: newCustomer.companyAddress,
          vat: newCustomer.vat,
          contactPerson: newCustomer.contactPerson,
          contactEmail: newCustomer.contactEmail,
          contactPhone: newCustomer.contactPhone,
          bookings: [],
          payments: [],
        },
      ]);
    }
    setShowAddModal(false);
    setAddType('individual');
    setNewCustomer({
      name: '', email: '', phone: '', address: '',
      companyName: '', companyEmail: '', companyPhone: '', companyAddress: '', vat: '', contactPerson: '', contactEmail: '', contactPhone: '',
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          Add Customer
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] relative">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <form className="p-8 space-y-6 overflow-y-auto max-h-[70vh]" onSubmit={handleAddCustomer}>
              <h2 className="text-2xl font-bold mb-4 text-primary">Add Customer</h2>
              <div className="flex space-x-2 mb-6">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors duration-150 ${addType === 'individual' ? 'bg-primary text-white border-primary shadow' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  onClick={() => setAddType('individual')}
                >
                  Individual
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors duration-150 ${addType === 'company' ? 'bg-primary text-white border-primary shadow' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  onClick={() => setAddType('company')}
                >
                  Company
                </button>
              </div>
              {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
              {addType === 'individual' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
                    <input
                      className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      value={newCustomer.name}
                      onChange={e => setNewCustomer(nc => ({ ...nc, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email<span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      value={newCustomer.email}
                      onChange={e => setNewCustomer(nc => ({ ...nc, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone<span className="text-red-500">*</span></label>
                    <input
                      className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer(nc => ({ ...nc, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address<span className="text-red-500">*</span></label>
                    <input
                      className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      value={newCustomer.address}
                      onChange={e => setNewCustomer(nc => ({ ...nc, address: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold text-gray-700 mb-2">Company Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name<span className="text-red-500">*</span></label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyName}
                        onChange={e => setNewCustomer(nc => ({ ...nc, companyName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Email<span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyEmail}
                        onChange={e => setNewCustomer(nc => ({ ...nc, companyEmail: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone<span className="text-red-500">*</span></label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyPhone}
                        onChange={e => setNewCustomer(nc => ({ ...nc, companyPhone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Address<span className="text-red-500">*</span></label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyAddress}
                        onChange={e => setNewCustomer(nc => ({ ...nc, companyAddress: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.vat}
                        onChange={e => setNewCustomer(nc => ({ ...nc, vat: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">Contact Person (optional)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactPerson}
                        onChange={e => setNewCustomer(nc => ({ ...nc, contactPerson: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactEmail}
                        onChange={e => setNewCustomer(nc => ({ ...nc, contactEmail: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactPhone}
                        onChange={e => setNewCustomer(nc => ({ ...nc, contactPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="mt-8 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow"
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
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <div><span className="font-medium">Name:</span> {selectedCustomer.name}</div>
                <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>
                <div><span className="font-medium">Phone:</span> {selectedCustomer.phone}</div>
                <div><span className="font-medium">Address:</span> {selectedCustomer.address}</div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Bookings</h3>
                <ul className="space-y-1">
                  {selectedCustomer.bookings.map((b) => (
                    <li key={b.id} className="text-sm text-gray-700">
                      {b.date}: {b.service} (£{b.amount}) - <span className="capitalize">{b.status}</span> / <span className="capitalize">{b.paymentStatus}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Payments</h3>
                <ul className="space-y-1">
                  {selectedCustomer.payments.map((p) => (
                    <li key={p.id} className="text-sm text-gray-700">
                      {p.date}: £{p.amount} - <span className="capitalize">{p.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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