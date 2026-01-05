
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;


export const createIngredient = async (ingredientData) => {
    const response = await axios.post(`${API_BASE_URL}/ingredients`, ingredientData);
    return response.data;
};

export const searchIngredients = async (name) => {
    const response = await axios.get(`${API_BASE_URL}/ingredients/search`, {
        params: { name: name } 
    });
    return response.data; 
};

export const getAllIngredients = async () => {
    const response = await axios.get(`${API_BASE_URL}/ingredients/all`);
    return response.data;
};

export const deleteIngredient = async (id) => {
    await axios.delete(`${API_BASE_URL}/ingredients`, {
        params: { id: id }
    });
};