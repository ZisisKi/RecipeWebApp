import React, { useEffect, useState } from 'react';
import { getAllRecipes } from '../api/recipeApi';
// Import το CSS Module
import classes from './RecipeListPage.module.css';

const RecipeListPage = () => {
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

    //ΕΞΗΓΗΣΗ ΓΙΑ ΤΟ USEEFFECT : Λέει στο React: "Αυτό τον κώδικα θα τον τρέξεις ΜΟΝΟ ΜΙΑ ΦΟΡΑ, τη στιγμή που η σελίδα γεννιέται (mount)".
    //Το [] στο τέλος είναι η ασφάλεια που του λέει "μην το ξανατρέξεις ποτέ, εκτός αν φορτώσει η σελίδα από την αρχή".

    if (loading) return <div className={classes.loading}>Φόρτωση συνταγών...</div>;
    if (error) return <div className={classes.error}>{error}</div>;

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Οι Συνταγές Μου</h1>
            
            {recipes.length === 0 ? (
                <p className={classes.empty}>Δεν υπάρχουν συνταγές ακόμα. Ξεκίνα δημιουργώντας μία!</p>
            ) : (
                <div className={classes.grid}>
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className={classes.card}>
                            <div>
                                <h3 className={classes.cardTitle}>{recipe.name}</h3>
                                <p className={classes.description}>{recipe.description}</p>
                            </div>
                            
                            <div className={classes.details}>
                                <span><strong>Κατηγορία:</strong> {recipe.category}</span>
                                <span><strong>Δυσκολία:</strong> {recipe.difficulty}</span>
                                <span><strong>Χρόνος:</strong> {recipe.totalDuration} λεπτά</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeListPage;