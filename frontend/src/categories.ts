const defaultCategories = ["Desenvolvimento", "Estudos", "Trabalho", "Pessoal"];

let categories = [...defaultCategories];
const listeners = new Set<() => void>();

export function getCategories() {
  return [...categories];
}

export function subscribeToCategories(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addCategory(category: string) {
  const normalizedCategory = category.trim();

  if (
    !normalizedCategory ||
    categories.some(
      (item) => item.toLocaleLowerCase() === normalizedCategory.toLocaleLowerCase(),
    )
  ) {
    return false;
  }

  categories = [...categories, normalizedCategory];
  listeners.forEach((listener) => listener());
  return true;
}
