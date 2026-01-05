import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  XCircle, 
  Clock, 
  Utensils, 
  Gauge, 
  RotateCcw 
} from "lucide-react";
import classes from "./RecipeSearch.module.css";

const RecipeSearch = ({ onSearch, onReset }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  const handleSearch = useCallback(() => {
    const filters = {
      name: searchTerm.trim(),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      maxDuration: maxDuration ? parseInt(maxDuration) : null,
    };
    onSearch(filters);
  }, [searchTerm, selectedCategory, selectedDifficulty, maxDuration, onSearch]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [handleSearch]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setMaxDuration("");
    onReset();
  };

  // --- Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");
  const handleDurationChange = (e) => setMaxDuration(e.target.value);
  
  // Wrapper handlers for category/difficulty buttons
  const createCategoryHandler = (id) => () => setSelectedCategory(id);
  const createDifficultyHandler = (id) => () => setSelectedDifficulty(id);

  const categories = [
    { id: "APPETIZER", label: "Ορεκτικό" },
    { id: "MAIN_COURSE", label: "Κυρίως" },
    { id: "SALAD", label: "Σαλάτα" },
    { id: "DESSERT", label: "Γλυκό" },
  ];

  const difficulties = [
    { id: "EASY", label: "Εύκολο", class: classes.activeEasy },
    { id: "MEDIUM", label: "Μέτριο", class: classes.activeMedium },
    { id: "HARD", label: "Δύσκολο", class: classes.activeHard },
  ];

  return (
    <div className={classes.searchContainer}>
      
      {/* 1. SEARCH INPUT */}
      <div className={classes.searchWrapper}>
        <Search size={20} className={classes.searchIcon} />
        <input
          type="text"
          className={classes.searchInput}
          placeholder="Αναζήτηση με όνομα ή υλικό..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <XCircle 
            size={18} 
            className={classes.clearIcon} 
            onClick={handleClearSearch}
          />
        )}
      </div>

      <div className={classes.filtersSection}>
        
        {/* 2. CATEGORY BUTTONS */}
        <div className={classes.filterRow}>
          <span className={classes.rowLabel}><Utensils size={16}/> Κατηγορία:</span>
          <button
            className={`${classes.filterBtn} ${selectedCategory === "" ? classes.activeFilter : ""}`}
            onClick={createCategoryHandler("")}
          >
            Όλα
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${classes.filterBtn} ${selectedCategory === cat.id ? classes.activeFilter : ""}`}
              onClick={createCategoryHandler(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 3. DIFFICULTY BUTTONS */}
        <div className={classes.filterRow}>
          <span className={classes.rowLabel}><Gauge size={16}/> Δυσκολία:</span>
          <button
            className={`${classes.filterBtn} ${selectedDifficulty === "" ? classes.activeFilter : ""}`}
            onClick={createDifficultyHandler("")}
          >
            Όλες
          </button>
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              className={`${classes.filterBtn} ${selectedDifficulty === diff.id ? diff.class : ""}`}
              onClick={createDifficultyHandler(diff.id)}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* 4. DURATION & RESET */}
        {/* Αντικατάσταση inline styles */}
        <div className={classes.durationRow}>
          <div className={classes.durationContainer}>
            <span className={classes.rowLabel}><Clock size={16}/> Χρόνος (max):</span>
            <div className={classes.durationWrapper}>
              <input 
                type="number" 
                className={classes.durationInput}
                placeholder="-"
                min="0"
                value={maxDuration}
                onChange={handleDurationChange}
              />
              <span className={classes.minuteLabel}>λεπτά</span>
            </div>
          </div>

          <button className={classes.resetBtn} onClick={handleReset}>
            <RotateCcw size={14} /> Καθαρισμός
          </button>
        </div>

      </div>
    </div>
  );
};

export default RecipeSearch;