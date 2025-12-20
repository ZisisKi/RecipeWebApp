import React, { useState, useEffect } from 'react';
import { MEASUREMENT_OPTIONS } from '../../utils/enums';
import { searchIngredients } from '../../api/ingredientApi';
import classes from './IngredientSelector.module.css';

// 1. ΑΛΛΑΓΗ: ΔΕΧΟΜΑΣΤΕ ΤΟ PROP { onAdd }
const IngredientSelector = ({ onAdd }) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState(MEASUREMENT_OPTIONS[0].value);
    
    // 2. ΑΛΛΑΓΗ: Κρατάμε ολόκληρο το αντικείμενο του υλικού (με το ID του)
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const [searchResults, setSearchResults] = useState([]); 
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timerId = setTimeout(async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                setShowResults(false);
                return;
            }
            try {
                const results = await searchIngredients(searchTerm);
                setSearchResults(results);
                setShowResults(true);
            } catch (error) {
                console.error(error);
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Αν ο χρήστης γράψει κάτι νέο, ξεχνάμε το προηγούμενο selected ID
        setSelectedIngredient(null);
    };

    const handleSelectIngredient = (ingredient) => {
        setSearchTerm(ingredient.name);
        setSelectedIngredient(ingredient); // SOS: Αποθηκεύουμε το επιλεγμένο υλικό
        setSearchResults([]);
        setShowResults(false);
    };

    const handleQuantityChange = (event) => setQuantity(event.target.value);
    const handleUnitChange = (event) => setUnit(event.target.value);

    // 3. ΑΛΛΑΓΗ: Η ΣΤΙΓΜΗ ΤΗΣ ΑΠΟΣΤΟΛΗΣ
    const handleAddClick = (e) => {
        e.preventDefault(); // Για να μην κάνει submit τη φόρμα του γονιού

        // Έλεγχος: Έχουμε επιλέξει υλικό; Έχουμε βάλει ποσότητα;
        if (!selectedIngredient || !quantity) {
            alert("Παρακαλώ επιλέξτε υλικό από τη λίστα και συμπληρώστε ποσότητα.");
            return;
        }

        // Φτιάχνουμε το πακέτο για τον Γονιό
        const ingredientData = {
            ingredientId: selectedIngredient.id, // Αυτό θέλει η Java!
            name: selectedIngredient.name,       // Αυτό θέλουμε εμείς για να το δείξουμε στη λίστα
            quantity: parseFloat(quantity),      // Μετατροπή σε αριθμό
            measurementUnit: unit
        };

        // ΚΑΛΟΥΜΕ ΤΗ ΣΥΝΑΡΤΗΣΗ ΤΟΥ ΓΟΝΙΟΥ
        onAdd(ingredientData);

        // Καθαρίζουμε τα πεδία για το επόμενο υλικό
        setSearchTerm('');
        setQuantity('');
        setSelectedIngredient(null);
    };

    return (
        <div className={classes.container}>
            <label className={classes.label}>Προσθήκη Υλικών</label>
            <div className={classes.row}>
                <div className={`${classes.inputGroup} ${classes.flexGrow}`}>
                    <input 
                        type="text" placeholder="Αναζήτηση..." className={classes.input}
                        value={searchTerm} onChange={handleSearchChange}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                    />
                    {showResults && searchResults.length > 0 && (
                        <ul className={classes.searchResultsList}>
                            {searchResults.map((ing) => (
                                <li key={ing.id} className={classes.searchResultItem}
                                    onMouseDown={() => handleSelectIngredient(ing)}>
                                    {ing.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className={`${classes.inputGroup} ${classes.flexShrink}`}>
                    <input type="number" placeholder="Ποσότητα" className={classes.input}
                        value={quantity} onChange={handleQuantityChange} min="0" />
                </div>
                <div className={`${classes.inputGroup} ${classes.flexShrink}`}>
                    <select className={classes.select} value={unit} onChange={handleUnitChange}>
                        {MEASUREMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                
                {/* Το κουμπί καλεί το handleAddClick */}
                <button className={classes.addButton} onClick={handleAddClick}>+</button>
            </div>
        </div>
    );
};

export default IngredientSelector;