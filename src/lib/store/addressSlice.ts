"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/database.types";
import { setSelectedAddress as setSelectedAddressAction } from "@/src/lib/finalUser/addresses/actions";
import { withTimeout } from "@/src/lib/utils";

export type UserAddress = Tables<"user_addresses">;

export type AddressState = {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  status: "idle",
  error: null,
};

// Fetch addresses and selected address in parallel
export const fetchUserAddresses = createAsyncThunk(
  "addresses/fetchUserAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient();
      // Soft-timeout: si getSession se demora, asumimos no autenticado SIN lanzar error
      const sessionOrTimeout = (await Promise.race([
        supabase.auth.getSession(),
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 900)
        ),
      ])) as any;
      const user = sessionOrTimeout?.data?.session?.user || null;
      if (!user) {
        return {
          addresses: [] as UserAddress[],
          selectedAddressId: null as string | null,
        };
      }

      const [addrRes, profileRes] = await Promise.allSettled([
        withTimeout(
          (async () =>
            await supabase
              .from("user_addresses")
              .select("id, location_type, location_number, created_at, user_id")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }))(),
          3000,
          "addr-timeout"
        ),
        withTimeout(
          (async () =>
            await supabase
              .from("profiles")
              .select("selected_address")
              .eq("id", user.id)
              .single())(),
          3000,
          "profile-timeout"
        ),
      ]);

      // Parse results with graceful fallbacks
      const addrOk =
        addrRes.status === "fulfilled" && !(addrRes.value as any).error;
      const profileOk =
        profileRes.status === "fulfilled" && !(profileRes.value as any).error;

      if (addrRes.status === "fulfilled" && (addrRes.value as any).error) {
        throw (addrRes.value as any).error;
      }
      if (
        profileRes.status === "fulfilled" &&
        (profileRes.value as any).error &&
        (profileRes.value as any).error.code !== "PGRST116"
      ) {
        // ignore not found single row code, otherwise throw
        throw (profileRes.value as any).error;
      }

      const addresses: UserAddress[] = addrOk
        ? ((addrRes as any).value.data as UserAddress[]) || []
        : [];
      let selectedAddressId: string | null = profileOk
        ? (profileRes as any).value.data?.selected_address ?? null
        : null;

      if (!selectedAddressId && addresses.length > 0) {
        selectedAddressId = addresses[0].id as unknown as string; // ids are uuid strings
      }

      return { addresses, selectedAddressId } as {
        addresses: UserAddress[];
        selectedAddressId: string | null;
      };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Error al cargar direcciones");
    }
  }
);

// Update selected address via server action, then optimistically update local state
export const updateSelectedAddress = createAsyncThunk(
  "addresses/updateSelectedAddress",
  async (addressId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await setSelectedAddressAction(addressId);
      if (!res.success) {
        throw new Error(res.error || "No se pudo seleccionar.");
      }
      // Optimistic local update for instant UI feedback
      dispatch(setSelectedAddressLocal(addressId));
      return addressId;
    } catch (e: any) {
      return rejectWithValue(e?.message || "No se pudo seleccionar.");
    }
  }
);

const addressSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    setSelectedAddressLocal(state, action: PayloadAction<string>) {
      state.selectedAddressId = action.payload;
    },
    clearAddresses(state) {
      state.addresses = [];
      state.selectedAddressId = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAddresses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.addresses = action.payload.addresses;
        state.selectedAddressId = action.payload.selectedAddressId;
        state.error = null;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export const { setSelectedAddressLocal, clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
