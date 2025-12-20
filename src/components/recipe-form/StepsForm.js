import React, { useState } from "react";
import { MEASUREMENT_OPTIONS } from "../../utils/enums";
import classes from "./StepsForm.module.css";

const StepsForm = ({
  steps,
  onAddStep,
  availableIngredients,
  onRemoveStep,
}) => {
  // Enhanced state to track step ingredients with quantities and units
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    duration: 5,
    stepIngredients: [], // Changed from ingredientIds to full objects
  });

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStep((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: Add ingredient with quantity and unit
  const handleAddStepIngredient = (ingredient) => {
    const ingredientId = ingredient.ingredientId || ingredient.id;

    // Check if ingredient already added
    const exists = newStep.stepIngredients.find(
      (si) => si.ingredientId === ingredientId
    );
    if (exists) {
      alert("Το υλικό έχει ήδη προστεθεί σε αυτό το βήμα");
      return;
    }

    const newStepIngredient = {
      ingredientId: ingredientId,
      name: ingredient.name,
      quantity: 1.0, // Default quantity
      measurementUnit: MEASUREMENT_OPTIONS[0].value, // Default unit
    };

    setNewStep((prev) => ({
      ...prev,
      stepIngredients: [...prev.stepIngredients, newStepIngredient],
    }));
  };

  // NEW: Remove step ingredient
  const handleRemoveStepIngredient = (ingredientId) => {
    setNewStep((prev) => ({
      ...prev,
      stepIngredients: prev.stepIngredients.filter(
        (si) => si.ingredientId !== ingredientId
      ),
    }));
  };

  // NEW: Update step ingredient quantity
  const handleStepIngredientQuantityChange = (ingredientId, quantity) => {
    setNewStep((prev) => ({
      ...prev,
      stepIngredients: prev.stepIngredients.map((si) =>
        si.ingredientId === ingredientId
          ? { ...si, quantity: parseFloat(quantity) || 0 }
          : si
      ),
    }));
  };

  // NEW: Update step ingredient measurement unit
  const handleStepIngredientUnitChange = (ingredientId, unit) => {
    setNewStep((prev) => ({
      ...prev,
      stepIngredients: prev.stepIngredients.map((si) =>
        si.ingredientId === ingredientId ? { ...si, measurementUnit: unit } : si
      ),
    }));
  };

  const handleAddClick = () => {
    // Validation
    if (!newStep.description.trim()) {
      alert("Η περιγραφή είναι υποχρεωτική");
      return;
    }

    // Validate step ingredients have positive quantities
    const invalidIngredients = newStep.stepIngredients.filter(
      (si) => si.quantity <= 0
    );
    if (invalidIngredients.length > 0) {
      alert("Όλα τα υλικά πρέπει να έχουν ποσότητα μεγαλύτερη από 0");
      return;
    }

    // Auto title if missing
    const titleToUse =
      newStep.title.trim() === "" ? `Βήμα ${steps.length + 1}` : newStep.title;

    // Call parent with enhanced step data
    onAddStep({
      ...newStep,
      title: titleToUse,
      stepOrder: steps.length + 1,
      // Keep stepIngredients as is - now includes quantity and measurementUnit
      stepIngredients: newStep.stepIngredients,
    });

    // Reset form
    setNewStep({
      title: "",
      description: "",
      duration: 5,
      stepIngredients: [],
    });
  };

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

        {/* ENHANCED: Step Ingredients with Quantities */}
        {availableIngredients.length > 0 && (
          <div className={classes.stepIngredientsSection}>
            <label className={classes.stepIngredientsLabel}>
              Υλικά βήματος με ποσότητες:
            </label>

            {/* Available ingredients to add */}
            <div className={classes.availableIngredientsGrid}>
              {availableIngredients
                .filter(
                  (ing) =>
                    !newStep.stepIngredients.find(
                      (si) => si.ingredientId === (ing.ingredientId || ing.id)
                    )
                )
                .map((ing) => (
                  <button
                    key={ing.ingredientId || ing.id}
                    type="button"
                    className={classes.addIngredientBtn}
                    onClick={() => handleAddStepIngredient(ing)}
                  >
                    + {ing.name}
                  </button>
                ))}
            </div>

            {/* Selected step ingredients with quantity controls */}
            {newStep.stepIngredients.length > 0 && (
              <div className={classes.selectedStepIngredients}>
                <h4 className={classes.selectedIngredientsTitle}>
                  Επιλεγμένα υλικά:
                </h4>

                {newStep.stepIngredients.map((stepIng) => (
                  <div
                    key={stepIng.ingredientId}
                    className={classes.stepIngredientRow}
                  >
                    <span className={classes.ingredientName}>
                      {stepIng.name}
                    </span>

                    <input
                      type="number"
                      className={classes.quantityInput}
                      placeholder="Ποσότητα"
                      value={stepIng.quantity}
                      onChange={(e) =>
                        handleStepIngredientQuantityChange(
                          stepIng.ingredientId,
                          e.target.value
                        )
                      }
                      min="0.01"
                      step="0.1"
                    />

                    <select
                      className={classes.unitSelect}
                      value={stepIng.measurementUnit}
                      onChange={(e) =>
                        handleStepIngredientUnitChange(
                          stepIng.ingredientId,
                          e.target.value
                        )
                      }
                    >
                      {MEASUREMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className={classes.removeStepIngredientBtn}
                      onClick={() =>
                        handleRemoveStepIngredient(stepIng.ingredientId)
                      }
                      title="Αφαίρεση υλικού"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
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

      {/* --- STEPS PREVIEW LIST --- */}
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

            <div className={classes.stepDesc}>{step.description}</div>

            {/* Show step ingredients with quantities */}
            {step.stepIngredients && step.stepIngredients.length > 0 && (
              <div className={classes.stepIngredientsPreview}>
                <strong>Υλικά:</strong>
                <ul className={classes.stepIngredientsList}>
                  {step.stepIngredients.map((ing, idx) => (
                    <li key={idx} className={classes.stepIngredientItem}>
                      {ing.name}: {ing.quantity}{" "}
                      {MEASUREMENT_OPTIONS.find(
                        (opt) => opt.value === ing.measurementUnit
                      )?.label || ing.measurementUnit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsForm;
