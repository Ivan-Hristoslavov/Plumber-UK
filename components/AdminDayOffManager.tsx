'use client';
import { useState } from 'react';
import { useDayOffPeriods, DayOffPeriod } from '@/hooks/useDayOffPeriods';
import { DayOffBanner } from './DayOffBanner';

type RecurrenceOption = {
  value: string | 'null';
  label: string;
};

const recurrenceOptions: RecurrenceOption[] = [
  { value: 'null', label: 'None' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const defaultForm: DayOffPeriod = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  show_banner: true,
  banner_message: '',
  is_recurring: false,
  recurrence_type: null,
};

export function AdminDayOffManager() {
  const { periods, loading, error, addPeriod, updatePeriod, deletePeriod } = useDayOffPeriods();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DayOffPeriod>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
    setFormError('');
  };
  const openEdit = (period: DayOffPeriod) => {
    setForm({ ...period });
    setEditingId(period.id || null);
    setShowModal(true);
    setFormError('');
  };
  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (!form.title || !form.start_date || !form.end_date) {
        setFormError('Title, Start Date и End Date са задължителни.');
        setSaving(false);
        return;
      }

      // Ensure recurrence_type is null when is_recurring is false
      const formData: DayOffPeriod = {
        ...form,
        recurrence_type: form.is_recurring ? form.recurrence_type : null
      };

      if (editingId) {
        await updatePeriod({ ...formData, id: editingId });
      } else {
        await addPeriod(formData);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Грешка при запис.');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deletePeriod(deleteId);
      setDeleteId(null);
      setDeleteConfirm(false);
    } catch (err) {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2">Day Off Periods</h2>
          <p className="text-blue-100">Manage your business's non-working days and holiday periods</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Add Day Off"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Add Day Off
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300">
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Period</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Message</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Recurring</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {periods.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No day off periods found</p>
                      <p className="text-sm">Click the "Add Day Off" button to create one</p>
                    </div>
                  </td>
                </tr>
              )}
              {periods.map((p: DayOffPeriod) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{p.title}</div>
                    {p.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{p.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{p.start_date}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{p.end_date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.show_banner ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Active Banner
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                      {p.banner_message || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.is_recurring ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {p.recurrence_type}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900 group transition-colors"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 5.487a2.25 2.25 0 113.182 3.182L8.25 20.463 4 21.75l1.287-4.25 11.575-11.575z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setDeleteId(p.id || null); setDeleteConfirm(true); }}
                        className="rounded-full p-2 hover:bg-red-100 dark:hover:bg-red-900 group transition-colors"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <svg className="w-5 h-5 text-red-600 group-hover:text-red-800 dark:text-red-400 dark:group-hover:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl transform transition-all animate-fade-in-up">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingId ? 'Edit Day Off Period' : 'Add New Day Off Period'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title*</label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="textarea textarea-bordered w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter description"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date*</label>
                    <input
                      type="date"
                      className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={form.start_date}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date*</label>
                    <input
                      type="date"
                      className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={form.end_date}
                      onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={form.show_banner}
                      onChange={e => setForm(f => ({ ...f, show_banner: e.target.checked }))}
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show Banner
                    </label>
                  </div>

                  {form.show_banner && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Message</label>
                      <textarea
                        className="textarea textarea-bordered w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter banner message"
                        rows={2}
                        value={form.banner_message}
                        onChange={e => setForm(f => ({ ...f, banner_message: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {form.is_recurring && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurrence Type</label>
                      <select
                        className="select select-bordered w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.recurrence_type || 'null'}
                        onChange={e => {
                          const value = e.target.value === 'null' ? null : e.target.value;
                          setForm(f => ({ ...f, recurrence_type: value }));
                        }}
                      >
                        {recurrenceOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Day Off Banner Preview */}
              <div className="my-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Preview:</label>
                <div className="relative">
                  <DayOffBanner previewPeriod={form} />
                </div>
              </div>

              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary min-w-[120px]"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    editingId ? 'Update' : 'Add Period'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl transform transition-all animate-fade-in-up">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this day off period? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-ghost"
                  onClick={() => { setDeleteConfirm(false); setDeleteId(null); }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error min-w-[100px]"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 