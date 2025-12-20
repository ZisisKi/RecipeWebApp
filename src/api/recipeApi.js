import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL; // ή 'http://localhost:8080/api'

export const createRecipe = async (recipeData) => {
  const response = await axios.post(`${API_BASE_URL}/recipes`, recipeData);
  return response.data;
};

export const getAllRecipes = async () => {
  // ΣΗΜΑΝΤΙΚΟ: Τσέκαρε αν θέλει /all ή όχι, ανάλογα τον Controller σου
  // Αν ο Controller έχει @GetMapping("/all") τότε άστο έτσι.
  // Αν έχει σκέτο @GetMapping τότε σβήσε το /all
  const response = await axios.get(`${API_BASE_URL}/recipes/all`);
  return response.data;
};

export const getRecipeById = async (id) => {
  // ΠΑΛΙΟ (Λάθος για το δικό σου backend):
  // const response = await axios.get(`${API_BASE_URL}/recipes/${id}`);

  // ΝΕΟ (Σωστό για @RequestParam):
  // Στέλνει το αίτημα στο: http://localhost:8080/api/recipes?id=...
  const response = await axios.get(`${API_BASE_URL}/recipes`, {
    params: { id: id },
  });

  return response.data;
};

export const deleteRecipe = async (id) => {
  // Προσοχή: Στέλνουμε παράμετρο ?id=...
  // Το axios.delete δέχεται το config ως δεύτερο όρισμα
  await axios.delete(`${API_BASE_URL}/recipes`, {
    params: { id: id },
  });
};

// 2. ΕΝΗΜΕΡΩΣΗ ΣΥΝΤΑΓΗΣ (UPDATE)
export const updateRecipe = async (id, recipeData) => {
  // Το axios.put δέχεται: (url, data, config)
  // Άρα το params μπαίνει στο ΤΡΙΤΟ όρισμα
  const response = await axios.put(`${API_BASE_URL}/recipes`, recipeData, {
    params: { id: id },
  });
  return response.data;
};

// === Αναζήτηση ===

export const searchRecipesByName = async (name) => {
  const response = await axios.get(`${API_BASE_URL}/recipes/search`, {
    params: { name: name },
  });
  return response.data;
};

export const getRecipesByCategory = async (category) => {
  const response = await axios.get(`${API_BASE_URL}/recipes/by-category`, {
    params: { category: category },
  });
  return response.data;
};

export const getRecipesByDifficulty = async (difficulty) => {
  const response = await axios.get(`${API_BASE_URL}/recipes/by-difficulty`, {
    params: { difficulty: difficulty },
  });
  return response.data;
};
