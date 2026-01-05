import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;


export const addIngredientToRecipe = async (recipeIngredientDto) => {
    const response = await axios.post(`${API_BASE_URL}/recipe-ingredients`, recipeIngredientDto);
    return response.data;
};

export const getIngredientsByRecipeId = async (recipeId) => {
    const response = await axios.get(`${API_BASE_URL}/recipe-ingredients/by-recipe`, {
        params: { recipeId: recipeId }
    });
    return response.data;
};