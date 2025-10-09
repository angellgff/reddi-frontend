import RestaurantListItem from "./RestaurantListItem";

import { Restaurant } from "@/src/lib/admin/type";

// Definimos las props para el componente de lista
export interface RestaurantListProps {
  restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <>
      {restaurants.length === 0 ? (
        <tbody>
          <tr>
            <td
              colSpan={8}
              className="px-6 py-6 text-center text-sm text-gray-500"
            >
              No hay restaurantes disponibles
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody className="bg-white divide-y divide-gray-200">
          {restaurants.map((restaurant) => (
            <RestaurantListItem key={restaurant.id} restaurant={restaurant} />
          ))}
        </tbody>
      )}
    </>
  );
}
