import React, { useState, useEffect } from "react";
import { MEASUREMENT_OPTIONS } from "../../utils/enums";
import { searchIngredients, createIngredient } from "../../api/ingredientApi";
import classes from "./IngredientSelector.module.css";

const IngredientSelector = ({ onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(MEASUREMENT_OPTIONS[0].value);

  // Track selected ingredient OR typed ingredient name
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        setIsCreatingNew(false);
        return;
      }
      try {
        const results = await searchIngredients(searchTerm);
        setSearchResults(results);
        setShowResults(true);

        // Check if search term matches any existing ingredient exactly
        const exactMatch = results.find(
          (ing) => ing.name.toLowerCase() === searchTerm.toLowerCase()
        );
        setIsCreatingNew(!exactMatch);
      } catch (error) {
        console.error(error);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // Reset selection when user types
    setSelectedIngredient(null);
    setIsCreatingNew(false);
  };

  const handleSelectIngredient = (ingredient) => {
    setSearchTerm(ingredient.name);
    setSelectedIngredient(ingredient);
    setIsCreatingNew(false);
    setSearchResults([]);
    setShowResults(false);
  };

  const handleQuantityChange = (event) => setQuantity(event.target.value);
  const handleUnitChange = (event) => setUnit(event.target.value);

  const handleAddClick = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim() || !quantity) {
      alert("Παρακαλώ συμπληρώστε όνομα υλικού και ποσότητα.");
      return;
    }

    try {
      let ingredientToUse = selectedIngredient;

      // Create new ingredient if none selected
      if (!selectedIngredient) {
        console.log("Creating new ingredient:", searchTerm);
        const newIngredientDto = {
          name: searchTerm.trim(),
          description: `Αυτόματα δημιουργημένο υλικό: ${searchTerm.trim()}`,
        };

        ingredientToUse = await createIngredient(newIngredientDto);
        console.log("Created ingredient:", ingredientToUse);
      }

      // Prepare data for parent component
      const ingredientData = {
        ingredientId: ingredientToUse.id,
        name: ingredientToUse.name,
        quantity: parseFloat(quantity),
        measurementUnit: unit,
      };

      // Call parent function
      onAdd(ingredientData);

      // Reset form
      setSearchTerm("");
      setQuantity("");
      setSelectedIngredient(null);
      setIsCreatingNew(false);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("Σφάλμα κατά την προσθήκη του υλικού: " + error.message);
    }
  };

  return (
    <div className={classes.container}>
      <label className={classes.label}>Προσθήκη Υλικών</label>
      <div className={classes.row}>
        <div className={`${classes.inputGroup} ${classes.flexGrow}`}>
          <input
            type="text"
            placeholder="Αναζήτηση ή δημιουργία νέου υλικού..."
            className={classes.input}
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          />

          {/* Show search results */}
          {showResults && searchResults.length > 0 && (
            <ul className={classes.searchResultsList}>
              {searchResults.map((ing) => (
                <li
                  key={ing.id}
                  className={classes.searchResultItem}
                  onMouseDown={() => handleSelectIngredient(ing)}
                >
                  {ing.name}
                </li>
              ))}
            </ul>
          )}

          {/* Show "create new" indicator */}
          {isCreatingNew && searchTerm.length >= 2 && showResults && (
            <div className={classes.createNewIndicator}>
              💡 Θα δημιουργηθεί νέο υλικό: "{searchTerm}"
            </div>
          )}
        </div>

        <div className={`${classes.inputGroup} ${classes.flexShrink}`}>
          <input
            type="number"
            placeholder="Ποσότητα"
            className={classes.input}
            value={quantity}
            onChange={handleQuantityChange}
            min="0"
            step="0.1"
          />
        </div>

        <div className={`${classes.inputGroup} ${classes.flexShrink}`}>
          <select
            className={classes.select}
            value={unit}
            onChange={handleUnitChange}
          >
            {MEASUREMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className={classes.addButton}
          onClick={handleAddClick}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default IngredientSelector;
