"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { hydrateAddresses } from "@/src/lib/store/addressSlice";
import type { Tables } from "@/src/lib/database.types";

export default function UserAddressesHydratorClient({
  addresses,
  selectedAddressId,
}: {
  addresses: Tables<"user_addresses">[];
  selectedAddressId: string | null;
}) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAddresses({ addresses, selectedAddressId }));
  }, [dispatch, addresses, selectedAddressId]);
  return null;
}
