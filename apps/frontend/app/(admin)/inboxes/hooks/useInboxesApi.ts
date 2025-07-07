"use client";

import { useInboxes } from "@/contexts/InboxContext";

export const useInboxesApi = () => {
  return useInboxes();
}; 