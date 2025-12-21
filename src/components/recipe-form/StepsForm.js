import React, { useState } from "react";
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
        if (file.size > 50 * 1024 * 1024) {
          throw new Error("Το αρχείο είναι πολύ μεγάλο (μέχρι 50MB)");
        }
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/bmp",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          throw new Error("Μη αποδεκτός τύπος αρχείου");
        }
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
      alert(`Σφάλμα φωτογραφίας: ${error.message}`);
    }
  };

  const handleRemoveStepPhoto = (photoId) => {
    setNewStep((prev) => ({
      ...prev,
      pendingPhotos: prev.pendingPhotos.filter((photo) => photo.id !== photoId),
    }));
  };

  const handleStepPhotoDescriptionChange = (photoId, description) => {
    setNewStep((prev) => ({
      ...prev,
      pendingPhotos: prev.pendingPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo
      ),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStep((prev) => ({ ...prev, [name]: value }));
  };

  const createCheckboxHandler = (ingredientId) => () => {
    setNewStep((prevState) => {
      const currentIds = prevState.ingredientIds;
      if (currentIds.includes(ingredientId)) {
        return {
          ...prevState,
          ingredientIds: currentIds.filter((id) => id !== ingredientId),
        };
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

    const titleToUse =
      newStep.title.trim() === "" ? `Βήμα ${steps.length + 1}` : newStep.title;

    onAddStep({
      ...newStep,
      title: titleToUse,
      stepOrder: steps.length + 1,
      stepIngredients: newStep.ingredientIds.map((id) => ({
        ingredientId: id,
      })),
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

  const createRemoveHandler = (index) => () => {
    if (onRemoveStep) onRemoveStep(index);
  };

  const handleExistingStepPhotoUpload = (stepId, files) => {
    if (onStepPhotoUpload) onStepPhotoUpload(stepId, files);
  };

  const handleExistingStepPhotoDelete = (stepId, photoId) => {
    if (onStepPhotoDelete) onStepPhotoDelete(stepId, photoId);
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.titleHeader}>Εκτέλεση (Βήματα)</h3>

      {/* --- FORM SECTION FOR NEW STEP --- */}
      <div className={classes.formContainer}>
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

        <textarea
          name="description"
          className={classes.textarea}
          placeholder="Περιγραφή βήματος (υποχρεωτικό)..."
          value={newStep.description}
          onChange={handleInputChange}
        />

        {availableIngredients.length > 0 && (
          <div className={classes.ingredientsSection}>
            <label className={classes.ingredientsLabel}>Υλικά βήματος:</label>
            <div className={classes.checkboxList}>
              {availableIngredients.map((ing) => (
                <label key={ing.ingredientId || ing.id} className={classes.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={classes.checkboxInput}
                    checked={newStep.ingredientIds.includes(ing.ingredientId || ing.id)}
                    onChange={createCheckboxHandler(ing.ingredientId || ing.id)}
                  />
                  {ing.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step Photos Section */}
        <div className={classes.stepPhotosSection}>
          <label className={classes.photoLabel}>📷 Φωτογραφίες βήματος:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleStepPhotoSelect(e.target.files)}
            className={classes.fileInput}
          />
          <small className={classes.helperText}>
            Επιτρέπονται: JPEG, PNG, GIF, BMP, WebP (μέχρι 50MB το καθένα)
          </small>

          {newStep.pendingPhotos.length > 0 && (
            <div className={classes.photoPreviewGrid}>
              {newStep.pendingPhotos.map((photo) => (
                <div key={photo.id} className={classes.photoPreviewCard}>
                  <img src={photo.preview} alt="Preview" className={classes.previewImage} />
                  <input
                    type="text"
                    placeholder="Περιγραφή..."
                    value={photo.description}
                    onChange={(e) => handleStepPhotoDescriptionChange(photo.id, e.target.value)}
                    className={classes.photoDescInput}
                  />
                  <div className={classes.photoName}>{photo.name}</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStepPhoto(photo.id)}
                    className={classes.removePhotoBtn}
                  >
                    ✖ Αφαίρεση
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className={classes.addButton} onClick={handleAddClick}>
          Προσθήκη Βήματος
          {newStep.pendingPhotos.length > 0 && ` (με ${newStep.pendingPhotos.length} φωτογραφίες)`}
        </button>
      </div>

      {/* --- LIST SECTION - EXISTING STEPS --- */}
      <div className={classes.stepsList}>
        {steps.map((step, index) => (
          <div key={index} className={classes.stepItem}>
            <div className={classes.stepHeader}>
              <span className={classes.stepTitleText}>
                {step.stepOrder}. {step.title}
              </span>

              <div className={classes.stepActions}>
                <span className={classes.durationBadge}>⏱ {step.duration} λεπτά</span>

                {((step.photos && step.photos.length > 0) ||
                  (step.pendingPhotos && step.pendingPhotos.length > 0)) && (
                  <span className={`${classes.durationBadge} ${classes.photoBadge}`}>
                    📷 {(step.photos?.length || 0) + (step.pendingPhotos?.length || 0)}
                  </span>
                )}

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

            {step.stepIngredients && step.stepIngredients.length > 0 && (
              <div className={classes.stepIngredients}>
                🛒 {step.stepIngredients.length} Υλικά
              </div>
            )}

            {/* EDIT MODE: Existing Photos */}
            {mode === "edit" && step.id && step.photos && step.photos.length > 0 && (
              <div className={classes.existingPhotos}>
                <h5 className={classes.existingPhotosTitle}>📷 Υπάρχουσες Φωτογραφίες:</h5>
                <div className={classes.photoPreviewGrid}>
                  {step.photos.map((photo) => (
                    <div key={photo.id} className={classes.photoPreviewCard}>
                      <div className={classes.existingPhotoPlaceholder}>
                        📷 Εικόνα {photo.id}
                      </div>
                      {photo.description && (
                        <div className={classes.existingPhotoDesc}>
                          {photo.description}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleExistingStepPhotoDelete(step.id, photo.id)}
                        className={`${classes.removePhotoBtn} ${classes.uploadMoreContainer}`}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className={classes.uploadMoreContainer}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleExistingStepPhotoUpload(step.id, e.target.files)}
                    className={classes.fileInput}
                  />
                </div>
              </div>
            )}

            {/* PENDING PHOTOS (Create Mode visualizer inside list) */}
            {step.pendingPhotos && step.pendingPhotos.length > 0 && (
              <div className={classes.pendingPhotosWrapper}>
                <h5 className={classes.pendingPhotosTitle}>
                  📋 Φωτογραφίες προς μεταφόρτωση:
                </h5>
                <div className={classes.pendingPhotosGrid}>
                  {step.pendingPhotos.map((photo) => (
                    <div key={photo.id} className={classes.pendingPhotoTag}>
                      📷 {photo.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsForm;