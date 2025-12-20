import React, { useEffect, useState } from 'react';
import { getRecipeById, deleteRecipe } from '../api/recipeApi';
import classes from './RecipeDetailsPage.module.css';

const RecipeDetailsPage = ({ recipeId, onEdit, onBack }) => {
    
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch Data on Mount
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getRecipeById(recipeId);
                setRecipe(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch recipe:", err);
                setError("Η φόρτωση της συνταγής απέτυχε.");
                setLoading(false);
            }
        };

        if (recipeId) {
            fetchDetails();
        }
    }, [recipeId]);

    // 2. Delete Handler
    const handleDelete = async () => {
        const confirmed = window.confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις οριστικά αυτή τη συνταγή;");
        if (confirmed) {
            try {
                await deleteRecipe(recipeId);
                alert("Η συνταγή διαγράφηκε επιτυχώς!");
                onBack(); // Επιστροφή στη λίστα
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Σφάλμα κατά τη διαγραφή της συνταγής.");
            }
        }
    };

    // 3. Conditional Rendering (Loading/Error)
    if (loading) return <div className={classes.loading}>Φόρτωση λεπτομερειών...</div>;
    if (error) return <div className={classes.error}>{error}</div>;
    if (!recipe) return <div className={classes.notFound}>Η συνταγή δεν βρέθηκε.</div>;

    // 4. Main Render
    return (
        <div className={classes.container}>
            
            {/* HEADER: Τίτλος & Κουμπιά */}
            <div className={classes.header}>
                <div className={classes.titleRow}>
                    <h1 className={classes.title}>{recipe.name}</h1>
                    <div className={classes.buttonGroup}>
                        <button className={classes.editBtn} onClick={onEdit}>
                            ✏️ Επεξεργασία
                        </button>
                        <button className={classes.deleteBtn} onClick={handleDelete}>
                            🗑️ Διαγραφή
                        </button>
                    </div>
                </div>

                {/* META INFO */}
                <div className={classes.metaContainer}>
                    <span className={`${classes.badge} ${classes.badgeTime}`}>
                        ⏱ {recipe.totalDuration} λεπτά
                    </span>
                    <span className={`${classes.badge} ${classes.badgeDifficulty}`}>
                        📊 {recipe.difficulty}
                    </span>
                    <span className={`${classes.badge} ${classes.badgeCategory}`}>
                        📂 {recipe.category}
                    </span>
                </div>

                {/* ΠΕΡΙΓΡΑΦΗ */}
                <p className={classes.description}>
                    {recipe.description || "Δεν υπάρχει περιγραφή για αυτή τη συνταγή."}
                </p>
            </div>

            {/* SECTION: ΥΛΙΚΑ */}
            <div className={classes.section}>
                <h3 className={classes.sectionTitle}>🛒 Υλικά Συνταγής</h3>
                {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
                    <ul className={classes.ingredientsList}>
                        {recipe.recipeIngredients.map((ing) => (
                            <li key={ing.id} className={classes.ingredientItem}>
                                • <strong>{ing.name}</strong>: {ing.quantity} {ing.measurementUnit}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Δεν έχουν καταχωρηθεί υλικά.</p>
                )}
            </div>

            {/* SECTION: ΒΗΜΑΤΑ */}
            <div className={classes.section}>
                <h3 className={classes.sectionTitle}>👨‍🍳 Εκτέλεση</h3>
                {recipe.steps && recipe.steps.length > 0 ? (
                    <div className={classes.stepsContainer}>
                        {/* Ταξινομούμε τα βήματα με βάση το stepOrder πριν τα δείξουμε */}
                        {recipe.steps
                            .sort((a, b) => a.stepOrder - b.stepOrder)
                            .map((step) => (
                                <div key={step.id} className={classes.stepCard}>
                                    <div className={classes.stepHeader}>
                                        <span className={classes.stepNumber}>{step.stepOrder}</span>
                                        <span className={classes.stepTitle}>{step.title}</span>
                                        <span className={classes.stepDuration}>{step.duration} λεπτά</span>
                                    </div>
                                    <div className={classes.stepDescription}>
                                        {step.description}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p>Δεν έχουν καταχωρηθεί βήματα εκτέλεσης.</p>
                )}
            </div>

        </div>
    );
};

export default RecipeDetailsPage;