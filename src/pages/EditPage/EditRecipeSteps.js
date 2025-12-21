import React, { useState, useEffect } from "react";
import { updateStep, createStep, deleteStep } from "../../api/stepApi";
import { uploadPhotoForStep, deletePhoto } from "../../api/PhotoApi";
import styles from "./EditRecipeSteps.module.css";

const MEASUREMENT_UNITS = [
  { value: "GRAMS", label: "Γραμμάρια (g)" },
  { value: "KILOGRAMS", label: "Κιλά (kg)" },
  { value: "MILLILITERS", label: "ml" },
  { value: "LITERS", label: "Λίτρα (L)" },
  { value: "CUPS", label: "Φλιτζάνια" },
  { value: "TABLESPOONS", label: "Κουταλιές Σούπας" },
  { value: "TEASPOONS", label: "Κουταλάκια Γλυκού" },
  { value: "PIECES", label: "Τεμάχια" },
  { value: "SLICES", label: "Φέτες" },
  { value: "PINCH", label: "Πρέζα" }
];

const TO_BACKEND_UNIT_MAP = {
  "GRAMS": "γραμμάρια", "KILOGRAMS": "κιλά", "MILLILITERS": "ml", "LITERS": "λίτρα",
  "CUPS": "φλιτζάνια", "TABLESPOONS": "κουταλιές σούπας", "TEASPOONS": "κουταλάκια γλυκού",
  "PIECES": "κομμάτια", "SLICES": "φέτες", "PINCH": "πρέζα"
};

const EditRecipeSteps = ({ recipeId, steps, recipeIngredients, onRefresh, showMessage }) => {
  const [editingStepId, setEditingStepId] = useState(null);
  const [localSteps, setLocalSteps] = useState(steps);
  const [newStepIng, setNewStepIng] = useState({ ingredientId: "", name: "", quantity: "", measurementUnit: "GRAMS" });

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const getUnitLabel = (unitValue) => {
    const unit = MEASUREMENT_UNITS.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const onToggleEdit = (id) => {
    if (editingStepId === id) {
      setEditingStepId(null);
    } else {
      setEditingStepId(id);
      setNewStepIng({ ingredientId: "", name: "", quantity: "", measurementUnit: "GRAMS" });
    }
  };

  const onAddNewStep = async () => {
    try {
      const newOrder = localSteps.length + 1;
      await createStep({
        title: `Νέο Βήμα ${newOrder}`,
        description: "Περιγραφή...",
        duration: 5,
        stepOrder: newOrder,
        recipeId: parseInt(recipeId)
      });
      onRefresh();
      showMessage("✅ Νέο βήμα δημιουργήθηκε!");
    } catch (error) {
      showMessage("❌ Σφάλμα δημιουργίας βήματος.", "error");
    }
  };

  const onDeleteStep = async (e, stepId) => {
    e.stopPropagation();
    if (!window.confirm("Διαγραφή βήματος;")) return;
    try {
      await deleteStep(stepId);
      onRefresh();
      showMessage("🗑️ Το βήμα διαγράφηκε.");
    } catch (error) {
      showMessage("❌ Σφάλμα διαγραφής.", "error");
    }
  };

  // --- Form Handlers ---
  const handleTitleChange = (e, stepId) => {
    const val = e.target.value;
    setLocalSteps(prev => prev.map(s => s.id === stepId ? { ...s, title: val } : s));
  };

  const handleDurationChange = (e, stepId) => {
    const val = e.target.value;
    setLocalSteps(prev => prev.map(s => s.id === stepId ? { ...s, duration: val } : s));
  };

  const handleDescChange = (e, stepId) => {
    const val = e.target.value;
    setLocalSteps(prev => prev.map(s => s.id === stepId ? { ...s, description: val } : s));
  };

  // --- Ingredient Handlers within Step ---
  const onSelectIngredientChange = (e) => {
    const selected = recipeIngredients.find(i => (i.ingredientId || i.id).toString() === e.target.value);
    setNewStepIng({ ...newStepIng, ingredientId: e.target.value, name: selected ? selected.name : "" });
  };

  const onQuantityChange = (e) => setNewStepIng({ ...newStepIng, quantity: e.target.value });
  const onUnitChange = (e) => setNewStepIng({ ...newStepIng, measurementUnit: e.target.value });

  const onAddIngredientToStep = (stepId) => {
    if (!newStepIng.ingredientId || !newStepIng.quantity) return;
    setLocalSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          stepIngredients: [
            ...(step.stepIngredients || []),
            {
              ingredientId: newStepIng.ingredientId,
              name: newStepIng.name,
              quantity: parseFloat(newStepIng.quantity),
              measurementUnit: newStepIng.measurementUnit
            }
          ]
        };
      }
      return step;
    }));
    setNewStepIng({ ingredientId: "", name: "", quantity: "", measurementUnit: "GRAMS" });
  };

  const onRemoveIngredientFromStep = (stepId, index) => {
    setLocalSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          stepIngredients: step.stepIngredients.filter((_, i) => i !== index)
        };
      }
      return step;
    }));
  };

  const onSaveStep = async (step) => {
    try {
      const cleanStepIngredients = (step.stepIngredients || []).map(ing => {
        let finalIngredientId = ing.ingredientId || (ing.ingredient ? ing.ingredient.id : null);
        if (!finalIngredientId) return null;
        return {
          stepId: parseInt(step.id),
          ingredientId: parseInt(finalIngredientId),
          quantity: parseFloat(ing.quantity),
          measurementUnit: TO_BACKEND_UNIT_MAP[ing.measurementUnit] || ing.measurementUnit,
          name: ing.name,
          id: ing.id || null
        };
      }).filter(Boolean);

      await updateStep(step.id, {
        id: step.id,
        title: step.title,
        description: step.description,
        duration: parseInt(step.duration) || 1,
        stepOrder: parseInt(step.stepOrder),
        recipeId: parseInt(recipeId),
        stepIngredients: cleanStepIngredients,
        photos: step.photos || []
      });

      showMessage(`✅ Το Βήμα "${step.title}" ενημερώθηκε!`);
      setEditingStepId(null);
      setTimeout(() => onRefresh(), 200);
    } catch (error) {
      showMessage("❌ Σφάλμα αποθήκευσης βήματος.", "error");
    }
  };

  const onPhotoUpload = async (e, stepId) => {
    const files = e.target.files;
    if (!files) return;
    try {
      for (const file of files) {
        await uploadPhotoForStep(stepId, file, "Φωτογραφία βήματος");
      }
      onRefresh();
      showMessage("📷 Η φωτογραφία ανέβηκε!");
    } catch (error) {
      showMessage("❌ Σφάλμα ανεβάσματος.", "error");
    }
  };

  const onDeletePhoto = async (photoId) => {
    if (!window.confirm("Διαγραφή φωτογραφίας;")) return;
    try {
      await deletePhoto(photoId);
      onRefresh();
      showMessage("🗑️ Η φωτογραφία διαγράφηκε.");
    } catch (error) {
      showMessage("❌ Σφάλμα διαγραφής.", "error");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>👣 Βήματα Εκτέλεσης</h3>
        <button type="button" className={styles.btnSuccess} onClick={onAddNewStep}>
          + Προσθήκη Νέου Βήματος
        </button>
      </div>

      {localSteps.map((step) => (
        <div key={step.id} className={styles.stepContainer}>
          {/* Header Display */}
          <div className={styles.stepHeaderDisplay} onClick={() => onToggleEdit(step.id)}>
            <span className={styles.stepTitleText}>
              {step.stepOrder}. {step.title} ({step.duration} λεπτά)
            </span>
            <div className={styles.actions}>
              <span className={styles.iconBtn}>
                {editingStepId === step.id ? "🔼" : "✏️"}
              </span>
              <button 
                className={styles.btnDanger} 
                onClick={(e) => onDeleteStep(e, step.id)}
                type="button"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* VIEW MODE */}
          {editingStepId !== step.id && (
            <div className={styles.viewContainer}>
              <p className={styles.viewDesc}>{step.description || "Χωρίς περιγραφή"}</p>
              
              {step.stepIngredients && step.stepIngredients.length > 0 ? (
                <div style={{ marginBottom: '10px' }}>
                  <strong className={styles.viewIngTitle}>Υλικά: </strong>
                  <span className={styles.viewIngList}>
                    {step.stepIngredients.map((ing, i) => (
                      <span key={i}>
                        {ing.name || `Υλικό #${ing.ingredientId}`} ({ing.quantity} {getUnitLabel(ing.measurementUnit)})
                        {i < step.stepIngredients.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              ) : (
                <div className={styles.viewEmpty}>Κανένα υλικό στο βήμα.</div>
              )}

              {step.photos && step.photos.length > 0 && (
                <div className={styles.viewPhotos}>
                  {step.photos.map((p) => (
                    <img 
                      key={p.id} 
                      src={`http://localhost:8080/api/photos/image?id=${p.id}`} 
                      className={styles.viewPhotoImg} 
                      alt="step preview" 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDIT MODE */}
          {editingStepId === step.id && (
            <div className={styles.editForm}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Τίτλος</label>
                  <input 
                    className={styles.input} 
                    value={step.title} 
                    onChange={(e) => handleTitleChange(e, step.id)} 
                  />
                </div>
                <div className={styles.durationGroup}>
                  <label className={styles.label}>Διάρκεια</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={step.duration} 
                    onChange={(e) => handleDurationChange(e, step.id)} 
                  />
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label className={styles.label}>Περιγραφή</label>
                <textarea 
                  className={styles.textarea} 
                  value={step.description} 
                  onChange={(e) => handleDescChange(e, step.id)} 
                />
              </div>

              {/* Step Ingredients List */}
              <div className={styles.ingredientsBox}>
                <label className={styles.label}>💊 Υλικά Βήματος</label>
                <ul className={styles.ingList}>
                  {(step.stepIngredients || []).map((sing, idx) => (
                    <li key={idx} className={styles.ingItem}>
                      <span>
                        <strong>{sing.name}</strong> - {sing.quantity} {getUnitLabel(sing.measurementUnit)}
                      </span>
                      <button 
                        type="button" 
                        className={styles.btnDanger} 
                        onClick={() => onRemoveIngredientFromStep(step.id, idx)}
                      >
                        ✖
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={styles.addRow}>
                  <select className={`${styles.select} ${styles.flex2}`} value={newStepIng.ingredientId} onChange={onSelectIngredientChange}>
                    <option value="">Επιλογή Υλικού...</option>
                    {recipeIngredients.map((ri) => (
                      <option key={ri.ingredientId || ri.id} value={ri.ingredientId || ri.id}>
                        {ri.name}
                      </option>
                    ))}
                  </select>

                  <input 
                    type="number" 
                    placeholder="Ποσ." 
                    className={`${styles.input} ${styles.flex1}`} 
                    value={newStepIng.quantity} 
                    onChange={onQuantityChange} 
                  />

                  <select className={`${styles.select} ${styles.flex1}`} value={newStepIng.measurementUnit} onChange={onUnitChange}>
                    {MEASUREMENT_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>

                  <button type="button" className={styles.btnSuccess} onClick={() => onAddIngredientToStep(step.id)}>
                    +
                  </button>
                </div>
              </div>

              {/* Step Photos Edit */}
              <div style={{ marginBottom: '1rem' }}>
                <label className={styles.label}>📷 Φωτογραφίες Βήματος</label>
                <div className={styles.photoGrid}>
                  {(step.photos || []).map((p) => (
                    <div key={p.id} className={styles.photoWrapper}>
                      <img 
                        src={`http://localhost:8080/api/photos/image?id=${p.id}`} 
                        className={styles.viewPhotoImg} 
                        alt="step" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                      <button 
                        className={styles.photoDeleteBtn} 
                        onClick={() => onDeletePhoto(p.id)}
                        type="button"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <input 
                  type="file" 
                  className={styles.input} 
                  style={{ marginTop: '5px' }} 
                  onChange={(e) => onPhotoUpload(e, step.id)} 
                />
              </div>

              <div className={styles.buttonsRow}>
                <button type="button" className={styles.btnSuccess} onClick={() => onSaveStep(step)}>
                  💾 Αποθήκευση Βήματος
                </button>
                <button type="button" className={styles.btnSecondary} onClick={() => setEditingStepId(null)}>
                  Κλείσιμο
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditRecipeSteps;