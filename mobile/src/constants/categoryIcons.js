/**
 * Maps product categories to Ionicons names
 * Categories: nevera, despensa, congelados
 */
export const getCategoryIcon = (category) => {
  if (!category) return 'nutrition-outline';

  const categoryLower = category.toLowerCase().trim();

  switch (categoryLower) {
    case 'nevera':
      // Fridge/refrigerated items
      return 'snow-outline';

    case 'despensa':
      // Pantry/shelf-stable items
      return 'cube-outline';

    case 'congelados':
      // Frozen items
      return 'ice-cream-outline';

    default:
      return 'nutrition-outline';
  }
};

// Category labels for display (Spanish)
export const CATEGORY_LABELS = {
  nevera: 'Nevera',
  despensa: 'Despensa',
  congelados: 'Congelados',
};

// Category icons mapping for documentation
export const CATEGORY_ICONS = {
  nevera: 'snow-outline', // ❄️ Fridge
  despensa: 'cube-outline', // 📦 Pantry
  congelados: 'ice-cream-outline', // 🍦 Frozen
  default: 'nutrition-outline', // 🍽️ Default
};

// Get category color (optional - for badges)
export const getCategoryColor = (category) => {
  const categoryLower = category?.toLowerCase().trim();

  switch (categoryLower) {
    case 'nevera':
      return '#4A90E2'; // Blue
    case 'despensa':
      return '#F5A623'; // Orange
    case 'congelados':
      return '#7ED321'; // Green
    default:
      return '#9B9B9B'; // Gray
  }
};
