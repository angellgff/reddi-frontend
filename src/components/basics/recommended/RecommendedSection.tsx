import SliderSection from "@/src/components/basics/itemsSlider/SliderSection";
import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";

export default function RecommendedSection({
  recommendedItems,
  title = "Recomendados para ti",
  href = "/recomendados",
}: {
  recommendedItems: SliderCardProps[];
  title?: string;
  href?: string;
}) {
  return (
    <SliderSection
      cards={recommendedItems}
      title={title}
      href={href}
    />
  );
}
