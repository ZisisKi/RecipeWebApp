import React, { useState } from "react";
// ΑΦΑΙΡΕΣΑΜΕ το FileText από τα imports
import { Camera, Trash2, Plus, Clock, CheckSquare, Upload } from "lucide-react";
import classes from "./StepsForm.module.css";

const StepsForm = ({
  steps,
  onAddStep,
  availableIngredients,
  onRemoveStep,
  mode = "create",
  onStepPhotoUpload,
  onStepPhotoDelete,
}) => {
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    duration: 5,
    ingredientIds: [],
    pendingPhotos: [],
  });

  const handleStepPhotoSelect = (files) => {
    try {
      const newPhotos = Array.from(files).map((file) => {
        if (file.size > 50 * 1024 * 1024) throw new Error("File too large");
        return {
          file: file,
          id: Date.now() + Math.random(),
          preview: URL.createObjectURL(file),
          description: "",
          name: file.name,
        };
      });
      setNewStep((prev) => ({
        ...prev,
        pendingPhotos: [...prev.pendingPhotos, ...newPhotos],
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemoveStepPhoto = (photoId) => {
    setNewStep((prev) => ({
      ...prev,
      pendingPhotos: prev.pendingPhotos.filter((p) => p.id !== photoId),
    }));
  };

  /* ΑΦΑΙΡΕΣΑΜΕ τη συνάρτηση handleStepPhotoDescriptionChange 
     επειδή στο Quick Add Step (Mini Preview) δεν βάζουμε περιγραφές 
     στις φωτογραφίες για να είναι πιο γρήγορο το UI.
  */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStep((prev) => ({ ...prev, [name]: value }));
  };

  const createCheckboxHandler = (ingredientId) => () => {
    setNewStep((prevState) => {
      const currentIds = prevState.ingredientIds;
      if (currentIds.includes(ingredientId)) {
        return { ...prevState, ingredientIds: currentIds.filter((id) => id !== ingredientId) };
      } else {
        return { ...prevState, ingredientIds: [...currentIds, ingredientId] };
      }
    });
  };

  const handleAddClick = () => {
    if (!newStep.description.trim()) {
      alert("Η περιγραφή είναι υποχρεωτική");
      return;
    }
    const titleToUse = newStep.title.trim() === "" ? `Βήμα ${steps.length + 1}` : newStep.title;
    
    onAddStep({
      ...newStep,
      title: titleToUse,
      stepOrder: steps.length + 1,
      stepIngredients: newStep.ingredientIds.map((id) => ({ ingredientId: id })),
      pendingPhotos: newStep.pendingPhotos,
    });

    setNewStep({
      title: "",
      description: "",
      duration: 5,
      ingredientIds: [],
      pendingPhotos: [],
    });
  };

  return (
    <div className={classes.container}>
      
      {/* --- NEW STEP FORM --- */}
      <div className={classes.newStepBox}>
        <h4 className={classes.boxTitle}><Plus size={18}/> Προσθήκη Νέου Βήματος</h4>
        
        <div className={classes.row}>
          <div className={classes.inputGroup} style={{flex: 3}}>
            <input
              type="text"
              name="title"
              placeholder="Τίτλος (π.χ. Προετοιμασία)"
              className={classes.input}
              value={newStep.title}
              onChange={handleInputChange}
            />
          </div>
          <div className={classes.inputGroup} style={{flex: 1}}>
             <div className={classes.iconInputWrapper}>
               <Clock size={16} className={classes.inputIcon}/>
               <input
                type="number"
                name="duration"
                placeholder="min"
                min="1"
                className={classes.inputWithIcon}
                value={newStep.duration}
                onChange={handleInputChange}
              />
             </div>
          </div>
        </div>

        <textarea
          name="description"
          className={classes.textarea}
          placeholder="Περιγράψτε τη διαδικασία..."
          value={newStep.description}
          onChange={handleInputChange}
        />

        {availableIngredients.length > 0 && (
          <div className={classes.ingredientsSection}>
            <label className={classes.sectionLabel}><CheckSquare size={16}/> Υλικά σε αυτό το βήμα:</label>
            <div className={classes.checkboxGrid}>
              {availableIngredients.map((ing) => (
                <label key={ing.ingredientId || ing.id} className={classes.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newStep.ingredientIds.includes(ing.ingredientId || ing.id)}
                    onChange={createCheckboxHandler(ing.ingredientId || ing.id)}
                  />
                  <span>{ing.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step Photos Upload */}
        <div className={classes.photoUploadSection}>
          <label className={classes.uploadLabel}>
             <Camera size={18} /> Φωτογραφίες Βήματος
             <input type="file" accept="image/*" multiple hidden onChange={(e) => handleStepPhotoSelect(e.target.files)} />
             <span className={classes.uploadBtnText}><Upload size={14}/> Επιλογή</span>
          </label>
          
          {newStep.pendingPhotos.length > 0 && (
             <div className={classes.previewRow}>
                {newStep.pendingPhotos.map(photo => (
                  <div key={photo.id} className={classes.miniPreview}>
                     <img src={photo.preview} alt="" />
                     <button type="button" onClick={() => handleRemoveStepPhoto(photo.id)}><Trash2 size={12}/></button>
                  </div>
                ))}
             </div>
          )}
        </div>

        <button type="button" className={classes.addButton} onClick={handleAddClick}>
          Προσθήκη Βήματος
        </button>
      </div>

      {/* --- EXISTING STEPS LIST --- */}
      <div className={classes.stepsList}>
        {steps.map((step, index) => (
          <div key={index} className={classes.stepCard}>
            <div className={classes.stepHeader}>
              <span className={classes.stepNumber}>{index + 1}</span>
              <div className={classes.stepInfo}>
                 <div className={classes.stepTitleRow}>
                    <strong>{step.title}</strong>
                    <span className={classes.durationTag}>{step.duration}'</span>
                 </div>
                 <p className={classes.stepDesc}>{step.description}</p>
                 
                 {/* Metadata Tags */}
                 <div className={classes.metaTags}>
                    {step.stepIngredients?.length > 0 && (
                      <span className={classes.tag}>🛒 {step.stepIngredients.length} Υλικά</span>
                    )}
                    {(step.pendingPhotos?.length > 0 || step.photos?.length > 0) && (
                      <span className={`${classes.tag} ${classes.photoTag}`}>📷 Φωτογραφίες</span>
                    )}
                 </div>
              </div>
              
              {onRemoveStep && (
                <button type="button" className={classes.removeStepBtn} onClick={() => onRemoveStep(index)}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsForm;