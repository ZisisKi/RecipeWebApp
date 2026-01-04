import React, { useState, useEffect } from "react";
import { updateStep, createStep, deleteStep } from "../../api/stepApi";
import {
  uploadPhotoForStep,
  deletePhoto,
  getPhotoImageUrl,
} from "../../api/PhotoApi";
import {
  ListOrdered,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
  Camera,
} from "lucide-react";
import classes from "./EditRecipeSteps.module.css";
import { useConfirm } from "../../components/UI/ConfirmProvider";

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
  { value: "PINCH", label: "πρέζα" },
];

const TO_BACKEND_UNIT_MAP = {
  GRAMS: "γραμμάρια",
  KILOGRAMS: "κιλά",
  MILLILITERS: "ml",
  LITERS: "λίτρα",
  CUPS: "φλιτζάνια",
  TABLESPOONS: "κουταλιές σούπας",
  TEASPOONS: "κουταλάκια γλυκού",
  PIECES: "κομμάτια",
  SLICES: "φέτες",
  PINCH: "πρέζα",
};

const EditRecipeSteps = ({
  recipeId,
  steps,
  recipeIngredients,
  onRefresh,
  showMessage,
}) => {
  const [editingStepId, setEditingStepId] = useState(null);
  const [localSteps, setLocalSteps] = useState(steps);
  const [newStepIng, setNewStepIng] = useState({
    ingredientId: "",
    name: "",
    quantity: "",
    measurementUnit: "GRAMS",
  });

  const confirmDialog = useConfirm();

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const getUnitLabel = (unitValue) => {
    const unit = MEASUREMENT_UNITS.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const onToggleEdit = (id) => {
    if (editingStepId === id) {
      setEditingStepId(null);
    } else {
      setEditingStepId(id);
      setNewStepIng({
        ingredientId: "",
        name: "",
        quantity: "",
        measurementUnit: "GRAMS",
      });
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
        recipeId: parseInt(recipeId),
      });
      onRefresh();
      showMessage("Νέο βήμα δημιουργήθηκε!");
    } catch (error) {
      showMessage("Σφάλμα δημιουργίας βήματος.", "error");
    }
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

  const handleTitleChange = (e, stepId) => {
    const val = e.target.value;
    setLocalSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, title: val } : s))
    );
  };

  const handleDurationChange = (e, stepId) => {
    const val = e.target.value;
    setLocalSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, duration: val } : s))
    );
  };

  const handleDescChange = (e, stepId) => {
    const val = e.target.value;
    setLocalSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, description: val } : s))
    );
  };

  const onSelectIngredientChange = (e) => {
    const selected = recipeIngredients.find(
      (i) => (i.ingredientId || i.id).toString() === e.target.value
    );
    setNewStepIng({
      ...newStepIng,
      ingredientId: e.target.value,
      name: selected ? selected.name : "",
    });
  };

  const onQuantityChange = (e) =>
    setNewStepIng({ ...newStepIng, quantity: e.target.value });
  const onUnitChange = (e) =>
    setNewStepIng({ ...newStepIng, measurementUnit: e.target.value });

  const onAddIngredientToStep = (stepId) => {
    if (!newStepIng.ingredientId || !newStepIng.quantity) return;
    setLocalSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            stepIngredients: [
              ...(step.stepIngredients || []),
              {
                ingredientId: newStepIng.ingredientId,
                name: newStepIng.name,
                quantity: parseFloat(newStepIng.quantity),
                measurementUnit: newStepIng.measurementUnit,
              },
            ],
          };
        }
        return step;
      })
    );
    setNewStepIng({
      ingredientId: "",
      name: "",
      quantity: "",
      measurementUnit: "GRAMS",
    });
  };

  const onRemoveIngredientFromStep = (stepId, index) => {
    setLocalSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            stepIngredients: step.stepIngredients.filter((_, i) => i !== index),
          };
        }
        return step;
      })
    );
  };

  const onSaveStep = async (step) => {
    try {
      const cleanStepIngredients = (step.stepIngredients || [])
        .map((ing) => {
          let finalIngredientId =
            ing.ingredientId || (ing.ingredient ? ing.ingredient.id : null);
          if (!finalIngredientId) return null;
          return {
            stepId: parseInt(step.id),
            ingredientId: parseInt(finalIngredientId),
            quantity: parseFloat(ing.quantity),
            measurementUnit:
              TO_BACKEND_UNIT_MAP[ing.measurementUnit] || ing.measurementUnit,
            name: ing.name,
            id: ing.id || null,
          };
        })
        .filter(Boolean);

      await updateStep(step.id, {
        id: step.id,
        title: step.title,
        description: step.description,
        duration: parseInt(step.duration) || 1,
        stepOrder: parseInt(step.stepOrder),
        recipeId: parseInt(recipeId),
        stepIngredients: cleanStepIngredients,
        photos: step.photos || [],
      });

      showMessage(`Το Βήμα "${step.title}" ενημερώθηκε!`);
      setEditingStepId(null);
      setTimeout(() => onRefresh(), 200);
    } catch (error) {
      showMessage("Σφάλμα αποθήκευσης βήματος.", "error");
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
      showMessage("Η φωτογραφία ανέβηκε!");
    } catch (error) {
      showMessage("Σφάλμα ανεβάσματος.", "error");
    }
  };

  const onDeletePhoto = async (photoId) => {
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

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>
          <ListOrdered size={24} /> Βήματα Εκτέλεσης
        </h3>
        <button
          type="button"
          className={classes.btnSuccess}
          onClick={onAddNewStep}
        >
          <Plus size={18} /> Προσθήκη Βήματος
        </button>
      </div>

      {localSteps.map((step) => (
        <div
          key={step.id}
          className={`${classes.stepContainer} ${
            editingStepId === step.id ? classes.activeEdit : ""
          }`}
        >
          {/* Header Display */}
          <div
            className={classes.stepHeaderDisplay}
            onClick={() => onToggleEdit(step.id)}
          >
            <div className={classes.stepHeaderInfo}>
              <span className={classes.stepNumberBadge}>{step.stepOrder}</span>
              <span className={classes.stepTitleText}>{step.title}</span>
              <span className={classes.durationBadge}>
                <Clock size={12} /> {step.duration}'
              </span>
            </div>

            <div className={classes.actions}>
              <span className={classes.iconBtn}>
                {editingStepId === step.id ? (
                  <Edit2 size={18} color="#fbbf24" />
                ) : (
                  <Edit2 size={18} color="#94a3b8" />
                )}
              </span>
              <button
                className={classes.btnDangerIcon}
                onClick={(e) => onDeleteStep(e, step.id)}
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
              <p className={classes.viewDesc}>
                {step.description || "Χωρίς περιγραφή"}
              </p>

              {step.stepIngredients && step.stepIngredients.length > 0 && (
                <div className={classes.tagList}>
                  {step.stepIngredients.map((ing, i) => (
                    <span key={i} className={classes.ingTag}>
                      🛒 {ing.name} ({ing.quantity}{" "}
                      {getUnitLabel(ing.measurementUnit)})
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
                      alt="step preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
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
                <div className={classes.inputGroup} style={{ flex: 3 }}>
                  <label className={classes.label}>Τίτλος</label>
                  <input
                    className={classes.input}
                    value={step.title}
                    onChange={(e) => handleTitleChange(e, step.id)}
                  />
                </div>
                <div className={classes.inputGroup} style={{ flex: 1 }}>
                  <label className={classes.label}>Διάρκεια (λ.)</label>
                  <input
                    type="number"
                    className={classes.input}
                    value={step.duration}
                    onChange={(e) => handleDurationChange(e, step.id)}
                  />
                </div>
              </div>

              <div
                className={classes.inputGroup}
                style={{ marginBottom: "1rem" }}
              >
                <label className={classes.label}>Περιγραφή</label>
                <textarea
                  className={classes.textarea}
                  value={step.description}
                  onChange={(e) => handleDescChange(e, step.id)}
                />
              </div>

              {/* Ingredients */}
              <div className={classes.ingredientsBox}>
                <label className={classes.label}>Υλικά Βήματος</label>
                <ul className={classes.ingList}>
                  {(step.stepIngredients || []).map((sing, idx) => (
                    <li key={idx} className={classes.ingItem}>
                      <span>
                        <strong>{sing.name}</strong> - {sing.quantity}{" "}
                        {getUnitLabel(sing.measurementUnit)}
                      </span>
                      <button
                        type="button"
                        className={classes.btnDangerSmall}
                        onClick={() => onRemoveIngredientFromStep(step.id, idx)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={classes.addRow}>
                  <select
                    className={`${classes.select} ${classes.flex2}`}
                    value={newStepIng.ingredientId}
                    onChange={onSelectIngredientChange}
                  >
                    <option value="">Επιλογή Υλικού...</option>
                    {recipeIngredients.map((ri) => (
                      <option
                        key={ri.ingredientId || ri.id}
                        value={ri.ingredientId || ri.id}
                      >
                        {ri.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Ποσ."
                    className={`${classes.input} ${classes.flex1}`}
                    value={newStepIng.quantity}
                    onChange={onQuantityChange}
                  />
                  <select
                    className={`${classes.select} ${classes.flex1}`}
                    value={newStepIng.measurementUnit}
                    onChange={onUnitChange}
                  >
                    {MEASUREMENT_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={classes.btnAdd}
                    onClick={() => onAddIngredientToStep(step.id)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Photos */}
              <div className={classes.photoEditSection}>
                <label className={classes.label}>
                  <Camera size={16} /> Φωτογραφίες
                </label>
                <div className={classes.photoGrid}>
                  {(step.photos || []).map((p) => (
                    <div key={p.id} className={classes.photoWrapper}>
                      <img
                        src={getPhotoImageUrl(p.id)}
                        className={classes.viewPhotoImg}
                        alt="step"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <button
                        className={classes.photoDeleteBtn}
                        onClick={() => onDeletePhoto(p.id)}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  className={classes.fileInput}
                  style={{ marginTop: "5px" }}
                  onChange={(e) => onPhotoUpload(e, step.id)}
                />
              </div>

              <div className={classes.buttonsRow}>
                <button
                  type="button"
                  className={classes.btnSuccess}
                  onClick={() => onSaveStep(step)}
                >
                  <Save size={18} /> Αποθήκευση
                </button>
                <button
                  type="button"
                  className={classes.btnSecondary}
                  onClick={() => setEditingStepId(null)}
                >
                  <X size={18} /> Κλείσιμο
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
