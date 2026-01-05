import React, { useState, useEffect } from "react";
import { Search, Plus, Scale, Tag } from "lucide-react";
import { MEASUREMENT_OPTIONS } from "../../utils/enums";
import { searchIngredients, createIngredient } from "../../api/ingredientApi";
import classes from "./IngredientSelector.module.css";
import { useToast } from "../UI/ToastProvider";

const IngredientSelector = ({ onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(MEASUREMENT_OPTIONS[0].value);

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const showToast = useToast();

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
    setSelectedIngredient(null);
    setIsCreatingNew(false);
  };

  const createSelectHandler = (ingredient) => () => {
    setSearchTerm(ingredient.name);
    setSelectedIngredient(ingredient);
    setIsCreatingNew(false);
    setSearchResults([]);
    setShowResults(false);
  };

  const handleAddClick = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !quantity) {
      showToast({
        type: "warning",
        title: "Λείπουν στοιχεία",
        message: "Παρακαλώ συμπληρώστε όνομα υλικού και ποσότητα.",
      });
      return;
    }
    try {
      let ingredientToUse = selectedIngredient;
      if (!selectedIngredient) {
        const newIngredientDto = {
          name: searchTerm.trim(),
          description: `Αυτόματα δημιουργημένο υλικό: ${searchTerm.trim()}`,
        };
        ingredientToUse = await createIngredient(newIngredientDto);
      }
      const ingredientData = {
        ingredientId: ingredientToUse.id,
        name: ingredientToUse.name,
        quantity: parseFloat(quantity),
        measurementUnit: unit,
      };
      onAdd(ingredientData);
      setSearchTerm("");
      setQuantity("");
      setSelectedIngredient(null);
      setIsCreatingNew(false);
    } catch (error) {
      showToast({
        type: "error",
        title: "Σφάλμα",
        message: error?.message ? `Σφάλμα: ${error.message}` : "Κάτι πήγε στραβά.",
      });
    }
  };

  // Handlers for Focus/Blur
  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) setShowResults(true);
  };

  const handleQuantityChange = (e) => setQuantity(e.target.value);
  const handleUnitChange = (e) => setUnit(e.target.value);

  return (
    <div className={classes.container}>
      {/* Search Input */}
      <div className={`${classes.inputGroup} ${classes.searchGroup}`}>
        <Search className={classes.inputIcon} size={18} />
        <input
          type="text"
          placeholder="Αναζήτηση ή νέο υλικό..."
          className={classes.inputWithIcon}
          value={searchTerm}
          onChange={handleSearchChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
        />
        
        {/* Dropdown Results */}
        {showResults && searchResults.length > 0 && (
          <ul className={classes.searchResultsList}>
            {searchResults.map((ing) => (
              <li
                key={ing.id}
                className={classes.searchResultItem}
                onMouseDown={createSelectHandler(ing)}
              >
                {ing.name}
              </li>
            ))}
          </ul>
        )}
        
        {/* Create New Indicator */}
        {isCreatingNew && searchTerm.length >= 2 && showResults && (
          <div className={classes.createNewIndicator}>
            <Plus size={14}/> Νέο: "{searchTerm}"
          </div>
        )}
      </div>

      {/* Quantity */}
      <div className={classes.inputGroup}>
         <div className={classes.iconWrapper}><Scale size={18}/></div>
         <input
           type="number"
           placeholder="Ποσότητα"
           className={classes.inputWithIcon}
           value={quantity}
           onChange={handleQuantityChange}
           min="0"
           step="0.1"
         />
      </div>

      {/* Unit */}
      <div className={classes.inputGroup}>
         <div className={classes.iconWrapper}><Tag size={18}/></div>
         <select
           className={classes.selectWithIcon}
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

      <button className={classes.addButton} onClick={handleAddClick} type="button" title="Προσθήκη">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default IngredientSelector;