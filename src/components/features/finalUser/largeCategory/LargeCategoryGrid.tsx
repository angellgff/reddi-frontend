import CategoryCard from "@/src/components/features/main/categories/CategoryCard";

const largeCategories = [
  {
    name: "Mercado",
    imageUrl: "/market.png",
    href: "/mercado",
  },
  {
    name: "Restaurantes",
    imageUrl: "/restaurant.png",
    href: "/restaurantes",
  },
];

export default function LargeCategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {largeCategories.map((category) => (
        <CategoryCard
          key={category.name}
          name={category.name}
          imageUrl={category.imageUrl}
          href={category.href}
          size="large"
        />
      ))}
    </div>
  );
}
