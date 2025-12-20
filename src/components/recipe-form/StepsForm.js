import React, { useState } from 'react';
import classes from './StepsForm.module.css';

const StepsForm = ({ steps, onAddStep, availableIngredients, onRemoveStep }) => {
    
    // State για το νέο βήμα που πληκτρολογεί ο χρήστης
    const [newStep, setNewStep] = useState({
        title: "",
        description: "",
        duration: 5, 
        ingredientIds: [] 
    });

    // --- HANDLERS (Λογική εκτός JSX) ---

    // 1. Διαχείριση Inputs (Title, Description, Duration)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStep(prev => ({ ...prev, [name]: value }));
    };

    // 2. Διαχείριση Checkboxes (Toggle Logic)
    // Χρησιμοποιούμε μια συνάρτηση που επιστρέφει συνάρτηση (Currying)
    // για να αποφύγουμε την ανώνυμη arrow function στο JSX
    const createCheckboxHandler = (ingredientId) => () => {
        setNewStep(prevState => {
            const currentIds = prevState.ingredientIds;
            if (currentIds.includes(ingredientId)) {
                // Αφαίρεση (Uncheck)
                return { ...prevState, ingredientIds: currentIds.filter(id => id !== ingredientId) };
            } else {
                // Προσθήκη (Check)
                return { ...prevState, ingredientIds: [...currentIds, ingredientId] };
            }
        });
    };

    // 3. Διαχείριση Προσθήκης Βήματος
    const handleAddClick = () => {
        // Validation
        if (!newStep.description.trim()) {
            alert("Η περιγραφή είναι υποχρεωτική");
            return;
        }

        // Αυτόματος τίτλος αν λείπει
        const titleToUse = newStep.title.trim() === "" 
            ? `Βήμα ${steps.length + 1}` 
            : newStep.title;

        // Κλήση στον γονιό
        onAddStep({
            ...newStep,
            title: titleToUse,
            stepOrder: steps.length + 1,
            // Mapping για το backend DTO
            stepIngredients: newStep.ingredientIds.map(id => ({ ingredientId: id }))
        });

        // Reset φόρμας
        setNewStep({ title: "", description: "", duration: 5, ingredientIds: [] });
    };

    // 4. Διαχείριση Διαγραφής (Currying pattern)
    // Επιστρέφει τον handler για το συγκεκριμένο index
    const createRemoveHandler = (index) => () => {
        if (onRemoveStep) {
            onRemoveStep(index);
        }
    };

    return (
        <div className={classes.container}>
            <h3 className={classes.titleHeader}>Εκτέλεση (Βήματα)</h3>

            {/* --- FORM SECTION --- */}
            <div className={classes.formContainer}>
                
                {/* Row 1: Title & Duration */}
                <div className={classes.row}>
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Τίτλος (π.χ. Προετοιμασία)" 
                        className={`${classes.input} ${classes.inputTitle}`} 
                        value={newStep.title} 
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="number" 
                        name="duration" 
                        placeholder="Λεπτά" 
                        min="1"
                        className={`${classes.input} ${classes.inputDuration}`}
                        value={newStep.duration} 
                        onChange={handleInputChange} 
                    />
                </div>
                
                {/* Row 2: Description */}
                <textarea 
                    name="description" 
                    className={classes.textarea} 
                    placeholder="Περιγραφή βήματος (υποχρεωτικό)..."
                    value={newStep.description} 
                    onChange={handleInputChange} 
                />

                {/* Row 3: Ingredients Selection */}
                {availableIngredients.length > 0 && (
                    <div className={classes.ingredientsSection}>
                        <label className={classes.ingredientsLabel}>
                            Υλικά βήματος:
                        </label>
                        <div className={classes.checkboxList}>
                            {availableIngredients.map(ing => (
                                <label key={ing.ingredientId || ing.id} className={classes.checkboxLabel}>
                                    <input 
                                        type="checkbox" 
                                        className={classes.checkboxInput}
                                        checked={newStep.ingredientIds.includes(ing.ingredientId || ing.id)}
                                        // Κλήση του "Έξυπνου" handler
                                        onChange={createCheckboxHandler(ing.ingredientId || ing.id)}
                                    />
                                    {ing.name}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    type="button" 
                    className={classes.addButton} 
                    onClick={handleAddClick}
                >
                    Προσθήκη Βήματος
                </button>
            </div>

            {/* --- LIST SECTION --- */}
            <div className={classes.stepsList}>
                {steps.map((step, index) => (
                    <div key={index} className={classes.stepItem}>
                        <div className={classes.stepHeader}>
                            <span className={classes.stepTitleText}>
                                {step.stepOrder}. {step.title}
                            </span>
                            
                            <div className={classes.stepActions}>
                                <span className={classes.durationBadge}>
                                    ⏱ {step.duration} λεπτά
                                </span>
                                
                                {/* Κουμπί Διαγραφής (μόνο στο Edit Mode) */}
                                {onRemoveStep && (
                                    <button 
                                        type="button" 
                                        className={classes.removeButton}
                                        onClick={createRemoveHandler(index)}
                                        title="Διαγραφή βήματος"
                                    >
                                        ✖
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className={classes.stepDesc}>
                            {step.description}
                        </div>
                        
                        {step.stepIngredients && step.stepIngredients.length > 0 && (
                            <div className={classes.stepIngredients}>
                                🛒 {step.stepIngredients.length} Υλικά
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepsForm;