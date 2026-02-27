"use client";

import React, { useState, useEffect } from "react";
import { useToast, ToastMessages } from "@/components/Toast";

interface Area {
  id: number;
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
  is_active: boolean;
  order: number;
}

export function ServiceAreasManager({ triggerModal }: { triggerModal?: boolean }) {
  const { showSuccess, showError } = useToast();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    postcode: "",
    description: "",
    response_time: "",
    is_active: true,
    order: 1,
  });

  // Load areas on component mount
  useEffect(() => {
    loadAreas();
  }, []);

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerModal) {
      setShowForm(true);
      setEditingArea(null);
      resetForm();
    }
  }, [triggerModal]);

  // Calculate next order number when areas change
  useEffect(() => {
    if (!editingArea && areas.length > 0) {
      const maxOrder = Math.max(...areas.map(area => area.order));
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [areas, editingArea]);

  const loadAreas = async () => {
    try {
      const response = await fetch("/api/admin/areas");
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error("Error loading areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/areas";
      const method = editingArea ? "PUT" : "POST";
      
      let body;
      
      if (editingArea) {
        // Editing existing area
        body = { ...formData, id: editingArea.id };
      } else {
        // Creating new area - shift existing orders if needed
        const newOrder = formData.order;
        const conflictingAreas = areas.filter(area => area.order >= newOrder);
        
        if (conflictingAreas.length > 0) {
          // Shift existing orders up
          for (const area of conflictingAreas) {
            await fetch("/api/admin/areas", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: area.id, order: area.order + 1 }),
            });
          }
        }
        
        body = formData;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingArea(null);
        resetForm();
        loadAreas();
        
        if (editingArea) {
          showSuccess(ToastMessages.areas.areaUpdated.title, ToastMessages.areas.areaUpdated.message);
        } else {
          showSuccess(ToastMessages.areas.areaAdded.title, ToastMessages.areas.areaAdded.message);
        }
      } else {
        showError(ToastMessages.areas.error.title, ToastMessages.areas.error.message);
      }
    } catch (error) {
      console.error("Error saving area:", error);
      showError(ToastMessages.areas.error.title, ToastMessages.areas.error.message);
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      slug: area.slug,
      postcode: area.postcode,
      description: area.description,
      response_time: area.response_time,
      is_active: area.is_active,
      order: area.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this area?")) return;

    try {
      const response = await fetch("/api/admin/areas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        loadAreas();
        showSuccess(ToastMessages.areas.areaDeleted.title, ToastMessages.areas.areaDeleted.message);
      } else {
        showError(ToastMessages.areas.error.title, ToastMessages.areas.error.message);
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      showError(ToastMessages.areas.error.title, ToastMessages.areas.error.message);
    }
  };

  const moveArea = async (areaId: number, direction: 'up' | 'down') => {
    const currentArea = areas.find(area => area.id === areaId);
    if (!currentArea) return;

    const currentIndex = areas.findIndex(area => area.id === areaId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= areas.length) return;

    const targetArea = areas[targetIndex];
    
    try {
      // Swap orders
      await fetch("/api/admin/areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentArea.id, order: targetArea.order }),
      });

      await fetch("/api/admin/areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetArea.id, order: currentArea.order }),
      });

      loadAreas();
      showSuccess(ToastMessages.areas.areaUpdated.title, "Area order updated successfully!");
    } catch (error) {
      console.error("Error moving area:", error);
      showError(ToastMessages.areas.error.title, ToastMessages.areas.error.message);
    }
  };

  const resetForm = () => {
    const defaultOrder = areas.length > 0 ? Math.max(...areas.map(area => area.order)) + 1 : 1;
    setFormData({
      name: "",
      slug: "",
      postcode: "",
      description: "",
      response_time: "",
      is_active: true,
      order: defaultOrder,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArea(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Manage the areas you cover and their response times.
          </p>
        </div>
        {/* Remove duplicate button - now handled by floating button */}
      </div>

      {/* Mobile: Card layout */}
      <div className="lg:hidden space-y-3">
        {areas.map((area) => (
          <div
            key={area.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white">{area.name}</h4>
                {area.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{area.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                    {area.postcode || "—"}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                    {area.response_time || "—"}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${
                      area.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {area.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveArea(area.id, "up")}
                  disabled={areas.findIndex((a) => a.id === area.id) === 0}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 rounded-lg"
                  title="Move Up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveArea(area.id, "down")}
                  disabled={areas.findIndex((a) => a.id === area.id) === areas.length - 1}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 rounded-lg"
                  title="Move Down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleEdit(area)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(area.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Postcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {area.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {area.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {area.postcode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {area.response_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        area.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {area.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {area.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => moveArea(area.id, 'up')}
                        disabled={areas.findIndex(a => a.id === area.id) === 0}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                        title="Move Up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveArea(area.id, 'down')}
                        disabled={areas.findIndex(a => a.id === area.id) === areas.length - 1}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                        title="Move Down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(area)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-none">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingArea ? "Edit Area" : "Add New Area"}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 min-h-[100px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Response Time
                </label>
                <input
                  type="text"
                  value={formData.response_time}
                  onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                  placeholder="e.g., 45 minutes"
                  className="w-full px-4 py-3 min-h-[44px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 min-h-[44px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-3 min-h-[44px] cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900 dark:text-white">Active</span>
              </label>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-3 min-h-[44px] text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 min-h-[44px] text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors touch-manipulation"
                >
                  {editingArea ? "Update" : "Create"}
                </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 