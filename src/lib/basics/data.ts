import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import { getRandomNumberFrom1To10 } from "../utils";
import { API_DELAY } from "@/src/lib/type";

export async function getRecommendedData(): Promise<SliderCardProps[]> {
  console.log("Fetching user data on the server...");
  // Simulación de llamada API
  await new Promise((resolve) =>
    setTimeout(resolve, API_DELAY * getRandomNumberFrom1To10())
  );
  const data: SliderCardProps[] = [];
  return data;
}
