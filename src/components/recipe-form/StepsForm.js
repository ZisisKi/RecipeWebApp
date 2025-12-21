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
    if (onRemoveStep) {
      onRemoveStep(index);
    }
  };

  const handleExistingStepPhotoUpload = (stepId, files) => {
    if (onStepPhotoUpload) {
      onStepPhotoUpload(stepId, files);
    }
  };

  const handleExistingStepPhotoDelete = (stepId, photoId) => {
    if (onStepPhotoDelete) {
      onStepPhotoDelete(stepId, photoId);
    }
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.titleHeader}>Εκτέλεση (Βήματα)</h3>

      {/* --- FORM SECTION FOR NEW STEP --- */}
      <div className={classes.formContainer}>
        {/* Title & Duration */}
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

        {/* Description */}
        <textarea
          name="description"
          className={classes.textarea}
          placeholder="Περιγραφή βήματος (υποχρεωτικό)..."
          value={newStep.description}
          onChange={handleInputChange}
        />

        {/* Ingredients Selection */}
        {availableIngredients.length > 0 && (
          <div className={classes.ingredientsSection}>
            <label className={classes.ingredientsLabel}>Υλικά βήματος:</label>
            <div className={classes.checkboxList}>
              {availableIngredients.map((ing) => (
                <label
                  key={ing.ingredientId || ing.id}
                  className={classes.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    className={classes.checkboxInput}
                    checked={newStep.ingredientIds.includes(
                      ing.ingredientId || ing.id
                    )}
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
          <label className={classes.ingredientsLabel}>
            📷 Φωτογραφίες βήματος:
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleStepPhotoSelect(e.target.files)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px dashed #ced4da",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          />
          <small style={{ color: "#6c757d", fontSize: "0.8rem" }}>
            Επιτρέπονται: JPEG, PNG, GIF, BMP, WebP (μέχρι 50MB το καθένα)
          </small>

          {newStep.pendingPhotos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {newStep.pendingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "8px",
                    background: "#f9f9f9",
                  }}
                >
                  <img
                    src={photo.preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      marginBottom: "5px",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Περιγραφή..."
                    value={photo.description}
                    onChange={(e) =>
                      handleStepPhotoDescriptionChange(photo.id, e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "3px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "0.8rem",
                      marginBottom: "5px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#666",
                      marginBottom: "3px",
                    }}
                  >
                    {photo.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStepPhoto(photo.id)}
                    style={{
                      width: "100%",
                      padding: "3px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    ✖ Αφαίρεση
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={classes.addButton}
          onClick={handleAddClick}
        >
          Προσθήκη Βήματος
          {newStep.pendingPhotos.length > 0 &&
            ` (με ${newStep.pendingPhotos.length} φωτογραφίες)`}
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
                <span className={classes.durationBadge}>
                  ⏱ {step.duration} λεπτά
                </span>

                {/* Show photo count */}
                {((step.photos && step.photos.length > 0) ||
                  (step.pendingPhotos && step.pendingPhotos.length > 0)) && (
                  <span
                    className={classes.durationBadge}
                    style={{ background: "#17a2b8" }}
                  >
                    📷{" "}
                    {(step.photos?.length || 0) +
                      (step.pendingPhotos?.length || 0)}
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

            {/* Step Ingredients */}
            {step.stepIngredients && step.stepIngredients.length > 0 && (
              <div className={classes.stepIngredients}>
                🛒 {step.stepIngredients.length} Υλικά
              </div>
            )}

            {mode === "edit" &&
              step.id &&
              step.photos &&
              step.photos.length > 0 && (
                <div className={classes.existingPhotos}>
                  <h5
                    style={{
                      margin: "10px 0 5px 0",
                      fontSize: "0.9rem",
                      color: "#555",
                    }}
                  >
                    📷 Υπάρχουσες Φωτογραφίες:
                  </h5>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(100px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {step.photos.map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          padding: "5px",
                          background: "white",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "60px",
                            background: "#f0f0f0",
                            borderRadius: "3px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            color: "#666",
                          }}
                        >
                          📷 {photo.id}
                        </div>
                        {photo.description && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#666",
                              marginTop: "3px",
                              textAlign: "center",
                            }}
                          >
                            {photo.description}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleExistingStepPhotoDelete(step.id, photo.id)
                          }
                          style={{
                            width: "100%",
                            padding: "2px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "0.7rem",
                            marginTop: "3px",
                            cursor: "pointer",
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add more photos to existing step */}
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleExistingStepPhotoUpload(step.id, e.target.files)
                      }
                      style={{
                        width: "100%",
                        padding: "5px",
                        border: "1px dashed #28a745",
                        borderRadius: "3px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </div>
                </div>
              )}

            {/* PENDING PHOTOS (Create Mode) */}
            {step.pendingPhotos && step.pendingPhotos.length > 0 && (
              <div className={classes.pendingPhotos}>
                <h5
                  style={{
                    margin: "10px 0 5px 0",
                    fontSize: "0.9rem",
                    color: "#007bff",
                  }}
                >
                  📋 Φωτογραφίες προς μεταφόρτωση:
                </h5>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                  }}
                >
                  {step.pendingPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      style={{
                        fontSize: "0.8rem",
                        background: "#e3f2fd",
                        padding: "3px 8px",
                        borderRadius: "3px",
                        color: "#0277bd",
                      }}
                    >
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
