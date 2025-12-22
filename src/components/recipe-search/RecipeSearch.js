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

  const categories = [
    { id: "APPETIZER", label: "Ορεκτικό" },
    { id: "MAIN_COURSE", label: "Κυρίως" },
    { id: "SALAD", label: "Σαλάτα" },
    { id: "DESSERT", label: "Γλυκό" },
    // { id: "SNACK", label: "Σνακ" }, // Αφαίρεσε το σχόλιο αν το έχεις
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <XCircle 
            size={18} 
            className={classes.clearIcon} 
            onClick={() => setSearchTerm("")}
          />
        )}
      </div>

      <div className={classes.filtersSection}>
        
        {/* 2. CATEGORY BUTTONS */}
        <div className={classes.filterRow}>
          <span className={classes.rowLabel}><Utensils size={16}/> Κατηγορία:</span>
          <button
            className={`${classes.filterBtn} ${selectedCategory === "" ? classes.activeFilter : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            Όλα
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${classes.filterBtn} ${selectedCategory === cat.id ? classes.activeFilter : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
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
            onClick={() => setSelectedDifficulty("")}
          >
            Όλες
          </button>
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              className={`${classes.filterBtn} ${selectedDifficulty === diff.id ? diff.class : ""}`}
              onClick={() => setSelectedDifficulty(diff.id)}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* 4. DURATION & RESET */}
        <div className={classes.filterRow} style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={classes.rowLabel}><Clock size={16}/> Χρόνος (max):</span>
            <div className={classes.durationWrapper}>
              <input 
                type="number" 
                className={classes.durationInput}
                placeholder="-"
                min="0"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>λεπτά</span>
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