import { getRandomNumberFrom1To10 } from "@/src/lib/utils";
import { API_DELAY } from "@/src/lib/type";
import { cache } from "react";

const mockDishes: Array<{ id: string; dish: any }> = [
  {
    id: "1",
    dish: {
      image: "/tacos.svg",
      dishName: "La Bonga del Sinú",
      basePrice: "20.00",
      previousPrice: "25.00",
      discount: "254",
      unit: "unidad",
      estimatedTime: "25-30min",
      description: "Deliciosos tacos al pastor con piña y cilantro.",
      category: "tag1",
      isAvailable: true,
      taxIncluded: true,
      dishSections: [],
    },
  },
  {
    id: "2",
    dish: {
      image: "/alitas100.svg",
      dishName: "Alitas 100",
      basePrice: "20.00",
      previousPrice: "25.00",
      discount: "254",
      unit: "unidad",
      estimatedTime: "25-30min",
      description: "Deliciosos tacos al pastor con piña y cilantro.",
      category: "tag2",
      isAvailable: true,
      taxIncluded: true,
      dishSections: [],
    },
  },
  {
    id: "3",
    dish: {
      image: "/pollitofeliz.svg",
      dishName: "el pollito feliz",
      basePrice: "20.00",
      previousPrice: "25.00",
      discount: "254",
      unit: "unidad",
      estimatedTime: "25-30min",
      description: "Deliciosos tacos al pastor con piña y cilantro.",
      category: "tag3",
      isAvailable: true,
      taxIncluded: true,
      dishSections: [],
    },
  },
  {
    id: "4",
    dish: {
      image: "/pizzaymas.svg",
      dishName: "Pizza y más",
      basePrice: "20.00",
      previousPrice: "25.00",
      discount: "254",
      unit: "unidad",
      estimatedTime: "25-30min",
      description: "Deliciosos tacos al pastor con piña y cilantro.",
      category: "tag4",
      isAvailable: true,
      taxIncluded: true,
      dishSections: [],
    },
  },
  {
    id: "5",
    dish: {
      image: "/tacos.svg",
      dishName: "La Bonga del Sinú",
      basePrice: "20.00",
      previousPrice: "25.00",
      discount: "254",
      unit: "unidad",
      estimatedTime: "25-30min",
      description: "Deliciosos tacos al pastor con piña y cilantro.",
      category: "tag4",
      isAvailable: true,
      taxIncluded: true,
      dishSections: [],
    },
  },
];

async function getDishByIdUncached({ id }: { id: string }) {
  console.log("Se está haciendo la petición");
  // Simula la latencia de red
  await new Promise((resolve) =>
    setTimeout(resolve, API_DELAY * getRandomNumberFrom1To10())
  );

  const data = mockDishes.find((dish) => dish.id === id) || null;
  if (!data) {
    throw new Error("Dish not found");
  }
  return data.dish;
}

// 3. Exporta la versión envuelta en cache. Esta es la que importará tu página.
export const getDishById = cache(getDishByIdUncached);
