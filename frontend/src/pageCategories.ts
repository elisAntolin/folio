import { createContext } from "react";
import type { CategoryOption } from "./api";

export const PageCategoriesContext = createContext<CategoryOption[] | null>(null);
