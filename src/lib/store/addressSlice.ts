"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/database.types";
import { setSelectedAddress as setSelectedAddressAction } from "@/src/lib/finalUser/addresses/actions";

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
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) {
        return {
          addresses: [] as UserAddress[],
          selectedAddressId: null as string | null,
        };
      }

      const [addrRes, profileRes] = await Promise.all([
        supabase
          .from("user_addresses")
          .select("id, location_type, location_number, created_at, user_id")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("selected_address")
          .eq("id", auth.user.id)
          .single(),
      ]);

      if (addrRes.error) throw addrRes.error;
      if (profileRes.error && profileRes.error.code !== "PGRST116") {
        // ignore not found single row code, otherwise throw
        throw profileRes.error;
      }

      const addresses = (addrRes.data as UserAddress[]) || [];
      let selectedAddressId: string | null =
        (profileRes.data as any)?.selected_address ?? null;

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
