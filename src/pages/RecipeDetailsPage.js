import React, { useEffect, useState } from "react";
import { getRecipeById, deleteRecipe } from "../api/recipeApi";
import classes from "./RecipeDetailsPage.module.css";

const RecipeDetailsPage = ({ recipeId, onEdit, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ingredients");

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Είσαι σίγουρος ότι θέλεις να διαγράψεις οριστικά αυτή τη συνταγή;"
    );
    if (confirmed) {
      try {
        await deleteRecipe(recipeId);
        alert("Η συνταγή διαγράφηκε επιτυχώς!");
        onBack();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Σφάλμα κατά τη διαγραφή της συνταγής.");
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "#4CAF50";
      case "MEDIUM":
        return "#FF9800";
      case "HARD":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "APPETIZER":
        return "🥗";
      case "MAIN_COURSE":
        return "🍽️";
      case "DESSERT":
        return "🍰";
      case "SALAD":
        return "🥙";
      case "SNACK":
        return "🍿";
      default:
        return "🍴";
    }
  };

  const translateCategory = (category) => {
    const translations = {
      APPETIZER: "Ορεκτικό",
      MAIN_COURSE: "Κυρίως Πιάτο",
      DESSERT: "Επιδόρπιο",
      SALAD: "Σαλάτα",
      SNACK: "Σνακ",
    };
    return translations[category] || category;
  };

  const translateDifficulty = (difficulty) => {
    const translations = {
      EASY: "Εύκολο",
      MEDIUM: "Μέτριο",
      HARD: "Δύσκολο",
    };
    return translations[difficulty] || difficulty;
  };

  const getTotalStepsTime = () => {
    if (!recipe.steps || recipe.steps.length === 0) return 0;
    return recipe.steps.reduce(
      (total, step) => total + (step.duration || 0),
      0
    );
  };

  if (loading)
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Φόρτωση λεπτομερειών συνταγής...</p>
      </div>
    );

  if (error)
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>⚠️</div>
        <p>{error}</p>
      </div>
    );

  if (!recipe)
    return (
      <div className={classes.notFoundContainer}>
        <div className={classes.notFoundIcon}>🔍</div>
        <p>Η συνταγή δεν βρέθηκε.</p>
      </div>
    );

  return (
    <div className={classes.container}>
      {/* RECIPE SECTION */}
      <div className={classes.heroSection}>
        <div className={classes.heroBackground}>
          <div className={classes.heroContent}>
            <div className={classes.titleRow}>
              <h1 className={classes.heroTitle}>{recipe.name}</h1>
              <div className={classes.actionButtons}>
                <button
                  className={`${classes.actionBtn} ${classes.editBtn}`}
                  onClick={onEdit}
                  title="Επεξεργασία συνταγής"
                >
                  <span className={classes.btnIcon}>✏️</span>
                  Επεξεργασία
                </button>
                <button
                  className={`${classes.actionBtn} ${classes.deleteBtn}`}
                  onClick={handleDelete}
                  title="Διαγραφή συνταγής"
                >
                  <span className={classes.btnIcon}>❌</span>
                  Διαγραφή
                </button>
              </div>
            </div>

            {/* RECIPE STATS */}
            <div className={classes.statsContainer}>
              <div className={classes.statCard}>
                <div className={classes.statIcon}>⏱️</div>
                <div className={classes.statContent}>
                  <span className={classes.statValue}>
                    {recipe.totalDuration}
                  </span>
                  <span className={classes.statLabel}>Λεπτά</span>
                </div>
              </div>

              <div className={classes.statCard}>
                <div className={classes.statIcon}>📊</div>
                <div className={classes.statContent}>
                  <span
                    className={classes.statValue}
                    style={{ color: getDifficultyColor(recipe.difficulty) }}
                  >
                    {translateDifficulty(recipe.difficulty)}
                  </span>
                  <span className={classes.statLabel}>Δυσκολία</span>
                </div>
              </div>

              <div className={classes.statCard}>
                <div className={classes.statIcon}>
                  {getCategoryIcon(recipe.category)}
                </div>
                <div className={classes.statContent}>
                  <span className={classes.statValue}>
                    {translateCategory(recipe.category)}
                  </span>
                  <span className={classes.statLabel}>Κατηγορία</span>
                </div>
              </div>

              {recipe.steps && recipe.steps.length > 0 && (
                <div className={classes.statCard}>
                  <div className={classes.statIcon}>📋</div>
                  <div className={classes.statContent}>
                    <span className={classes.statValue}>
                      {recipe.steps.length}
                    </span>
                    <span className={classes.statLabel}>Βήματα</span>
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {recipe.description && (
              <div className={classes.descriptionCard}>
                <h3 className={classes.descriptionTitle}>Περιγραφή</h3>
                <p className={classes.descriptionText}>{recipe.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className={classes.tabContainer}>
        <button
          className={`${classes.tab} ${
            activeTab === "ingredients" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("ingredients")}
        >
          <span className={classes.tabIcon}>🛒</span>
          Υλικά ({recipe.recipeIngredients?.length || 0})
        </button>
        <button
          className={`${classes.tab} ${
            activeTab === "steps" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("steps")}
        >
          <span className={classes.tabIcon}>👨‍🍳</span>
          Βήματα ({recipe.steps?.length || 0})
        </button>
      </div>

      <div className={classes.tabContent}>
        {/* INGREDIENTS TAB */}
        {activeTab === "ingredients" && (
          <div className={classes.ingredientsSection}>
            {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
              <div className={classes.ingredientsGrid}>
                {recipe.recipeIngredients.map((ing, index) => (
                  <div key={ing.id || index} className={classes.ingredientCard}>
                    <div className={classes.ingredientIcon}>🥄</div>
                    <div className={classes.ingredientDetails}>
                      <h4 className={classes.ingredientName}>{ing.name}</h4>
                      <div className={classes.ingredientQuantity}>
                        <span className={classes.quantity}>{ing.quantity}</span>
                        <span className={classes.unit}>
                          {ing.measurementUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={classes.emptyState}>
                <div className={classes.emptyIcon}>📝</div>
                <h3>Δεν υπάρχουν υλικά</h3>
                <p>Δεν έχουν καταχωρηθεί υλικά για αυτή τη συνταγή.</p>
              </div>
            )}
          </div>
        )}

        {/* STEPS TAB */}
        {activeTab === "steps" && (
          <div className={classes.stepsSection}>
            {recipe.steps && recipe.steps.length > 0 ? (
              <div className={classes.stepsTimeline}>
                {recipe.steps
                  .sort((a, b) => a.stepOrder - b.stepOrder)
                  .map((step, index) => (
                    <div key={step.id} className={classes.stepCard}>
                      <div className={classes.stepNumber}>{step.stepOrder}</div>
                      <div className={classes.stepContent}>
                        <div className={classes.stepHeader}>
                          <h4 className={classes.stepTitle}>{step.title}</h4>
                          <div className={classes.stepMeta}>
                            <span className={classes.stepDuration}>
                              ⏱️ {step.duration} λεπτά
                            </span>
                          </div>
                        </div>
                        <p className={classes.stepDescription}>
                          {step.description}
                        </p>

                        {step.stepIngredients &&
                          step.stepIngredients.length > 0 && (
                            <div className={classes.stepIngredients}>
                              <h5>Υλικά βήματος:</h5>
                              <div className={classes.stepIngredientsList}>
                                {step.stepIngredients.map((ing, ingIndex) => (
                                  <span
                                    key={ingIndex}
                                    className={classes.stepIngredientTag}
                                  >
                                    {ing.quantity} {ing.measurementUnit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {index < recipe.steps.length - 1 && (
                        <div className={classes.stepConnector}></div>
                      )}
                    </div>
                  ))}

                <div className={classes.stepsSummary}>
                  <div className={classes.summaryIcon}>⏱️</div>
                  <p>Συνολικός χρόνος: {getTotalStepsTime()} λεπτά</p>
                </div>
              </div>
            ) : (
              <div className={classes.emptyState}>
                <div className={classes.emptyIcon}>👨‍🍳</div>
                <h3>Δεν υπάρχουν βήματα</h3>
                <p>
                  Δεν έχουν καταχωρηθεί βήματα εκτέλεσης για αυτή τη συνταγή.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
