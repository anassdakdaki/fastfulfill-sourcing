export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  minPrice: number;
  image: string;
  moq: number;
};

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  { id: "cat_001", name: "Wireless Earbuds Pro X", category: "Gadgets", minPrice: 8, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80", moq: 50 },
  { id: "cat_002", name: "LED Ring Light 18 inch", category: "Photography", minPrice: 14, image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80", moq: 10 },
  { id: "cat_003", name: "Portable Blender USB", category: "Kitchen", minPrice: 6, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80", moq: 30 },
  { id: "cat_004", name: "Smart Watch Fitness Band", category: "Gadgets", minPrice: 18, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", moq: 20 },
  { id: "cat_005", name: "Bamboo Toothbrush Set", category: "Beauty", minPrice: 0.9, image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80", moq: 200 },
  { id: "cat_006", name: "Pet Grooming Glove", category: "Pets", minPrice: 2.5, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80", moq: 100 },
  { id: "cat_007", name: "Resistance Band Set", category: "Fitness", minPrice: 3, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80", moq: 50 },
  { id: "cat_008", name: "Silicone Kitchen Tools Set", category: "Kitchen", minPrice: 4, image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&q=80", moq: 100 },
  { id: "cat_009", name: "Car Phone Mount Magnetic", category: "Gadgets", minPrice: 1.8, image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80", moq: 100 },
  { id: "cat_010", name: "Jade Facial Roller", category: "Beauty", minPrice: 2.2, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80", moq: 50 },
  { id: "cat_011", name: "Dog Chew Rope Toy Set", category: "Pets", minPrice: 1.5, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80", moq: 200 },
  { id: "cat_012", name: "Yoga Mat Non Slip 6mm", category: "Fitness", minPrice: 5, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80", moq: 30 },
];
