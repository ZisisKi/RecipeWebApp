// src/pages/RecipeListPage.js
import React, { useEffect, useState } from 'react';
import { getAllRecipes } from '../api/recipeApi';
import RecipeCard from '../components/recipe-list/RecipeCard';
import classes from './RecipeListPage.module.css';

const RecipeListPage = ({ onRecipeClick }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await getAllRecipes();
                setRecipes(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Απέτυχε η φόρτωση των συνταγών.');
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    if (loading) return <div className={classes.loading}>Φόρτωση συνταγών...</div>; // <--- ΠΡΟΣΕΞΕ ΑΥΤΟ ΤΟ ΜΗΝΥΜΑ
    if (error) return <div className={classes.error}>{error}</div>;

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Οι Συνταγές Μου</h1>
            
            {recipes.length === 0 ? (
                <p className={classes.empty}>Δεν υπάρχουν συνταγές ακόμα.</p>
            ) : (
                <div className={classes.grid}>
                    {recipes.map((recipe) => (
                        <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            onClick={() => onRecipeClick(recipe.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeListPage;