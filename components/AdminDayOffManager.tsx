'use client';
import { useState, useRef } from 'react';
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
  // Horizontal drag-to-scroll helper for preview
  function DraggableScroll({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      isDraggingRef.current = true;
      startXRef.current = e.pageX - el.offsetLeft;
      scrollLeftRef.current = el.scrollLeft;
      el.classList.add('cursor-grabbing');
    };

    const onMouseLeave = () => {
      isDraggingRef.current = false;
      containerRef.current?.classList.remove('cursor-grabbing');
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      containerRef.current?.classList.remove('cursor-grabbing');
    };

    const onMouseMove = (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el || !isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1; // scroll-fastness
      el.scrollLeft = scrollLeftRef.current - walk;
    };

    const onTouchStart = (e: React.TouchEvent) => {
      const el = containerRef.current;
      if (!el) return;
      isDraggingRef.current = true;
      startXRef.current = e.touches[0].pageX - el.offsetLeft;
      scrollLeftRef.current = el.scrollLeft;
    };

    const onTouchMove = (e: React.TouchEvent) => {
      const el = containerRef.current;
      if (!el || !isDraggingRef.current) return;
      const x = e.touches[0].pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1;
      el.scrollLeft = scrollLeftRef.current - walk;
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    return (
      <div
        ref={containerRef}
        className="overflow-x-auto whitespace-nowrap cursor-grab select-none"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    );
  }
  const { periods, loading, error, addPeriod, updatePeriod, deletePeriod } = useDayOffPeriods();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DayOffPeriod>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    // Set start date to today when creating a new day-off period
    const today = new Date().toISOString().split('T')[0];
    setForm({
      ...defaultForm,
      start_date: today
    });
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
    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Day Off Periods</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">Manage non-working days and holidays</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shrink-0"
          aria-label="Add Day Off"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Day Off
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200/80 dark:border-gray-600/50 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500 dark:border-gray-600"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300">
            <p>{error}</p>
          </div>
        )}

        {/* Mobile: Compact list */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-600/50">
          {periods.length === 0 && !loading && (
            <div className="py-8 px-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No day off periods</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tap Add Day Off to create one</p>
            </div>
          )}
          {periods.map((p: DayOffPeriod) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{p.title}</span>
                  {p.show_banner && (
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100/80 text-green-700 dark:bg-green-900/40 dark:text-green-300 shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs flex-wrap">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{p.start_date}</span>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">{p.end_date}</span>
                  {p.banner_message && (
                    <span className="truncate max-w-[140px] text-gray-500 dark:text-gray-400" title={p.banner_message}>· {p.banner_message}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 rounded-md hover:bg-gray-200/80 dark:hover:bg-gray-600/50 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => { setDeleteId(p.id || null); setDeleteConfirm(true); }}
                  className="p-1.5 rounded-md hover:bg-gray-200/80 dark:hover:bg-gray-600/50 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-600/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Period</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Message</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Recurring</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {periods.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No day off periods</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Click Add Day Off to create one</p>
                  </td>
                </tr>
              )}
              {periods.map((p: DayOffPeriod) => (
                <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{p.title}</div>
                    {p.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{p.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{p.start_date}</span>
                      <span className="text-gray-400 dark:text-gray-500">→</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{p.end_date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.show_banner ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100/80 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-600/50 dark:text-gray-400">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="max-w-[180px] truncate text-xs text-gray-500 dark:text-gray-400">
                      {p.banner_message || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.is_recurring ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {p.recurrence_type}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-md hover:bg-gray-200/80 dark:hover:bg-gray-600/50 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setDeleteId(p.id || null); setDeleteConfirm(true); }}
                        className="p-1.5 rounded-md hover:bg-gray-200/80 dark:hover:bg-gray-600/50 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start lg:items-center justify-center z-50 animate-fade-in p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className=" w-full max-w-3xl xl:max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all animate-fade-in-up overflow-hidden max-h-[90vh] sm:max-h-[85vh] lg:max-h-none lg:overflow-visible flex flex-col mt-6 lg:mt-0">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-3 text-gray-900 dark:text-white sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-blue-600/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      {editingId ? 'Edit Day Off Period' : 'Add New Day Off Period'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {editingId ? 'Update your day off period settings' : 'Create a new day off period for your business'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-200"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 overflow-y-auto lg:overflow-visible">
              {/* Left column: Basic Information */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="dayoff-title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                  <input
                    id="dayoff-title"
                    type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      placeholder="e.g., Christmas Holiday"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                    <label htmlFor="dayoff-description" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      id="dayoff-description"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      placeholder="Optional description"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      value={form.start_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      value={form.end_date}
                      min={form.start_date || new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Info message about today's date */}
                {!editingId && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Today's date automatically disabled</p>
                        <p>When you create a day-off period starting today, today's date will be immediately disabled in the booking calendar to prevent new bookings.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Right column: Settings */}
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-3">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                  Settings
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-900 dark:text-white">
                          Show Banner
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Display a banner on your website
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={form.show_banner}
                      onChange={e => setForm(f => ({ ...f, show_banner: e.target.checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-900 dark:text-white">
                          Recurring
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Repeat this period automatically
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={form.is_recurring}
                      onChange={e => setForm(f => ({ ...f, is_recurring: e.target.checked }))}
                    />
                  </div>
                  </div>

                  {form.show_banner && (
                  <div className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Banner Message
                    </label>
                      <textarea
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-xs"
                      placeholder="Enter banner message to display"
                        rows={2}
                        value={form.banner_message}
                        onChange={e => setForm(f => ({ ...f, banner_message: e.target.value }))}
                      />
                    </div>
                  )}

                  {form.is_recurring && (
                    <div className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recurrence Type
                      </label>
                      <select
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-xs"
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

              {/* Preview - full width, draggable horizontally on small screens */}
              <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                  Preview
                </h4>
                <DraggableScroll>
                  <div className="inline-block min-w-[820px] sm:min-w-[1000px] md:min-w-[1100px] lg:min-w-full">
                    <DayOffBanner 
                      key={`preview-${form.start_date}-${form.end_date}-${form.show_banner}-${form.banner_message}`}
                      previewPeriod={form} 
                    />
                  </div>
                </DraggableScroll>
              </div>

              {formError && (
                <div className="lg:col-span-2 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs">{formError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="lg:col-span-2 flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200 text-sm"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm min-w-[140px]"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingId ? 'Update Period' : 'Create Period'}
                    </span>
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