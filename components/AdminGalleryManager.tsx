"use client";

import React, { useState } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useGallerySections } from "@/hooks/useGallerySections";
import { GalleryItem, GallerySection } from "@/types";

export function AdminGalleryManager() {
  const { galleryItems, loading, error, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useGallery();
  const { gallerySections, isLoading: sectionsLoading, error: sectionsError, addGallerySection, updateGallerySection, deleteGallerySection } = useGallerySections();
  
  const [activeTab, setActiveTab] = useState<'items' | 'sections'>('items');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editingSection, setEditingSection] = useState<GallerySection | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const defaultItem = {
    title: "",
    description: "",
    before_image_url: "",
    after_image_url: "",
    project_type: "",
    location: "",
    completion_date: "",
    section_id: undefined as number | undefined,
    order: 0,
    is_featured: false,
  };

  const defaultSection = {
    name: "",
    description: "",
    color: "#3B82F6",
    order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultItem);
  const [sectionFormData, setSectionFormData] = useState(defaultSection);

  const handleSave = async () => {
    try {
      if (editingItem) {
        await updateGalleryItem(editingItem.id, formData);
        setSaveMessage("Gallery item updated successfully!");
        setEditingItem(null);
      } else {
        await addGalleryItem(formData);
        setSaveMessage("Gallery item added successfully!");
        setShowAddForm(false);
      }
      setFormData({ ...defaultItem });
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Error saving gallery item");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      before_image_url: item.before_image_url,
      after_image_url: item.after_image_url,
      project_type: item.project_type || "",
      location: item.location || "",
      completion_date: item.completion_date || "",
      section_id: item.section_id,
      order: item.order,
      is_featured: item.is_featured,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      try {
        await deleteGalleryItem(id);
        setSaveMessage("Gallery item deleted successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (err) {
        setSaveMessage("Error deleting gallery item");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    }
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await updateGallerySection(editingSection.id, sectionFormData);
        setSaveMessage("Gallery section updated successfully!");
        setEditingSection(null);
      } else {
        await addGallerySection(sectionFormData);
        setSaveMessage("Gallery section added successfully!");
        setShowAddSectionForm(false);
      }
      setSectionFormData({ ...defaultSection });
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Error saving gallery section");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleEditSection = (section: GallerySection) => {
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      description: section.description || "",
      color: section.color,
      order: section.order,
      is_active: section.is_active,
    });
    setShowAddSectionForm(true);
  };

  const handleDeleteSection = async (id: number) => {
    if (confirm("Are you sure you want to delete this gallery section? This will remove the section from all gallery items.")) {
      try {
        await deleteGallerySection(id);
        setSaveMessage("Gallery section deleted successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (err) {
        setSaveMessage("Error deleting gallery section");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gallery Management
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
          Gallery Management
        </h3>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'items'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Gallery Items
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sections'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sections
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'items') {
              setShowAddForm(true);
              setEditingItem(null);
              setFormData({ ...defaultItem });
            } else {
              setShowAddSectionForm(true);
              setEditingSection(null);
              setSectionFormData({ ...defaultSection });
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {activeTab === 'items' ? 'Add New Item' : 'Add New Section'}
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes("Error") 
            ? "bg-red-50 text-red-700 border border-red-200" 
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Error Message */}
      {(error || sectionsError) && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error || sectionsError}
        </div>
      )}

      {/* Gallery Items Tab */}
      {activeTab === 'items' && (
        <>
          {/* Existing Gallery Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h4>
                {item.project_type && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.project_type}</p>
                )}
                {item.is_featured && (
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex gap-2">
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
            
            {/* Preview Images */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Before</p>
                {item.before_image_url ? (
                  <img 
                    src={item.before_image_url} 
                    alt="Before" 
                    className="w-full h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">After</p>
                {item.after_image_url ? (
                  <img 
                    src={item.after_image_url} 
                    alt="After" 
                    className="w-full h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bathroom Renovation in Clapham"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section
                </label>
                <select
                  value={formData.section_id || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, section_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No specific section</option>
                  {gallerySections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Type
                </label>
                <input
                  type="text"
                  value={formData.project_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bathroom, Kitchen, Leak Repair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Clapham, Battersea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Featured Item
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Before Image URL *
                </label>
                <input
                  type="url"
                  value={formData.before_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, before_image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/before.jpg"
                />
                {formData.before_image_url && (
                  <img 
                    src={formData.before_image_url} 
                    alt="Before preview" 
                    className="mt-2 w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  After Image URL *
                </label>
                <input
                  type="url"
                  value={formData.after_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, after_image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/after.jpg"
                />
                {formData.after_image_url && (
                  <img 
                    src={formData.after_image_url} 
                    alt="After preview" 
                    className="mt-2 w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the project, challenges, and results..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingItem ? "Update Item" : "Add Item"}
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
        </>
      )}

      {/* Gallery Sections Tab */}
      {activeTab === 'sections' && (
        <>
          {/* Existing Gallery Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallerySections.map((section) => (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{section.name}</h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: section.color }}
                      ></div>
                      <span className="text-xs text-gray-500">Order: {section.order}</span>
                      {!section.is_active && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Section Form */}
          {showAddSectionForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingSection ? "Edit Gallery Section" : "Add New Gallery Section"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.name}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bathroom Renovation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={sectionFormData.color}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={sectionFormData.order}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="section_is_active"
                    checked={sectionFormData.is_active}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="section_is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active Section
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={sectionFormData.description}
                  onChange={(e) => setSectionFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description for this section..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSection}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSection ? "Update Section" : "Add Section"}
                </button>
                <button
                  onClick={() => {
                    setShowAddSectionForm(false);
                    setEditingSection(null);
                    setSectionFormData({ ...defaultSection });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 