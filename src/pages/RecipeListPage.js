import React, { useEffect, useState } from "react";
// 1. Lucide Icons
import { 
  Loader2, 
  Frown, 
  Coffee, 
  Search, 
  BookOpen 
} from "lucide-react";

import { getAllRecipes } from "../api/recipeApi";

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
        setError("Απέτυχε η φόρτωση των συνταγών.");
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleSearch = async (filters) => {
    if (!filters.name && !filters.category && !filters.difficulty && !filters.maxDuration) {
      setDisplayedRecipes(allRecipes);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      let results = allRecipes;

      // 1. Search by Name
      if (filters.name) {
        const lowerName = filters.name.toLowerCase();
        results = results.filter(r => 
          r.name.toLowerCase().includes(lowerName) || 
          (r.recipeIngredients && r.recipeIngredients.some(ing => 
             (ing.name || (ing.ingredient && ing.ingredient.name) || "").toLowerCase().includes(lowerName)
          ))
        );
      }

      // 2. Category
      if (filters.category) {
        results = results.filter(r => r.category === filters.category);
      }

      // 3. Difficulty
      if (filters.difficulty) {
        results = results.filter(r => r.difficulty === filters.difficulty);
      }

      // 4. Duration
      if (filters.maxDuration) {
        results = results.filter(r => r.totalDuration <= filters.maxDuration);
      }

      setDisplayedRecipes(results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSearch = () => {
    setDisplayedRecipes(allRecipes);
    setIsSearching(false);
  };

  if (loading && !isSearching) {
    return (
      <div className={classes.centerMessage}>
        <Loader2 size={48} className={classes.spinner} />
        <p>Φόρτωση βιβλίου συνταγών...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.centerMessage}>
        <Frown size={48} className={classes.errorIcon} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.pageTitle}>Οι Συνταγές Μου</h1>

      {/* Search Component */}
      <RecipeSearch onSearch={handleSearch} onReset={handleResetSearch} />

      {/* Info Bar */}
      <div className={classes.resultsInfo}>
        {isSearching ? (
           <span className={classes.infoText}>
             <Search size={18} /> Αποτελέσματα: <strong className={classes.goldText}>{displayedRecipes.length}</strong>
           </span>
        ) : (
           <span className={classes.infoText}>
             <BookOpen size={18} /> Σύνολο: <strong className={classes.goldText}>{allRecipes.length}</strong> συνταγές
           </span>
        )}
      </div>

      {/* Grid */}
      {displayedRecipes.length > 0 ? (
        <div className={classes.grid}>
          {displayedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={onRecipeClick}
            />
          ))}
        </div>
      ) : (
        <div className={`${classes.centerMessage} ${classes.emptyState}`}>
          {/* 2. No Inline Style: Η κλάση emptyIcon χειρίζεται το opacity */}
          <Coffee size={64} className={classes.emptyIcon} />
          <h3 className={classes.emptyText}>Δεν βρέθηκαν συνταγές</h3>
          <p>Δοκιμάστε να αλλάξετε τα φίλτρα.</p>
        </div>
      )}
    </div>
  );
};

export default RecipeListPage;