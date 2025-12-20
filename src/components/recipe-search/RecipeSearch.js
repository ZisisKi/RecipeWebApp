import React, { useState, useEffect } from "react";
import classes from "./RecipeSearch.module.css";

const RecipeSearch = ({ onSearch, onReset }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedDifficulty, maxDuration]);

  const handleSearch = () => {
    const filters = {
      name: searchTerm.trim(),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      maxDuration: maxDuration ? parseInt(maxDuration) : null,
    };

    onSearch(filters);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setMaxDuration("");
    onReset();
  };

  return (
    <div className={classes.searchContainer}>
      <div className={classes.searchHeader}>
        <h3 className={classes.searchTitle}>🔍 Αναζήτηση Συνταγών</h3>
        <button
          className={classes.resetButton}
          onClick={handleReset}
          title="Καθαρισμός φίλτρων"
        >
          🔄 Καθαρισμός
        </button>
      </div>

      <div className={classes.filtersGrid}>
        {/* Text Search */}
        <div className={classes.filterGroup}>
          <label className={classes.filterLabel}>Όνομα Συνταγής:</label>
          <input
            type="text"
            className={classes.searchInput}
            placeholder="π.χ. Σπαγγέτι..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className={classes.filterGroup}>
          <label className={classes.filterLabel}>Κατηγορία:</label>
          <select
            className={classes.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Όλες</option>
            <option value="APPETIZER">Ορεκτικό</option>
            <option value="MAIN_COURSE">Κυρίως Πιάτο</option>
            <option value="DESSERT">Επιδόρπιο</option>
            <option value="SALAD">Σαλάτα</option>
            <option value="SNACK">Σνακ</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className={classes.filterGroup}>
          <label className={classes.filterLabel}>Δυσκολία:</label>
          <select
            className={classes.filterSelect}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">Όλες</option>
            <option value="EASY">Εύκολο</option>
            <option value="MEDIUM">Μέτριο</option>
            <option value="HARD">Δύσκολο</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div className={classes.filterGroup}>
          <label className={classes.filterLabel}>
            Μέγιστος Χρόνος (λεπτά):
          </label>
          <input
            type="number"
            className={classes.durationInput}
            placeholder="π.χ. 30"
            min="1"
            max="1440"
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm ||
        selectedCategory ||
        selectedDifficulty ||
        maxDuration) && (
        <div className={classes.activeFilters}>
          <span className={classes.filtersLabel}>Ενεργά φίλτρα:</span>
          {searchTerm && (
            <span className={classes.filterTag}>📝 "{searchTerm}"</span>
          )}
          {selectedCategory && (
            <span className={classes.filterTag}>
              📂 {getCategoryDisplayName(selectedCategory)}
            </span>
          )}
          {selectedDifficulty && (
            <span className={classes.filterTag}>
              📊 {getDifficultyDisplayName(selectedDifficulty)}
            </span>
          )}
          {maxDuration && (
            <span className={classes.filterTag}>⏱ ≤{maxDuration} λεπτά</span>
          )}
        </div>
      )}
    </div>
  );
};

const getCategoryDisplayName = (category) => {
  const categories = {
    APPETIZER: "Ορεκτικό",
    MAIN_COURSE: "Κυρίως Πιάτο",
    DESSERT: "Επιδόρπιο",
    SALAD: "Σαλάτα",
    SNACK: "Σνακ",
  };
  return categories[category] || category;
};

const getDifficultyDisplayName = (difficulty) => {
  const difficulties = {
    EASY: "Εύκολο",
    MEDIUM: "Μέτριο",
    HARD: "Δύσκολο",
  };
  return difficulties[difficulty] || difficulty;
};

export default RecipeSearch;
