"use client";

import React, { useState, useEffect } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useGallerySections } from "@/hooks/useGallerySections";
import { GalleryItem, GallerySection } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export function AdminGalleryManager({ 
  triggerModal, 
  defaultTab = "items" 
}: { 
  triggerModal?: boolean;
  defaultTab?: "items" | "sections";
}) {
  const {
    galleryItems,
    loading,
    error,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useGallery();
  const {
    gallerySections,
    isLoading: sectionsLoading,
    error: sectionsError,
    addGallerySection,
    updateGallerySection,
    deleteGallerySection,
  } = useGallerySections();
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();

  const [activeTab, setActiveTab] = useState<"items" | "sections">(defaultTab);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editingSection, setEditingSection] = useState<GallerySection | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerModal) {
      // Set the active tab based on the defaultTab prop
      setActiveTab(defaultTab);
      if (defaultTab === "items") {
        setShowAddForm(true);
      } else {
        setShowAddSectionForm(true);
      }
    }
  }, [triggerModal, defaultTab]);

  // Image file states
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforeImagePreview, setBeforeImagePreview] = useState<string>("");
  const [afterImagePreview, setAfterImagePreview] = useState<string>("");
  const [imageErrors, setImageErrors] = useState<{
    before?: string;
    after?: string;
  }>({});

  const defaultItem = {
    title: "",
    description: "",
    before_image_url: "",
    after_image_url: "",
    project_type: "",
    location: "",
    completion_date: "",
    section_id: undefined as string | undefined,
    order: 0,
    is_featured: false,
  };

  const defaultSection = {
    title: "",
    description: "",
    color: "#3B82F6",
    order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultItem);
  const [sectionFormData, setSectionFormData] = useState(defaultSection);

  const handleImageUpload = (file: File, type: "before" | "after") => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      setImageErrors((prev) => ({
        ...prev,
        [type]: "Please select an image file",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setImageErrors((prev) => ({
        ...prev,
        [type]: "Image must be under 10MB",
      }));
      return;
    }

    // Clear error and set file
    setImageErrors((prev) => ({ ...prev, [type]: undefined }));

    if (type === "before") {
      setBeforeImage(file);
      setBeforeImagePreview(URL.createObjectURL(file));
    } else {
      setAfterImage(file);
      setAfterImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = (type: "before" | "after") => {
    if (type === "before") {
      setBeforeImage(null);
      setBeforeImagePreview("");
      if (editingItem) {
        setFormData((prev) => ({ ...prev, before_image_url: "" }));
      }
    } else {
      setAfterImage(null);
      setAfterImagePreview("");
      if (editingItem) {
        setFormData((prev) => ({ ...prev, after_image_url: "" }));
      }
    }
  };

  const uploadImages = async (): Promise<{
    beforeUrl: string;
    afterUrl: string;
  }> => {
    const formDataUpload = new FormData();

    if (beforeImage) {
      formDataUpload.append("beforeImage", beforeImage);
    }
    if (afterImage) {
      formDataUpload.append("afterImage", afterImage);
    }

    // If editing and no new images, keep existing URLs
    if (!beforeImage && !afterImage && editingItem) {
      return {
        beforeUrl: formData.before_image_url,
        afterUrl: formData.after_image_url,
      };
    }

    const response = await fetch("/api/gallery/upload-images", {
      method: "POST",
      body: formDataUpload,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      beforeUrl: result.beforeUrl || formData.before_image_url,
      afterUrl: result.afterUrl || formData.after_image_url,
    };
  };

  const handleSave = async () => {
    try {
      // Validate required images for new items
      if (!editingItem && (!beforeImage || !afterImage)) {
        showError(
          "Validation Error",
          "Both before and after images are required"
        );
        return;
      }

      // Upload images first (only if new images are provided)
      let beforeUrl = formData.before_image_url;
      let afterUrl = formData.after_image_url;

      if (beforeImage || afterImage) {
        try {
          console.log('Starting image upload...');
          console.log('Before image:', beforeImage ? { name: beforeImage.name, size: beforeImage.size, type: beforeImage.type } : 'None');
          console.log('After image:', afterImage ? { name: afterImage.name, size: afterImage.size, type: afterImage.type } : 'None');
          
          const uploadResult = await uploadImages();
          beforeUrl = uploadResult.beforeUrl || beforeUrl;
          afterUrl = uploadResult.afterUrl || afterUrl;
          
          console.log('Upload successful:', { beforeUrl, afterUrl });
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          showError(
            "Upload Error",
            uploadError instanceof Error ? uploadError.message : "Failed to upload images. Please try again."
          );
          return;
        }
      }

      const itemData = {
        ...formData,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
      };
      
      console.log('Saving gallery item:', itemData);
      
      if (editingItem) {
        await updateGalleryItem(editingItem.id, itemData);
        showSuccess(
          ToastMessages.gallery.itemUpdated.title,
          ToastMessages.gallery.itemUpdated.message
        );
        setEditingItem(null);
        setShowAddForm(false);
      } else {
        await addGalleryItem({
          ...itemData,
          is_active: true,
        });
        showSuccess(
          ToastMessages.gallery.itemAdded.title,
          ToastMessages.gallery.itemAdded.message
        );
        setShowAddForm(false);
      }
      // Reset form and images
      setFormData({ ...defaultItem });
      setBeforeImage(null);
      setAfterImage(null);
      setBeforeImagePreview("");
      setAfterImagePreview("");
      setImageErrors({});
    } catch (err) {
      console.error('Save error:', err);
      showError(
        ToastMessages.gallery.error.title,
        err instanceof Error ? err.message : ToastMessages.gallery.error.message
      );
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      before_image_url: item.before_image_url || item.image_url || "",
      after_image_url: item.after_image_url || item.image_url || "",
      project_type: item.project_type || "",
      location: item.location || "",
      completion_date: item.completion_date || "",
      section_id: item.section_id,
      order: item.order,
      is_featured: item.is_featured || false,
    });

    // Set existing image previews
    setBeforeImagePreview(item.before_image_url || item.image_url || "");
    setAfterImagePreview(item.after_image_url || item.image_url || "");
    setBeforeImage(null);
    setAfterImage(null);
    setImageErrors({});

    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await confirm(
        {
          title: "Delete Gallery Item",
          message:
            "Are you sure you want to delete this gallery item? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true,
        },
        async () => {
          await deleteGalleryItem(id);
          showSuccess(
            ToastMessages.gallery.itemDeleted.title,
            ToastMessages.gallery.itemDeleted.message
          );
        }
      );
    } catch (err) {
      showError(
        ToastMessages.gallery.error.title,
        ToastMessages.gallery.error.message
      );
    }
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await updateGallerySection(Number(editingSection.id), sectionFormData);
        showSuccess(
          "Section updated successfully!",
          "The gallery section has been updated."
        );
        setEditingSection(null);
      } else {
        await addGallerySection(sectionFormData);
        showSuccess(
          "Section added successfully!",
          "A new gallery section has been created."
        );
        setShowAddSectionForm(false);
      }
      setSectionFormData({ ...defaultSection });
    } catch (err) {
      showError("Error", "Failed to save gallery section. Please try again.");
    }
  };

  const handleEditSection = (section: GallerySection) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || "",
      color: section.color,
      order: section.order,
      is_active: section.is_active,
    });
    setShowAddSectionForm(true);
  };

  const handleDeleteSection = async (id: number) => {
    try {
      await confirm(
        {
          title: "Delete Gallery Section",
          message:
            "Are you sure you want to delete this gallery section? All items in this section will be moved to 'No Section'.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true,
        },
        async () => {
          await deleteGallerySection(id);
          showSuccess(
            "Section deleted successfully!",
            "The gallery section has been removed."
          );
        }
      );
    } catch (err) {
      showError("Error", "Failed to delete gallery section. Please try again.");
    }
  };

  if (loading || sectionsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "items"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Gallery Items
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "sections"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Sections
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {activeTab === "items" && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Gallery Item
            </button>
          )}
          
          {activeTab === "sections" && (
            <button
              onClick={() => setShowAddSectionForm(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Section
            </button>
          )}
        </div>
      </div>

      {/* Gallery Items Tab */}
      {activeTab === "items" && (
        <>
          {/* Existing Gallery Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          section_id: e.target.value || undefined,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No specific section</option>
                      {gallerySections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          project_type: e.target.value,
                        }))
                      }
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          completion_date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_featured: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_featured"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Featured Item
                    </label>
                  </div>
                </div>

                {/* Right Column - Image Uploads */}
                <div className="space-y-4">
                  {/* Before Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Before Image *{" "}
                      {editingItem && "(leave empty to keep current)"}
                    </label>

                    <div className="space-y-3">
                      {/* File Input */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <svg
                              className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              Before image
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageUpload(e.target.files[0], "before")
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Error Message */}
                      {imageErrors.before && (
                        <p className="text-red-500 text-xs">
                          {imageErrors.before}
                        </p>
                      )}

                      {/* Preview */}
                      {beforeImagePreview && (
                        <div className="relative">
                          <img
                            src={beforeImagePreview}
                            alt="Before preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => clearImage("before")}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      After Image *{" "}
                      {editingItem && "(leave empty to keep current)"}
                    </label>

                    <div className="space-y-3">
                      {/* File Input */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <svg
                              className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              After image
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageUpload(e.target.files[0], "after")
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Error Message */}
                      {imageErrors.after && (
                        <p className="text-red-500 text-xs">
                          {imageErrors.after}
                        </p>
                      )}

                      {/* Preview */}
                      {afterImagePreview && (
                        <div className="relative">
                          <img
                            src={afterImagePreview}
                            alt="After preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => clearImage("after")}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
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
                    setBeforeImage(null);
                    setAfterImage(null);
                    setBeforeImagePreview("");
                    setAfterImagePreview("");
                    setImageErrors({});
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
      {activeTab === "sections" && (
        <>
          {/* Existing Gallery Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallerySections.map((section) => (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: section.color }}
                      ></div>
                      <span className="text-xs text-gray-500">
                        Order: {section.order}
                      </span>
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
                      onClick={() => handleDeleteSection(Number(section.id))}
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
                {editingSection
                  ? "Edit Gallery Section"
                  : "Add New Gallery Section"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.title}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bathroom Projects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={sectionFormData.color}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={sectionFormData.order}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="section_is_active"
                    checked={sectionFormData.is_active}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="section_is_active"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={sectionFormData.description}
                  onChange={(e) =>
                    setSectionFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this gallery section..."
                />
              </div>

              {/* Form Actions */}
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

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
}
