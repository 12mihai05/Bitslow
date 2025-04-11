import { useState, useEffect, useRef } from "react";
import { useProfile } from "../hooks/useProfile";
import "../index.css";
import ErrorMessage from "@/components/ErrorMessage";
import { EditClient } from "../components/profile/EditClient";
import { ClientStats } from "@/components/profile/ClientStats";
import { ClientOverview } from "@/components/profile/ClientOverview";

export default function Profile() {
  const { profile, loading, error } = useProfile();

  if (!loading && (error || !profile || !profile.client)) {
    return (
      <ErrorMessage
        statusCode={error ? 500 : 404}
        title="Unable to Load Profile"
        message={
          error?.message || "User profile data not found or unavailable."
        }
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pt-16 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        My BitSlow Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <EditClient />

        <ClientStats />
      </div>

      <ClientOverview />
    </div>
  );
}
