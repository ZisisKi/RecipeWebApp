import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * --- ΛΟΓΙΚΗ ΣΥΝΔΕΣΗΣ ---
 * Backend Controller: RecipeIngredientController
 * Route: @RequestMapping("/api/recipe-ingredients")
 */

// 1. CREATE LINK: Συνδέουμε ένα υλικό με συνταγή (π.χ. 500g Αλεύρι στη Συνταγή Κέικ)
// Αντιστοιχεί στο: @PostMapping
export const addIngredientToRecipe = async (recipeIngredientDto) => {
    // Το DTO πρέπει να έχει: recipeId, ingredientId, quantity, measurementUnit
    const response = await axios.post(`${API_BASE_URL}/recipe-ingredients`, recipeIngredientDto);
    return response.data;
};

// 2. GET BY RECIPE: Φέρε όλα τα υλικά αυτής της συνταγής
// Αντιστοιχεί στο: @GetMapping("/by-recipe")
export const getIngredientsByRecipeId = async (recipeId) => {
    const response = await axios.get(`${API_BASE_URL}/recipe-ingredients/by-recipe`, {
        params: { recipeId: recipeId }
    });
    return response.data;
};