import { useProfileData } from "./useProfileData";
import { useProfileScrollLoader } from "./useProfileScrollLoader";
import { useProfileMutations } from "./useProfileMutations";

export function useProfile(limit = 10) {
  const {
    profile,
    setProfile,
    loading,
    error,
    transactionCounts,
    hasMoreCoins,
    hasMoreBuyerTxs,
    hasMoreSellerTxs,
  } = useProfileData(limit);

  const {
    fetchMoreCoins,
    loadingMoreCoins,
    fetchMoreBuyerTransactions,
    loadingMoreBuyerTxs,
    fetchMoreSellerTransactions,
    loadingMoreSellerTxs,
  } = useProfileScrollLoader(profile, setProfile, limit);

  const {
    updateProfile,
    toggleListing,
  } = useProfileMutations(setProfile);

  return {
    // Profile
    profile,
    setProfile,
    loading,
    error,

    // Stats
    transactionCounts,

    // Pagination
    fetchMoreCoins,
    loadingMoreCoins,
    hasMoreCoins,
    fetchMoreBuyerTransactions,
    loadingMoreBuyerTxs,
    hasMoreBuyerTxs,
    fetchMoreSellerTransactions,
    loadingMoreSellerTxs,
    hasMoreSellerTxs,

    // Mutations
    updateProfile,
    toggleListing,
  };
}
