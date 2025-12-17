import axios from 'axios';

// Βήμα 1: Διαβάζουμε τη βασική διεύθυνση από το αρχείο .env
// Θυμήσου: Στο .env έβαλες 'http://localhost:8080/api'
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const createRecipe = async (recipeData) => {
    // Βήμα 2: Συνδυάζουμε τη βάση με το συγκεκριμένο endpoint
    // Το αποτέλεσμα θα είναι: http://localhost:8080/api/recipes
    const response = await axios.post(`${API_BASE_URL}/recipes`, recipeData);
    
    return response.data;
};

export const getAllRecipes = async () => {
    // GET αίτημα στο http://localhost:8080/api/recipes
    const response = await axios.get(`${API_BASE_URL}/recipes/all`);
    return response.data; // Επιστρέφει τη λίστα (Array) με τις συνταγές
};