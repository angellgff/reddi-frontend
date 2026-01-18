"use client";

// Importar el tipo real desde el fetch server-side.
// El tipo original tiene: id, name, image_url, address, partner_type
import type { StoreDetails as BaseStoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import { useEffect } from "react";
import RestaurantHeader from "./RestaurantHeader";
import MarketHeader from "./MarketHeader";

// Extendemos el tipo para permitir nuevos campos opcionales sin romper.
// This is also defined in the subcomponents, but it's fine.
type ExtendedStoreDetails = BaseStoreDetails & {
  banner_url?: string | null;
  logo_url?: string | null;
  delivery_time?: string | null;
};

export default function StoreHeader({
  store,
}: {
  store: ExtendedStoreDetails & { cover_image_url?: string | null };
}) {
  const showStore = useFloatingButtonStore((state) => state.showStore);

  useEffect(() => {
    if (store?.name) {
      showStore(store.name);
    }
  }, [store?.name, showStore]);

  const isRestaurant =
    store.partner_type?.toLowerCase() === "restaurant" ||
    (store.partner_type as string) === "Restaurante";

  if (!isRestaurant) {
    return <MarketHeader store={store} />;
  }

  return <RestaurantHeader store={store} />;
}
