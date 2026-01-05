import React, { useState, useEffect } from "react";
import { updateStep, createStep, deleteStep } from "../../api/stepApi";
import { uploadPhotoForStep, deletePhoto, getPhotoImageUrl } from "../../api/PhotoApi";
import { 
  ListOrdered, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Clock, 
  Camera,
  ShoppingCart,
  Box
} from "lucide-react";
import classes from "./EditRecipeSteps.module.css";
import { useConfirm } from "../../components/UI/ConfirmProvider";

import IngredientSelector from "../../components/recipe-form/IngredientSelector";

const MEASUREMENT_UNITS = [
  { value: "GRAMS", label: "g" },
  { value: "KILOGRAMS", label: "kg" },
  { value: "MILLILITERS", label: "ml" },
  { value: "LITERS", label: "L" },
  { value: "CUPS", label: "φλιτζ." },
  { value: "TABLESPOONS", label: "κ.σ." },
  { value: "TEASPOONS", label: "κ.γ." },
  { value: "PIECES", label: "τεμ." },
  { value: "SLICES", label: "φέτες" },
  { value: "PINCH", label: "πρέζα" }
];

const EditRecipeSteps = ({ recipeId, steps, recipeIngredients, onRefresh, showMessage }) => {
  const [editingStepId, setEditingStepId] = useState(null);
  const [localSteps, setLocalSteps] = useState(steps);
  
  const confirmDialog = useConfirm();

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
      showMessage("Νέο βήμα δημιουργήθηκε!");
    } catch (error) {
      showMessage("Σφάλμα δημιουργίας βήματος.", "error");
    }
  };

  // Handlers for inputs
  const handleTitleChange = (id) => (e) => {
    const val = e.target.value;
    setLocalSteps(prev => prev.map(s => s.id === id ? { ...s, title: val } : s));
  };

  const handleDurationChange = (id) => (e) => {
    const val = e.target.value;
    setLocalSteps(prev => prev.map(s => s.id === id ? { ...s, duration: val } : s));
  };

  const handleDescChange = (id) => (e) => {
    const val = e.target.value;
    setLocalSteps(prev => prev.map(s => s.id === id ? { ...s, description: val } : s));
  };

  const onDeleteStep = async (e, stepId) => {
    e.stopPropagation();
    const ok = await confirmDialog({
      title: "Διαγραφή βήματος",
      message: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το βήμα;",
      confirmText: "Ναι, διαγραφή",
      cancelText: "Ακύρωση",
    });

    if (!ok) return;

    try {
      await deleteStep(stepId);
      onRefresh();
      showMessage("Το βήμα διαγράφηκε.");
    } catch (error) {
      showMessage("Σφάλμα διαγραφής.", "error");
    }
  };

  const onAddIngredientToStep = (stepId, ingredientData) => {
    if (!ingredientData) return;
    setLocalSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          stepIngredients: [...(step.stepIngredients || []), ingredientData]
        };
      }
      return step;
    }));
  };

  // --- ΤΡΟΠΟΠΟΙΗΣΗ ΕΔΩ ΓΙΑ CONFIRMATION ---
  const createRemoveIngredientHandler = (stepId, index) => async () => {
    const isConfirmed = await confirmDialog({
        title: "Αφαίρεση Υλικού",
        message: "Αφαίρεση υλικού από το βήμα;",
        confirmText: "Ναι, αφαίρεση",
        cancelText: "Ακύρωση"
    });

    if (!isConfirmed) return;

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
  // ----------------------------------------

  const onSaveStep = async (step) => {
    try {
      const cleanStepIngredients = (step.stepIngredients || []).map(ing => {
        const finalIngredientId = ing.ingredientId || (ing.ingredient ? ing.ingredient.id : null);
        if (!finalIngredientId) {
            console.warn("Υλικό χωρίς ID αγνοήθηκε:", ing);
            return null;
        }
        return {
          stepId: parseInt(step.id),
          ingredientId: parseInt(finalIngredientId),
          quantity: parseFloat(ing.quantity),
          measurementUnit: ing.measurementUnit,
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

      showMessage(`Το Βήμα "${step.title}" ενημερώθηκε!`);
      setEditingStepId(null);
      setTimeout(() => onRefresh(), 200);
    } catch (error) {
      console.error(error);
      showMessage("Σφάλμα αποθήκευσης βήματος.", "error");
    }
  };

  const onPhotoUpload = async (e, stepId) => {
    const files = e.target.files;
    if (!files) return;
    try {
      for (const file of files) {
        await uploadPhotoForStep(stepId, file, "Step preview");
      }
      onRefresh();
      showMessage("Η φωτογραφία ανέβηκε!");
    } catch (error) {
      showMessage("Σφάλμα ανεβάσματος.", "error");
    }
  };

  const createPhotoDeleteHandler = (photoId) => async () => {
    const ok = await confirmDialog({
      title: "Διαγραφή φωτογραφίας",
      message: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη φωτογραφία;",
      confirmText: "Ναι, διαγραφή",
      cancelText: "Ακύρωση",
    });

    if (!ok) return;

    try {
      await deletePhoto(photoId);
      onRefresh();
      showMessage("Η φωτογραφία διαγράφηκε.");
    } catch (error) {
      showMessage("Σφάλμα διαγραφής.", "error");
    }
  };

  // Wrappers
  const createPhotoUploadHandler = (stepId) => (e) => onPhotoUpload(e, stepId);
  const createToggleEditHandler = (id) => () => onToggleEdit(id);
  const createDeleteStepHandler = (id) => (e) => onDeleteStep(e, id);
  const createSaveStepHandler = (step) => () => onSaveStep(step);
  const createCancelEditHandler = () => setEditingStepId(null);

  // --- RENDER HELPERS ---

  const renderIngredientItem = (ing, idx, stepId) => (
    <li key={idx} className={classes.ingItem}>
        <span>
            <strong>{ing.name}</strong> - {ing.quantity} {getUnitLabel(ing.measurementUnit)}
        </span>
        <button 
            type="button" 
            className={classes.btnDangerSmall} 
            onClick={createRemoveIngredientHandler(stepId, idx)}
        >
            <X size={14}/>
        </button>
    </li>
  );

  const renderPhotoItem = (p) => (
    <div key={p.id} className={classes.photoWrapper}>
        <img 
            src={getPhotoImageUrl(p.id)} 
            className={classes.viewPhotoImg} 
            alt="Step preview" 
            onError={(e) => { e.target.style.display = 'none'; }} 
        />
        <button 
            className={classes.photoDeleteBtn} 
            onClick={createPhotoDeleteHandler(p.id)} 
            type="button"
        >
            <X size={12}/>
        </button>
    </div>
  );

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}><ListOrdered size={24}/> Βήματα Εκτέλεσης</h3>
        <button type="button" className={classes.btnSuccess} onClick={onAddNewStep}>
          <Plus size={18}/> Προσθήκη Βήματος
        </button>
      </div>

      {localSteps.map((step) => (
        <div key={step.id} className={`${classes.stepContainer} ${editingStepId === step.id ? classes.activeEdit : ''}`}>
          
          {/* Header Display */}
          <div className={classes.stepHeaderDisplay} onClick={createToggleEditHandler(step.id)}>
            <div className={classes.stepHeaderInfo}>
               <span className={classes.stepNumberBadge}>{step.stepOrder}</span>
               <span className={classes.stepTitleText}>{step.title}</span>
               <span className={classes.durationBadge}><Clock size={12}/> {step.duration}'</span>
            </div>
            
            <div className={classes.actions}>
              <span className={classes.iconBtn}>
                {editingStepId === step.id ? <Edit2 size={18} color="#fbbf24"/> : <Edit2 size={18} color="#94a3b8"/>}
              </span>
              <button 
                className={classes.btnDangerIcon} 
                onClick={createDeleteStepHandler(step.id)}
                type="button"
                title="Διαγραφή Βήματος"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* VIEW MODE */}
          {editingStepId !== step.id && (
            <div className={classes.viewContainer}>
              <p className={classes.viewDesc}>{step.description || "Χωρίς περιγραφή"}</p>
              
              {step.stepIngredients && step.stepIngredients.length > 0 && (
                <div className={classes.tagList}>
                  {step.stepIngredients.map((ing, i) => (
                    <span key={i} className={classes.ingTag}>
                      <ShoppingCart size={14}/> {ing.name} ({ing.quantity} {getUnitLabel(ing.measurementUnit)})
                    </span>
                  ))}
                </div>
              )}

              {step.photos && step.photos.length > 0 && (
                <div className={classes.viewPhotos}>
                  {step.photos.map((p) => (
                    <img 
                      key={p.id} 
                      src={getPhotoImageUrl(p.id)} 
                      className={classes.viewPhotoImg} 
                      alt="Step preview" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDIT MODE */}
          {editingStepId === step.id && (
            <div className={classes.editForm}>
              <div className={classes.row}>
                <div className={classes.inputGroupLarge}>
                  <label className={classes.label}>Τίτλος</label>
                  <input className={classes.input} value={step.title} onChange={handleTitleChange(step.id)} />
                </div>
                <div className={classes.inputGroupSmall}>
                  <label className={classes.label}>Διάρκεια (λ.)</label>
                  <input type="number" className={classes.input} value={step.duration} onChange={handleDurationChange(step.id)} />
                </div>
              </div>

              <div className={classes.inputGroup}>
                <label className={classes.label}>Περιγραφή</label>
                <textarea className={classes.textarea} value={step.description} onChange={handleDescChange(step.id)} />
              </div>

              {/* Ingredients Section */}
              <div className={classes.ingredientsBox}>
                <label className={classes.label}><Box size={16}/> Υλικά Βήματος</label>
                
                <div className={classes.selectorWrapper}>
                    <IngredientSelector 
                        onAdd={(ingredientData) => onAddIngredientToStep(step.id, ingredientData)} 
                    />
                </div>

                <ul className={classes.ingList}>
                  {(step.stepIngredients || []).map((ing, idx) => renderIngredientItem(ing, idx, step.id))}
                </ul>
              </div>

              {/* Photos */}
              <div className={classes.photoEditSection}>
                <label className={classes.label}><Camera size={16}/> Φωτογραφίες</label>
                <div className={classes.photoGrid}>
                  {(step.photos || []).map(renderPhotoItem)}
                </div>
                <input 
                    type="file" 
                    className={classes.fileInput} 
                    onChange={createPhotoUploadHandler(step.id)} 
                />
              </div>

              <div className={classes.buttonsRow}>
                <button type="button" className={classes.btnSuccess} onClick={createSaveStepHandler(step)}>
                  <Save size={18}/> Αποθήκευση
                </button>
                <button type="button" className={classes.btnSecondary} onClick={createCancelEditHandler}>
                  <X size={18}/> Κλείσιμο
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