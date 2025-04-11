import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import SkeletonEditClient from "../loaders/EditClientSkeleton";

export function EditClient() {
  const { profile, updateProfile } = useProfile();
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const client = profile?.client;

  const getInitialFormData = () => ({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
  });

  useEffect(() => {
    if (client) setFormData(getInitialFormData());
  }, [client]);

  const validateForm = () => {
    const { name, email, phone } = formData;
    if (!name || !email) return "Name and email are required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email address.";
    if (phone && !/^\+?\d{7,15}$/.test(phone))
      return "Phone number must be 7-15 digits.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) return setFormError(validationError);
    const result = await updateProfile(formData);
    if (result.success) {
      setEditMode(false);
      setFormError(null);
    } else {
      setFormError(result.message || "Failed to update profile.");
    }
  };

  return !profile?.client ? (
    <SkeletonEditClient/>
  ) : (
    <div className="bg-white shadow p-6 rounded-lg relative">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        User Information
      </h2>

      {formError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">
          {formError}
        </div>
      )}

      <div className="space-y-3 text-gray-700">
        {["name", "email", "phone", "address"].map((field) => (
          <div key={field}>
            <label className="font-semibold capitalize block mb-1">
              {field}:
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData[field as keyof typeof formData]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-gray-300 outline-none transition"
                />
            ) : (
              <p>{formData[field as keyof typeof formData] || "N/A"}</p>
            )}
          </div>
        ))}

        <div>
          <label className="font-semibold block mb-1">Member Since:</label>
          <p>
            {client?.created_at
              ? new Date(client.created_at).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {editMode ? (
          <>
            <button
              onClick={() => {
                setEditMode(false);
                setFormError(null);
                setFormData(getInitialFormData());
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition cursor-pointer"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
