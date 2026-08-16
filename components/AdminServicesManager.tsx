"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/Toast";
import { slugify } from "@/lib/slug";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  category: string | null;
  order: number;
  is_active: boolean;
};

type Draft = Omit<Service, "id">;

const emptyDraft: Draft = {
  name: "",
  description: "",
  price: null,
  duration_minutes: null,
  category: "",
  order: 0,
  is_active: true,
};

export function AdminServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [showForm, setShowForm] = useState(false);
  const { showSuccess, showError } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to load services");
      setServices(await res.json());
    } catch {
      showError("Services", "Could not load services.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  // Toggling is separated from the edit form: switching a service off is the
  // common action and should not require opening anything.
  const toggleActive = async (service: Service) => {
    setSavingId(service.id);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...service, is_active: !service.is_active }),
      });
      if (!res.ok) throw new Error();
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      );
      showSuccess(
        "Services",
        `${service.name} is now ${service.is_active ? "hidden from" : "visible on"} the website.`
      );
    } catch {
      showError("Services", `Could not update ${service.name}.`);
    } finally {
      setSavingId(null);
    }
  };

  const save = async () => {
    if (!draft.name.trim()) {
      showError("Services", "A name is required.");
      return;
    }

    setSavingId(editingId ?? "new");
    try {
      const res = await fetch(
        editingId ? `/api/admin/services/${editingId}` : "/api/admin/services",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        }
      );
      if (!res.ok) throw new Error();
      await load();
      setShowForm(false);
      setEditingId(null);
      setDraft(emptyDraft);
      showSuccess("Services", editingId ? "Service updated." : "Service added.");
    } catch {
      showError("Services", "Could not save the service.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (service: Service) => {
    if (!confirm(`Delete "${service.name}"? Switching it off keeps it recoverable.`)) return;

    setSavingId(service.id);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      showSuccess("Services", `${service.name} deleted.`);
    } catch {
      showError("Services", `Could not delete ${service.name}.`);
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (service: Service) => {
    const { id, ...rest } = service;
    setDraft(rest);
    setEditingId(id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-500 dark:text-gray-400">Loading services…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Services</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Each active service gets its own page at /services/… and is listed in the
            footer and sitemap. Switch one off to remove it everywhere.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft);
            setEditingId(null);
            setShowForm((v) => !v);
          }}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          {showForm ? "Cancel" : "Add service"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Leak Detection"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              {draft.name.trim() && (
                <span className="block mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Page: /services/{slugify(draft.name)}
                </span>
              )}
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Price from (£)
              </span>
              <input
                type="number"
                value={draft.price ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, price: e.target.value === "" ? null : Number(e.target.value) })
                }
                placeholder="90"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </span>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              placeholder="Professional leak detection and repair services"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <span className="block mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Used on the service page and in its search result description.
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Typical visit (min)
              </span>
              <input
                type="number"
                value={draft.duration_minutes ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    duration_minutes: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="75"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category
              </span>
              <input
                value={draft.category ?? ""}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="emergency"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Order
              </span>
              <input
                type="number"
                value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600"
              />
              <span className="text-sm text-gray-900 dark:text-white">Show on the website</span>
            </label>

            <button
              type="button"
              onClick={save}
              disabled={savingId !== null}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {savingId ? "Saving…" : editingId ? "Save changes" : "Add service"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {services.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No services yet.</p>
        )}

        {services.map((service) => (
          <div
            key={service.id}
            className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 transition-colors ${
              service.is_active
                ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-semibold ${
                    service.is_active
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-500"
                  }`}
                >
                  {service.name}
                </span>
                {service.price !== null && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    from £{service.price}
                  </span>
                )}
                {!service.is_active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {service.description || "—"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleActive(service)}
                disabled={savingId === service.id}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                  service.is_active
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {service.is_active ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => startEdit(service)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(service)}
                disabled={savingId === service.id}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
