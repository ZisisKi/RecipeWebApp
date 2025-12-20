import React from "react";
import classes from "./RecipeCard.module.css";

const RecipeCard = ({ recipe, onClick }) => {
  const getDifficultyClass = (diff) => {
    if (diff === "EASY") return classes.easy;
    if (diff === "MEDIUM") return classes.medium;
    return classes.hard;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      APPETIZER: "🥗",
      MAIN_COURSE: "🍽️",
      DESSERT: "🍰",
      SALAD: "🥬",
      SNACK: "🍿",
    };
    return icons[category] || "🍴";
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      EASY: "Εύκολο",
      MEDIUM: "Μέτριο",
      HARD: "Δύσκολο",
    };
    return texts[difficulty] || difficulty;
  };

  return (
    <div className={classes.card} onClick={onClick}>
      <div className={classes.cardHeader}>
        <span className={classes.categoryIcon}>
          {getCategoryIcon(recipe.category)}
        </span>
        <div className={classes.timeBadge}>
          <span className={classes.timeIcon}>⏱</span>
          <span>{recipe.totalDuration}min</span>
        </div>
      </div>

      <div className={classes.cardBody}>
        <h3 className={classes.title}>{recipe.name}</h3>

        <p className={classes.description}>
          {recipe.description ||
            "Μια νόστιμη συνταγή που αξίζει να δοκιμάσετε!"}
        </p>

        <div className={classes.quickStats}>
          <span className={classes.stat}>
            <span className={classes.statNumber}>
              {recipe.steps ? recipe.steps.length : 0}
            </span>
            <span className={classes.statText}>βήματα</span>
          </span>
          <span className={classes.statDivider}>•</span>
          <span className={classes.stat}>
            <span className={classes.statNumber}>
              {recipe.recipeIngredients ? recipe.recipeIngredients.length : 0}
            </span>
            <span className={classes.statText}>υλικά</span>
          </span>
        </div>
      </div>

      <div className={classes.cardFooter}>
        <span
          className={`${classes.difficultyTag} ${getDifficultyClass(
            recipe.difficulty
          )}`}
        >
          {getDifficultyText(recipe.difficulty)}
        </span>
        <span className={classes.viewAction}>Προβολή →</span>
      </div>
    </div>
  );
};

export default RecipeCard;
