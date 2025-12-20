import React from 'react';
import classes from './RecipeCard.module.css';

const RecipeCard = ({ recipe, onClick }) => {
    
    const getDifficultyClass = (diff) => {
        if (diff === 'EASY') return classes.easy;
        if (diff === 'MEDIUM') return classes.medium;
        return classes.hard;
    };

    return (
        <div className={classes.card} onClick = {onClick}>
            <h3 className={classes.title}>{recipe.name}</h3>
            
            <p className={classes.description}>
                {recipe.description || "Χωρίς περιγραφή"}
            </p>

            <div className={classes.details}>
                <span>⏱ {recipe.totalDuration} λεπτά</span>
                <span className={`${classes.badge} ${getDifficultyClass(recipe.difficulty)}`}>
                    {recipe.difficulty}
                </span>
            </div>
            
            {/* ΔΙΟΡΘΩΣΗ: Αντικατάσταση του inline style με class */}
            <div className={classes.stats}>
                {recipe.steps ? recipe.steps.length : 0} Βήματα • {recipe.recipeIngredients ? recipe.recipeIngredients.length : 0} Υλικά
            </div>
        </div>
    );
};

export default RecipeCard;