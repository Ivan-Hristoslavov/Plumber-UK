"use client";

import React, { useState } from "react";
import { usePricingCards } from "@/hooks/usePricingCards";
import { PricingCard, PricingCardTableRow, PricingCardNote } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";

export function AdminPricingManager() {
  const { pricingCards, loading, error, addPricingCard, updatePricingCard, deletePricingCard } = usePricingCards();
  const { showSuccess, showError } = useToast();
  const [editingCard, setEditingCard] = useState<PricingCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultCard = {
    title: "",
    subtitle: "",
    table_headers: ["Day & Time", "Call-out Fee", "Labour Rate"],
    table_rows: [
      { "Day & Time": "Mon-Fri 08:00-18:00", "Call-out Fee": "£80", "Labour Rate": "£60-£80" }
    ] as PricingCardTableRow[],
    notes: [
      { icon: "✓", text: "Perfect for urgent repairs and smaller jobs", color: "green" }
    ] as PricingCardNote[],
    order: 0,
  };

  const [formData, setFormData] = useState(defaultCard);

  const handleSave = async () => {
    try {
      if (editingCard) {
        await updatePricingCard(editingCard.id, formData);
        showSuccess(ToastMessages.pricing.cardUpdated.title, ToastMessages.pricing.cardUpdated.message);
        setEditingCard(null);
        setShowAddForm(false); // Close form after update
      } else {
        await addPricingCard(formData);
        showSuccess(ToastMessages.pricing.cardAdded.title, ToastMessages.pricing.cardAdded.message);
        setShowAddForm(false);
      }
      setFormData(defaultCard);
    } catch (err) {
      showError(ToastMessages.pricing.error.title, ToastMessages.pricing.error.message);
    }
  };

  const handleEdit = (card: PricingCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      subtitle: card.subtitle || "",
      table_headers: card.table_headers || ["Column 1", "Column 2", "Column 3"],
      table_rows: card.table_rows,
      notes: card.notes,
      order: card.order,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this pricing card?")) {
      try {
        await deletePricingCard(id);
        showSuccess(ToastMessages.pricing.cardDeleted.title, ToastMessages.pricing.cardDeleted.message);
      } catch (err) {
        showError(ToastMessages.pricing.error.title, ToastMessages.pricing.error.message);
      }
    }
  };

  const addTableRow = () => {
    const newRow: Record<string, string> = {};
    formData.table_headers.forEach(header => {
      newRow[header] = "";
    });
    setFormData(prev => ({
      ...prev,
      table_rows: [...prev.table_rows, newRow]
    }));
  };

  const addTableHeader = () => {
    setFormData(prev => ({
      ...prev,
      table_headers: [...prev.table_headers, `Column ${prev.table_headers.length + 1}`]
    }));
  };

  const updateTableHeader = (index: number, value: string) => {
    setFormData(prev => {
      const newHeaders = [...prev.table_headers];
      const oldHeader = newHeaders[index];
      newHeaders[index] = value;
      
      // Update all rows to use the new header name
      const newRows = prev.table_rows.map(row => {
        const newRow = { ...row };
        if (oldHeader in newRow) {
          newRow[value] = newRow[oldHeader];
          delete newRow[oldHeader];
        }
        return newRow;
      });
      
      return {
        ...prev,
        table_headers: newHeaders,
        table_rows: newRows
      };
    });
  };

  const removeTableHeader = (index: number) => {
    setFormData(prev => {
      const headerToRemove = prev.table_headers[index];
      const newHeaders = prev.table_headers.filter((_, i) => i !== index);
      
      // Remove the column from all rows
      const newRows = prev.table_rows.map(row => {
        const newRow = { ...row };
        delete newRow[headerToRemove];
        return newRow;
      });
      
      return {
        ...prev,
        table_headers: newHeaders,
        table_rows: newRows
      };
    });
  };

  const updateTableRow = (index: number, field: keyof PricingCardTableRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      table_rows: prev.table_rows.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const removeTableRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      table_rows: prev.table_rows.filter((_, i) => i !== index)
    }));
  };

  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      notes: [...prev.notes, { icon: "✓", text: "", color: "green" }]
    }));
  };

  const updateNote = (index: number, field: keyof PricingCardNote, value: string) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.map((note, i) => 
        i === index ? { ...note, [field]: value } : note
      )
    }));
  };

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pricing Cards Management
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
          Pricing Cards Management
        </h3>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingCard(null);
            setFormData(defaultCard);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Card
        </button>
      </div>

      {/* Existing Cards List */}
      <div className="space-y-4">
        {pricingCards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{card.title}</h4>
                {card.subtitle && (
                  <p className="text-gray-600 dark:text-gray-400">{card.subtitle}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Preview of table rows */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {card.table_rows.length} table rows, {card.notes.length} notes
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingCard ? "Edit Pricing Card" : "Add New Pricing Card"}
          </h4>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Call-out & Hourly Labour Rates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Flexible hourly bookings"
              />
            </div>
          </div>

          {/* Table Headers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-semibold text-gray-900 dark:text-white">Table Headers</h5>
              <button
                onClick={addTableHeader}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Add Column
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formData.table_headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateTableHeader(index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.table_headers.length > 1 && (
                    <button
                      onClick={() => removeTableHeader(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-semibold text-gray-900 dark:text-white">Table Rows</h5>
              <button
                onClick={addTableRow}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Add Row
              </button>
            </div>
            <div className="space-y-3">
              {formData.table_rows.map((row, index) => (
                <div key={index} className="grid gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded" style={{gridTemplateColumns: `repeat(${formData.table_headers.length}, 1fr) auto`}}>
                  {formData.table_headers.map((header) => (
                    <input
                      key={header}
                      type="text"
                      value={row[header] || ""}
                      onChange={(e) => updateTableRow(index, header, e.target.value)}
                      placeholder={header}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                  <button
                    onClick={() => removeTableRow(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-semibold text-gray-900 dark:text-white">Notes</h5>
              <button
                onClick={addNote}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Add Note
              </button>
            </div>
            <div className="space-y-3">
              {formData.notes.map((note, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <input
                    type="text"
                    value={note.icon || ""}
                    onChange={(e) => updateNote(index, "icon", e.target.value)}
                    placeholder="Icon (e.g., ✓)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={note.text}
                    onChange={(e) => updateNote(index, "text", e.target.value)}
                    placeholder="Note text"
                    className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeNote(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingCard ? "Update Card" : "Add Card"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingCard(null);
                setFormData(defaultCard);
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 