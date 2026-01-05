import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL; 

export const createRecipe = async (recipeData) => {
  const response = await axios.post(`${API_BASE_URL}/recipes`, recipeData);
  return response.data;
};

export const getAllRecipes = async () => {
  const response = await axios.get(`${API_BASE_URL}/recipes/all`);
  return response.data;
};

export const getRecipeById = async (id) => {

  const response = await axios.get(`${API_BASE_URL}/recipes`, {
    params: { id: id },
  });

  return response.data;
};

export const deleteRecipe = async (id) => {
  await axios.delete(`${API_BASE_URL}/recipes`, {
    params: { id: id },
  });
};

export const updateRecipe = async (id, recipeData) => {

  const response = await axios.put(`${API_BASE_URL}/recipes`, recipeData, {
    params: { id: id },
  });
  return response.data;
};


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
