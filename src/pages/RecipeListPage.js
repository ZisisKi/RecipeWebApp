import React, { useEffect, useState } from "react";
import {
  getAllRecipes,
  searchRecipesByName,
  getRecipesByCategory,
  getRecipesByDifficulty,
} from "../api/recipeApi";
import RecipeCard from "../components/recipe-list/RecipeCard";
import RecipeSearch from "../components/recipe-search/RecipeSearch";
import classes from "./RecipeListPage.module.css";

const RecipeListPage = ({ onRecipeClick }) => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [displayedRecipes, setDisplayedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setAllRecipes(data);
        setDisplayedRecipes(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Απέτυχε η φόρτωση των συνταγών. Παρακαλώ δοκιμάστε ξανά αργότερα.");
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleSearch = async (filters) => {
    if (
      !filters.name &&
      !filters.category &&
      !filters.difficulty &&
      !filters.maxDuration
    ) {
      setDisplayedRecipes(allRecipes);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      let results = allRecipes;

      if (filters.name && filters.name.trim()) {
        results = await searchRecipesByName(filters.name);
      }

      if (filters.category) {
        if (filters.name) {
          results = results.filter(
            (recipe) => recipe.category === filters.category
          );
        } else {
          results = await getRecipesByCategory(filters.category);
        }
      }

      if (filters.difficulty) {
        if (filters.name || filters.category) {
          results = results.filter(
            (recipe) => recipe.difficulty === filters.difficulty
          );
        } else {
          results = await getRecipesByDifficulty(filters.difficulty);
        }
      }

      if (filters.maxDuration) {
        results = results.filter(
          (recipe) => recipe.totalDuration <= filters.maxDuration
        );
      }

      setDisplayedRecipes(results);
      setLoading(false);
    } catch (err) {
      setError("Παρουσιάστηκε σφάλμα κατά την αναζήτηση.");
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setDisplayedRecipes(allRecipes);
    setIsSearching(false);
    setError(null);
  };

  if (loading && !isSearching) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Φόρτωση συνταγών...</p>
      </div>
    );
  }

  if (error) {
    return <div className={classes.error}>{error}</div>;
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Οι Συνταγές Μου</h1>

      <RecipeSearch onSearch={handleSearch} onReset={handleResetSearch} />

      <div className={classes.resultsInfo}>
        {isSearching ? (
          <span className={classes.searchIndicator}>
            🔍 Αποτελέσματα αναζήτησης: <strong>{displayedRecipes.length}</strong> συνταγές
          </span>
        ) : (
          <span className={classes.totalCount}>
            📚 Σύνολο: <strong>{allRecipes.length}</strong> συνταγές
          </span>
        )}
      </div>

      {loading && isSearching && (
        <div className={classes.searchLoading}>
          <span>🔍 Γίνεται αναζήτηση...</span>
        </div>
      )}

      {displayedRecipes.length === 0 && !loading ? (
        <div className={classes.emptyResults}>
          <span className={classes.emptyIcon}>🍽️</span>
          {isSearching ? (
            <div>
              <p>Δεν βρέθηκαν συνταγές με αυτά τα κριτήρια.</p>
              <button 
                onClick={handleResetSearch}
                className={classes.clearFilterBtn}
              >
                Εκκαθάριση Φίλτρων
              </button>
            </div>
          ) : (
            <p>Δεν υπάρχουν συνταγές ακόμα. Δημιούργησε την πρώτη σου!</p>
          )}
        </div>
      ) : (
        <div className={classes.grid}>
          {displayedRecipes.map((recipe) => (
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