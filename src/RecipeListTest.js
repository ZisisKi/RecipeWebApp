// src/RecipeListTest.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/recipes'; 

function RecipeListTest() {
    // 🔴 1. Δήλωση State (ΔΕΝ ΠΡΕΠΕΙ ΝΑ ΛΕΙΠΕΙ)
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/all`);
                setRecipes(response.data); 
                console.log('Απάντηση Backend:', response.data); 
            } catch (err) {
                setError('Αποτυχία φόρτωσης συνταγών.');
                console.error('Error fetching recipes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    // 🔴 2. Render Logic (ΔΕΝ ΠΡΕΠΕΙ ΝΑ ΛΕΙΠΕΙ)
    if (loading) return <div>Φόρτωση Συνταγών...</div>;
    if (error) return <div style={{ color: 'red' }}>Σφάλμα: {error}</div>;

    // 3. Επιστροφή HTML
    return (
        <div>
            <h1>Εμφάνιση Συνταγών ({recipes.length})</h1>
            {recipes.length > 0 && (
                <ul>
                    {recipes.map(recipe => (
                        <li key={recipe.id}>
                            {recipe.name} - Διάρκεια: {recipe.totalDuration} λεπτά
                        </li>
                    ))}
                </ul>
            )}
            {recipes.length === 0 && <p>Δεν βρέθηκαν δεδομένα.</p>}
        </div>
    );
}

export default RecipeListTest;