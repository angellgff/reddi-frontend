"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/database.types";
import { setSelectedAddress as setSelectedAddressAction } from "@/src/lib/finalUser/addresses/actions";
import { withTimeout } from "@/src/lib/utils";
import type { RootState } from ".";

export type UserAddress = Tables<"user_addresses">;

export type AddressState = {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetched: number | null;
};

const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  status: "idle",
  error: null,
  lastFetched: null,
};

// Fetch addresses and selected address in parallel
let fetchInFlight = false;

export const fetchUserAddresses = createAsyncThunk(
  "addresses/fetchUserAddresses",
  async (_, { rejectWithValue }) => {
    const DEBUG =
      process.env.NEXT_PUBLIC_DEBUG_ADDRESSES === "1" ||
      (typeof window !== "undefined" &&
        window.localStorage.getItem("debugAddresses") === "1");
    const now = () =>
      typeof performance !== "undefined" && performance.now
        ? performance.now()
        : Date.now();
    const tStart = now();
    if (DEBUG) console.log("[addresses] ▶ Inicio fetchUserAddresses");

    try {
      if (fetchInFlight) {
        if (DEBUG)
          console.log(
            "[addresses] ⏭️ Ya hay una petición en curso. Saltando duplicado."
          );
        // Evita pisar el estado con una respuesta vacía
        throw new Error("__skip__");
      }
      fetchInFlight = true;

      const supabase = createClient();
      // Primero intentamos getSession (rápido, no hace network). Si viene vacío, intentamos getUser como fallback.
      const tSess0 = now();
      const sessionRace = (await Promise.race([
        supabase.auth.getSession(),
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 4000)
        ),
      ])) as any;
      const tSess1 = now();
      let user = sessionRace?.data?.session?.user || null;
      if (DEBUG)
        console.log(
          "[addresses] ⏱️ getSession(ms)=",
          Math.round(tSess1 - tSess0),
          user ? "(con sesión)" : "(sin sesión)"
        );

      // Fallback adicional: a veces getSession es null en el primer render aunque exista cookie.
      // Intentamos getUser (hace network) con timeout corto para no colgar el header.
      if (!user) {
        const tUser0 = now();
        try {
          const userRace = (await Promise.race([
            supabase.auth.getUser(),
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: { user: null } }), 3500)
            ),
          ])) as any;
          user = userRace?.data?.user || null;
          if (DEBUG)
            console.log(
              "[addresses] ⏱️ getUser Fallback(ms)=",
              Math.round(now() - tUser0),
              user ? "(usuario encontrado)" : "(sin usuario)"
            );
        } catch (e) {
          if (DEBUG)
            console.log("[addresses] getUser fallback error silenciado", e);
        }
      }
      if (!user) {
        if (DEBUG)
          console.log(
            "[addresses] ⚠️ Usuario no autenticado. No se consultan direcciones."
          );
        return {
          addresses: [] as UserAddress[],
          selectedAddressId: null as string | null,
        };
      }

      // Preparar consultas en paralelo con medición de tiempo
      const tAddr0 = now();
      const addrPromise = withTimeout(
        (async () =>
          await supabase
            .from("user_addresses")
            .select("id, location_type, location_number, created_at, user_id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }))(),
        3000,
        "addr-timeout"
      );
      const tProf0 = now();
      const profilePromise = withTimeout(
        (async () =>
          await supabase
            .from("profiles")
            .select("selected_address")
            .eq("id", user.id)
            .single())(),
        3000,
        "profile-timeout"
      );

      const [addrRes, profileRes] = await Promise.allSettled([
        addrPromise,
        profilePromise,
      ]);
      const tAddr1 = now();
      const tProf1 = now();
      if (DEBUG) {
        console.log(
          "[addresses] ⏱️ user_addresses(ms)=",
          Math.round(tAddr1 - tAddr0),
          addrRes
        );
        console.log(
          "[addresses] ⏱️ profile.selected_address(ms)=",
          Math.round(tProf1 - tProf0),
          profileRes
        );
      }

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

      if (DEBUG)
        console.log(
          "[addresses] ✓ result ->",
          { count: addresses.length, selectedAddressId },
          "total(ms)=",
          Math.round(now() - tStart)
        );

      return { addresses, selectedAddressId } as {
        addresses: UserAddress[];
        selectedAddressId: string | null;
      };
    } catch (e: any) {
      const msg = e?.message || e;
      if (msg === "__skip__") {
        if (DEBUG) console.log("[addresses] ⏹️ skip (in-flight)");
        return rejectWithValue("__skip__");
      }
      console.warn("[addresses] ✗ error:", msg);
      return rejectWithValue(msg || "Error al cargar direcciones");
    } finally {
      fetchInFlight = false;
      if (DEBUG)
        console.log(
          "[addresses] ■ fin fetchUserAddresses (ms)=",
          Math.round(
            (typeof performance !== "undefined" && performance.now
              ? performance.now()
              : Date.now()) - tStart
          )
        );
    }
  },
  {
    // Evita spam: no ejecutar si ya hay una carga en curso o si se cargó hace < 30s
    condition: (_, { getState }) => {
      const s = (getState() as RootState).addresses;
      if (s.status === "loading") return false;
      if (fetchInFlight) return false;
      if (s.lastFetched && Date.now() - s.lastFetched < 30000) return false;
      return true;
    },
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
    hydrateAddresses(
      state,
      action: PayloadAction<{
        addresses: UserAddress[];
        selectedAddressId: string | null;
      }>
    ) {
      state.addresses = action.payload.addresses || [];
      state.selectedAddressId = action.payload.selectedAddressId || null;
      state.status = "succeeded";
      state.error = null;
      state.lastFetched = Date.now();
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
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        if (action.payload === "__skip__") {
          // Ignorar el rechazo por deduplicación
          return;
        }
        state.status = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export const { setSelectedAddressLocal, clearAddresses, hydrateAddresses } =
  addressSlice.actions;
export default addressSlice.reducer;
