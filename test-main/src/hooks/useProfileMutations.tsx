import { Dispatch, SetStateAction } from "react";
import { ProfileStats } from "@/types/profile";

const ENDPOINT_URL = "http://localhost:3000/";

export function useProfileMutations(
  setProfile: Dispatch<SetStateAction<ProfileStats | null>>
) {
  const updateProfile = async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      const res = await fetch(`${ENDPOINT_URL}api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              client: {
                ...prev.client,
                ...data,
              },
            }
          : prev
      );

      return { success: true };
    } catch (err) {
      console.error("Update profile failed:", err);
      return {
        success: false,
        message: "Something went wrong while saving.",
      };
    }
  };

  const toggleListing = async (
    coinId: number,
    action: "list" | "unlist"
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${ENDPOINT_URL}api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ coin_id: coinId, action }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        return { success: false, message: errorMsg };
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              client: {
                ...prev.client,
                coins: (prev.client.coins ?? []).map((coin) =>
                  coin.coin_id === coinId
                    ? { ...coin, for_sale: action === "list" }
                    : coin
                ),
              },
            }
          : prev
      );

      return { success: true };
    } catch (err) {
      console.error("Toggle listing failed:", err);
      return {
        success: false,
        message: "Server error while listing coin.",
      };
    }
  };

  return { updateProfile, toggleListing };
}
