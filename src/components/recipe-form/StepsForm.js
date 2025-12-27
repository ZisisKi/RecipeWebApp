import React, { useEffect, useState } from "react";
import {
  Camera,
  Trash2,
  Plus,
  Clock,
  CheckSquare,
  Upload,
  ShoppingBasket,
} from "lucide-react";
import classes from "./StepsForm.module.css";
import { useToast } from "../UI/ToastProvider";

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

  // Lightbox viewer state
  const [viewer, setViewer] = useState({ open: false, src: "", alt: "" });
  const openViewer = (src, alt = "") => setViewer({ open: true, src, alt });
  const closeViewer = () => setViewer({ open: false, src: "", alt: "" });

  // Close lightbox with ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeViewer();
    };
    if (viewer.open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewer.open]);

  const showToast = useToast();

  const handleStepPhotoSelect = (files) => {
    try {
      const newPhotos = Array.from(files).map((file) => {
        if (file.size > 50 * 1024 * 1024) throw new Error("File too large");
        return {
          file,
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
      showToast({
        type: "error",
        title: "Σφάλμα",
        message: error?.message ? `Σφάλμα: ${error.message}` : "Κάτι πήγε στραβά.",
      });
    }
  };

  const handleRemoveStepPhoto = (photoId) => {
    setNewStep((prev) => ({
      ...prev,
      pendingPhotos: prev.pendingPhotos.filter((p) => p.id !== photoId),
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
      }
      return { ...prevState, ingredientIds: [...currentIds, ingredientId] };
    });
  };

  const handleAddClick = () => {
    if (!newStep.description.trim()) {
      showToast({
        type: "warning",
        title: "Λείπει περιγραφή",
        message: "Η περιγραφή είναι υποχρεωτική.",
      });
      return;
    }

    const titleToUse =
      newStep.title.trim() === "" ? `Βήμα ${steps.length + 1}` : newStep.title;

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
        <h4 className={classes.boxTitle}>
          <Plus size={18} /> Προσθήκη Νέου Βήματος
        </h4>

        <div className={classes.row}>
          <div className={classes.inputGroup} style={{ flex: 3 }}>
            <input
              type="text"
              name="title"
              placeholder="Τίτλος (π.χ. Προετοιμασία)"
              className={classes.input}
              value={newStep.title}
              onChange={handleInputChange}
            />
          </div>

          <div className={classes.inputGroup} style={{ flex: 1 }}>
            <div className={classes.iconInputWrapper}>
              <Clock size={16} className={classes.inputIcon} />
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
            <label className={classes.sectionLabel}>
              <CheckSquare size={16} /> Υλικά σε αυτό το βήμα:
            </label>

            <div className={classes.checkboxGrid}>
              {availableIngredients.map((ing) => (
                <label
                  key={ing.ingredientId || ing.id}
                  className={classes.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    checked={newStep.ingredientIds.includes(
                      ing.ingredientId || ing.id
                    )}
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
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleStepPhotoSelect(e.target.files)}
            />
            <span className={classes.uploadBtnText}>
              <Upload size={14} /> Επιλογή
            </span>
          </label>

          {newStep.pendingPhotos.length > 0 && (
            <div className={classes.previewRow}>
              {newStep.pendingPhotos.map((photo) => (
                <div key={photo.id} className={classes.miniPreview}>
                  <img
                    src={photo.preview}
                    alt=""
                    onClick={() => openViewer(photo.preview, photo.name)}
                    style={{ cursor: "zoom-in" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStepPhoto(photo.id)}
                  >
                    <Trash2 size={12} />
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

                {/* Step Photos Preview */}
                {(step.pendingPhotos?.length > 0 || step.photos?.length > 0) && (
                  <div className={classes.stepPhotosRow}>
                    {step.pendingPhotos?.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={classes.thumbBtn}
                        onClick={() => openViewer(p.preview, p.name || "step photo")}
                        aria-label="Άνοιγμα φωτογραφίας"
                      >
                        <img
                          className={classes.stepPhotoThumb}
                          src={p.preview}
                          alt={p.name || "step photo"}
                        />
                      </button>
                    ))}

                    {step.photos?.map((url, i) => (
                      <button
                        key={`${url}-${i}`}
                        type="button"
                        className={classes.thumbBtn}
                        onClick={() => openViewer(url, `step photo ${i + 1}`)}
                        aria-label="Άνοιγμα φωτογραφίας"
                      >
                        <img
                          className={classes.stepPhotoThumb}
                          src={url}
                          alt={`step photo ${i + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Metadata Tags */}
                <div className={classes.metaTags}>
                  {step.stepIngredients?.length > 0 && (
                    <span className={`${classes.tag} ${classes.ingTag}`}>
                      <ShoppingBasket size={14} />
                      {step.stepIngredients.length}{" "}
                      {step.stepIngredients.length === 1 ? "Υλικό" : "Υλικά"}
                    </span>
                  )}
                </div>
              </div>

              {onRemoveStep && (
                <button
                  type="button"
                  className={classes.removeStepBtn}
                  onClick={() => onRemoveStep(index)}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX / MODAL */}
      {viewer.open && (
        <div
          className={classes.lightbox}
          onClick={closeViewer}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={classes.lightboxClose}
            onClick={closeViewer}
            aria-label="Κλείσιμο"
          >
            ✕
          </button>

          <img
            className={classes.lightboxImg}
            src={viewer.src}
            alt={viewer.alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default StepsForm;
