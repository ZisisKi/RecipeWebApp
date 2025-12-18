// src/api/ingredientApi.js
import axios from 'axios';

// Διαβάζουμε τη διεύθυνση του server από το .env
const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * ΣΥΝΔΕΣΗ ΜΕ BACKEND: IngredientController
 * Base Route: @RequestMapping("/api/ingredients")
 * * Εδώ ορίζουμε όλες τις κλήσεις που αφορούν τα Υλικά.
 */

// 1. ΔΗΜΙΟΥΡΓΙΑ ΥΛΙΚΟΥ
// Backend: @PostMapping (σκέτο, άρα /api/ingredients)
// DTO: IngredientDto (name, description)
export const createIngredient = async (ingredientData) => {
    // Το ingredientData πρέπει να είναι: { name: "Tomata", description: "..." }
    const response = await axios.post(`${API_BASE_URL}/ingredients`, ingredientData);
    return response.data;
};

// 2. ΑΝΑΖΗΤΗΣΗ ΜΕ ΟΝΟΜΑ
// Backend: @GetMapping("/search") -> /api/ingredients/search
// Parameter: @RequestParam String name
export const searchIngredients = async (name) => {
    // ΠΡΟΣΟΧΗ: Όταν η Java έχει @RequestParam, εμείς χρησιμοποιούμε το 'params'
    // Η λέξη 'name' μέσα στο params πρέπει να είναι ΙΔΙΑ με το String name της Java
    const response = await axios.get(`${API_BASE_URL}/ingredients/search`, {
        params: { name: name } 
    });
    return response.data; // Επιστρέφει Λίστα (List<IngredientDto>)
};

// 3. ΛΗΨΗ ΟΛΩΝ ΤΩΝ ΥΛΙΚΩΝ
// Backend: @GetMapping("/all") -> /api/ingredients/all
export const getAllIngredients = async () => {
    const response = await axios.get(`${API_BASE_URL}/ingredients/all`);
    return response.data;
};

// 4. ΔΙΑΓΡΑΦΗ ΥΛΙΚΟΥ
// Backend: @DeleteMapping -> /api/ingredients
// Parameter: @RequestParam Long id
export const deleteIngredient = async (id) => {
    await axios.delete(`${API_BASE_URL}/ingredients`, {
        params: { id: id }
    });
};