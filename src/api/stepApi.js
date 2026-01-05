
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const createStep = async (stepDto) => {
    const response = await axios.post(`${API_BASE_URL}/steps`, stepDto);
    return response.data;
};

export const getStepsByRecipeId = async (recipeId) => {
    const response = await axios.get(`${API_BASE_URL}/steps/by-recipe`, {
        params: { recipeId: recipeId } 
    });
    return response.data;
};

export const updateStep = async (stepId, stepData) => {
    const response = await axios.put(`${API_BASE_URL}/steps`, stepData, {
        params: { id: stepId }
    });
    return response.data;
};

export const deleteStep = async (stepId) => {
    await axios.delete(`${API_BASE_URL}/steps`, {
        params: { id: stepId }
    });
};


