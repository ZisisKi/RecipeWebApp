import React, { useState, useRef } from "react";
import { Plus, Camera, Clock, X, ShoppingCart } from "lucide-react";
import classes from "./StepsForm.module.css";
import IngredientSelector from "./IngredientSelector";
import { useConfirm } from "../UI/ConfirmProvider";

const MEASUREMENT_UNITS_MAP = {
  "GRAMS": "g",
  "KILOGRAMS": "kg",
  "MILLILITERS": "ml",
  "LITERS": "L",
  "CUPS": "φλιτζ.",
  "TABLESPOONS": "κ.σ.",
  "TEASPOONS": "κ.γ.",
  "PIECES": "τεμ.",
  "SLICES": "φέτες",
  "PINCH": "πρέζα"
};

const StepsForm = ({ steps, onAddStep }) => {
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    duration: 5,
    representedPhotos: [],
    stepIngredients: []
  });

  const fileInputRef = useRef(null);
  const confirmDialog = useConfirm();

  const handleTitleChange = (e) => {
    setNewStep((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleDurationChange = (e) => {
    setNewStep((prev) => ({ ...prev, duration: e.target.value }));
  };

  const handleDescriptionChange = (e) => {
    setNewStep((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleAddIngredientToStep = (ingredientData) => {
    if (!ingredientData) return;
    setNewStep((prev) => ({
      ...prev,
      stepIngredients: [...prev.stepIngredients, ingredientData]
    }));
  };

  const createRemoveIngredientHandler = (index) => async () => {
    const isConfirmed = await confirmDialog({
      title: "Αφαίρεση Υλικού",
      message: "Θέλετε να αφαιρέσετε αυτό το υλικό από το βήμα;",
      confirmText: "Ναι, αφαίρεση",
    });
    if (isConfirmed) {
      setNewStep((prev) => ({
        ...prev,
        stepIngredients: prev.stepIngredients.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTriggerFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoSelect = (e) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).map((file) => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file),
      description: "",
      name: file.name
    }));
    setNewStep((prev) => ({
      ...prev,
      representedPhotos: [...prev.representedPhotos, ...newPhotos]
    }));
  };

  const createRemovePhotoHandler = (photoId) => () => {
    setNewStep((prev) => ({
      ...prev,
      representedPhotos: prev.representedPhotos.filter((p) => p.id !== photoId)
    }));
  };

  const handleAddStepClick = () => {
    if (!newStep.title.trim()) {
      alert("Παρακαλώ δώστε τίτλο στο βήμα.");
      return;
    }
    const stepOrder = steps.length + 1;
    const stepToAdd = {
      ...newStep,
      stepOrder,
      duration: parseInt(newStep.duration) || 1
    };
    onAddStep(stepToAdd);
    setNewStep({
      title: "",
      description: "",
      duration: 5,
      representedPhotos: [],
      stepIngredients: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderStepPreview = (step, index) => (
    <div key={index} className={classes.stepPreviewCard}>
      <div className={classes.stepHeader}>
        <span className={classes.stepBadge}>{index + 1}</span>
        <span className={classes.stepTitle}>{step.title}</span>
        <span className={classes.stepDuration}>
            <Clock size={14}/> {step.duration}'
        </span>
      </div>
      {step.stepIngredients?.length > 0 && (
        <div className={classes.stepIngPreview}>
           <small>Υλικά: {step.stepIngredients.length}</small>
        </div>
      )}
      {step.representedPhotos?.length > 0 && (
        <div className={classes.stepPhotoPreview}>
           <Camera size={14} /> {step.representedPhotos.length} φωτό
        </div>
      )}
    </div>
  );

  const renderIngredientItem = (ing, idx) => (
    <li key={idx} className={classes.ingredientItem}>
         <span>
            <strong>{ing.name}</strong> 
            ({ing.quantity} {MEASUREMENT_UNITS_MAP[ing.measurementUnit] || ing.measurementUnit})
         </span>
         <button 
           type="button" 
           onClick={createRemoveIngredientHandler(idx)}
           className={classes.removeIngBtn}
           title="Αφαίρεση"
         >
            <X size={14} />
         </button>
    </li>
  );

  const renderPhotoItem = (photo) => (
    <div key={photo.id} className={classes.photoThumbnail}>
        <img 
          src={photo.preview} 
          alt="preview" 
          className={classes.thumbImg} 
        />
        <button 
          type="button" 
          onClick={createRemovePhotoHandler(photo.id)}
          className={classes.removePhotoBtn}
        >
           <X size={12}/>
        </button>
    </div>
  );

  return (
    <div className={classes.container}>
      {steps.length > 0 && (
        <div className={classes.stepsList}>
          {steps.map(renderStepPreview)}
        </div>
      )}
      <div className={classes.formCard}>
        <h4 className={classes.formTitle}>
          Προσθήκη Βήματος {steps.length + 1}
        </h4>
        <div className={classes.row}>
          <div className={classes.inputGroupFull}>
            <label className={classes.label}>Τίτλος Βήματος</label>
            <input
              type="text"
              value={newStep.title}
              onChange={handleTitleChange}
              className={classes.input}
              placeholder="π.χ. Προετοιμασία λαχανικών"
            />
          </div>
          <div className={classes.inputGroupSmall}>
             <label className={classes.label}>Διάρκεια (λεπτά)</label>
             <input
               type="number"
               min="1"
               value={newStep.duration}
               onChange={handleDurationChange}
               className={classes.input}
             />
          </div>
        </div>
        <div className={classes.inputGroup}>
          <label className={classes.label}>Περιγραφή Διαδικασίας</label>
          <textarea
            value={newStep.description}
            onChange={handleDescriptionChange}
            className={classes.textarea}
            placeholder="Περιγράψτε αναλυτικά τι πρέπει να γίνει..."
          />
        </div>
        <div className={classes.ingredientsSection}>
            <label className={classes.label}>
                <ShoppingCart size={16}/> Υλικά για αυτό το βήμα
            </label>
            <div className={classes.selectorWrapper}>
                <IngredientSelector onAdd={handleAddIngredientToStep} />
            </div>
            {newStep.stepIngredients.length > 0 && (
                <ul className={classes.ingredientsList}>
                    {newStep.stepIngredients.map(renderIngredientItem)}
                </ul>
            )}
        </div>
        <div className={classes.photoSection}>
           <button 
             type="button" 
             onClick={handleTriggerFile} 
             className={classes.uploadBtn}
           >
              <Camera size={18}/> Προσθήκη Φωτογραφιών
           </button>
           <input
             ref={fileInputRef}
             type="file"
             accept="image/*"
             multiple
             className={classes.hiddenInput}
             onChange={handlePhotoSelect}
           />
           {newStep.representedPhotos.length > 0 && (
              <div className={classes.photosPreviewRow}>
                 {newStep.representedPhotos.map(renderPhotoItem)}
              </div>
           )}
        </div>
        <button 
          type="button" 
          onClick={handleAddStepClick} 
          className={classes.addBtn}
        >
           <Plus size={20} /> Καταχώρηση Βήματος
        </button>
      </div>
    </div>
  );
};

export default StepsForm;