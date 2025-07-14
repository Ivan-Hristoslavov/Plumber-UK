"use client";

import React, { useState } from "react";
import { useFAQ } from "@/hooks/useFAQ";
import { FAQItem } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export function AdminFAQManager() {
  const { faqItems, isLoading, error, addFAQItem, updateFAQItem, deleteFAQItem } = useFAQ(true);
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();
  
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultItem = {
    question: "",
    answer: "",
    order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultItem);

  const handleSave = async () => {
    try {
      if (editingItem) {
        await updateFAQItem(editingItem.id, formData);
        showSuccess(ToastMessages.faq.itemUpdated.title, ToastMessages.faq.itemUpdated.message);
        setEditingItem(null);
      } else {
        await addFAQItem(formData);
        showSuccess(ToastMessages.faq.itemAdded.title, ToastMessages.faq.itemAdded.message);
        setShowAddForm(false);
      }
      setFormData({ ...defaultItem });
    } catch (err) {
      showError(ToastMessages.faq.error.title, ToastMessages.faq.error.message);
    }
  };

  const handleEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      order: item.order,
      is_active: item.is_active,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await confirm(
        {
          title: "Delete FAQ Item",
          message: "Are you sure you want to delete this FAQ item? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true
        },
        async () => {
        await deleteFAQItem(id);
        showSuccess(ToastMessages.faq.itemDeleted.title, ToastMessages.faq.itemDeleted.message);
        }
      );
      } catch (err) {
        showError(ToastMessages.faq.error.title, ToastMessages.faq.error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          FAQ Management
        </h3>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          FAQ Management
        </h3>
        
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingItem(null);
            setFormData({ ...defaultItem });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New FAQ
        </button>
      </div>

      {/* Existing FAQ Items */}
      <div className="space-y-4">
        {faqItems.length === 0 && (
          <div className="text-gray-500 text-center py-8">No FAQ items yet.</div>
        )}
        {faqItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.question}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{item.answer}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Order: {item.order}</span>
                  {!item.is_active && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Inactive</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingItem ? "Edit FAQ Item" : "Add New FAQ Item"}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the FAQ question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Answer *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the FAQ answer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active ? "active" : "inactive"}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === "active" }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingItem ? "Update FAQ" : "Add FAQ"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
                setFormData({ ...defaultItem });
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
} 