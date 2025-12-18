// src/api/stepApi.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * ΣΥΝΔΕΣΗ ΜΕ BACKEND: StepController
 * Base Route: @RequestMapping("/api/steps")
 */

// 1. ΔΗΜΙΟΥΡΓΙΑ ΒΗΜΑΤΟΣ
// Backend: @PostMapping
// DTO: StepDto (title, description, stepOrder, duration, recipeId)
export const createStep = async (stepDto) => {
    // ΠΡΟΣΟΧΗ: Το stepDto πρέπει να περιέχει το recipeId, αλλιώς η Java θα χτυπήσει Error.
    const response = await axios.post(`${API_BASE_URL}/steps`, stepDto);
    return response.data;
};

// 2. ΛΗΨΗ ΒΗΜΑΤΩΝ ΣΥΝΤΑΓΗΣ
// Backend: @GetMapping("/by-recipe")
// Parameter: @RequestParam Long recipeId
export const getStepsByRecipeId = async (recipeId) => {
    const response = await axios.get(`${API_BASE_URL}/steps/by-recipe`, {
        params: { recipeId: recipeId } // Στέλνουμε το ID της συνταγής
    });
    return response.data;
};

// 3. ΕΝΗΜΕΡΩΣΗ ΒΗΜΑΤΟΣ (Edit)
// Backend: @PutMapping
// Parameters: @RequestParam Long id, @RequestBody StepDto stepDto
export const updateStep = async (stepId, stepData) => {
    // Εδώ έχουμε και Param (στο URL) και Body (τα δεδομένα)
    const response = await axios.put(`${API_BASE_URL}/steps`, stepData, {
        params: { id: stepId }
    });
    return response.data;
};

// 4. ΔΙΑΓΡΑΦΗ ΒΗΜΑΤΟΣ
// Backend: @DeleteMapping
// Parameter: @RequestParam Long id
export const deleteStep = async (stepId) => {
    await axios.delete(`${API_BASE_URL}/steps`, {
        params: { id: stepId }
    });
};