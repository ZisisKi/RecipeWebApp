import classes from "./CreateRecipePage.module.css";
import React, { useState } from "react";
import { createRecipe } from "../api/recipeApi";
import { createStep } from "../api/stepApi";
import { uploadPhotoForRecipe, uploadPhotoForStep } from "../api/PhotoApi";

// Import τα νέα μας components
import BasicInfoForm from "../components/recipe-form/BasicInfoForm";
import IngredientSelector from "../components/recipe-form/IngredientSelector";
import StepsForm from "../components/recipe-form/StepsForm";

const CreateRecipePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "EASY",
    category: "MAIN_COURSE",
    totalDuration: 1,
    steps: [],
    recipeIngredients: [],
    photos: [],
  });

  const [message, setMessage] = useState("");
  const [pendingRecipePhotos, setPendingRecipePhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "totalDuration" ? Number(value) : value,
    });
  };

  const handleAddIngredient = (newIngredient) => {
    setFormData({
      ...formData,
      recipeIngredients: [...formData.recipeIngredients, newIngredient],
    });
  };

  const handleAddStep = (newStepObject) => {
    setFormData({
      ...formData,
      steps: [...formData.steps, newStepObject],
    });
  };

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];

    if (file.size > maxSize) {
      throw new Error("Το αρχείο είναι πολύ μεγάλο. Μέγιστο όριο: 50MB");
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(
        "Μη αποδεκτός τύπος αρχείου. Επιτρέπονται: JPEG, PNG, GIF, BMP, WebP"
      );
    }
  };

  const handleRecipePhotoSelect = (files) => {
    try {
      const newPhotos = Array.from(files).map((file) => {
        validateFile(file);
        return {
          file: file,
          id: Date.now() + Math.random(),
          preview: URL.createObjectURL(file),
          description: "",
          name: file.name,
        };
      });
      setPendingRecipePhotos([...pendingRecipePhotos, ...newPhotos]);
    } catch (error) {
      setMessage(`Σφάλμα φωτογραφίας: ${error.message}`);
    }
  };

  const handleRemoveRecipePhoto = (photoId) => {
    setPendingRecipePhotos(
      pendingRecipePhotos.filter((photo) => photo.id !== photoId)
    );
  };

  const handleRecipePhotoDescriptionChange = (photoId, description) => {
    setPendingRecipePhotos(
      pendingRecipePhotos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      setMessage("Δημιουργία συνταγής...");
      console.log("Creating recipe with data:", formData);

      const recipeData = {
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        category: formData.category,
        totalDuration: formData.totalDuration,
        recipeIngredients: formData.recipeIngredients,
        steps: [],
        photos: [],
      };

      const savedRecipe = await createRecipe(recipeData);

      let uploadedPhotosCount = 0;
      const totalRecipePhotos = pendingRecipePhotos.length;
      const totalStepPhotos = formData.steps.reduce(
        (total, step) => total + (step.pendingPhotos?.length || 0),
        0
      );
      const totalPhotos = totalRecipePhotos + totalStepPhotos;

      if (pendingRecipePhotos.length > 0) {
        setMessage(
          `Μεταφόρτωση φωτογραφιών συνταγής (${
            uploadedPhotosCount + 1
          }/${totalPhotos})...`
        );

        for (const [index, photo] of pendingRecipePhotos.entries()) {
          try {
            console.log(
              `Uploading recipe photo ${index + 1}/${
                pendingRecipePhotos.length
              }:`,
              photo.name
            );

            await uploadPhotoForRecipe(
              savedRecipe.id,
              photo.file,
              photo.description
            );

            uploadedPhotosCount++;
            setMessage(
              `Μεταφόρτωση φωτογραφιών: ${uploadedPhotosCount}/${totalPhotos}`
            );
          } catch (photoError) {
            setMessage(
              `Σφάλμα φωτογραφίας συνταγής "${photo.name}": ${photoError.message}`
            );
          }
        }
      }

      const createdSteps = [];

      if (formData.steps.length > 0) {
        setMessage("Δημιουργία βημάτων...");
        console.log(`Creating ${formData.steps.length} steps...`);

        for (const [stepIndex, stepData] of formData.steps.entries()) {
          try {
            const stepDto = {
              title: stepData.title,
              description: stepData.description,
              stepOrder: stepData.stepOrder,
              duration: stepData.duration,
              recipeId: savedRecipe.id,
            };

            setMessage(
              `Δημιουργία βήματος ${stepIndex + 1}/${formData.steps.length}: "${
                stepDto.title
              }"`
            );

            const createdStep = await createStep(stepDto);
            createdSteps.push(createdStep);

            if (stepData.pendingPhotos && stepData.pendingPhotos.length > 0) {
              setMessage(
                `Μεταφόρτωση φωτογραφιών βήματος "${stepData.title}"...`
              );
              for (const [
                photoIndex,
                photo,
              ] of stepData.pendingPhotos.entries()) {
                try {
                  await uploadPhotoForStep(
                    createdStep.id,
                    photo.file,
                    photo.description
                  );

                  uploadedPhotosCount++;
                  setMessage(
                    `Μεταφόρτωση φωτογραφιών: ${uploadedPhotosCount}/${totalPhotos}`
                  );
                } catch (stepPhotoError) {
                  setMessage(
                    `Σφάλμα φωτογραφίας βήματος "${photo.name}": ${stepPhotoError.message}`
                  );
                }
              }
            }
          } catch (stepError) {
            setMessage(
              `Σφάλμα δημιουργίας βήματος "${stepData.title}": ${stepError.message}`
            );
          }
        }
      }

      const successMessage = [
        `🎉 Επιτυχία! Η συνταγή "${savedRecipe.name}" δημιουργήθηκε!`,
        `📋 Βήματα: ${createdSteps.length}/${formData.steps.length}`,
        `📷 Φωτογραφίες: ${uploadedPhotosCount}/${totalPhotos}`,
      ].join(" ");

      setMessage(successMessage);

      setFormData({
        name: "",
        description: "",
        difficulty: "EASY",
        category: "MAIN_COURSE",
        totalDuration: 1,
        steps: [],
        recipeIngredients: [],
        photos: [],
      });
      setPendingRecipePhotos([]);

      const recipeFileInput = document.getElementById("recipe-photos");
      if (recipeFileInput) recipeFileInput.value = "";

      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error) {
      setMessage(`Σφάλμα κατά την αποθήκευση: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Δημιουργία Νέας Συνταγής</h1>

      <form onSubmit={handleSubmit}>
        {/* Component 1: Βασικά Στοιχεία */}
        <BasicInfoForm formData={formData} handleChange={handleBasicChange} />

        {/* Component 2: Διαχείριση Υλικών */}
        <div className={classes.subSection}>
          <h3>Υλικά Συνταγής</h3>
          <IngredientSelector onAdd={handleAddIngredient} />
          <ul className={classes.list}>
            {formData.recipeIngredients.map((item, index) => (
              <li key={index}>
                - {item.name}: {item.quantity} {item.measurementUnit}
              </li>
            ))}
          </ul>
        </div>

        {/* Component 3: Βήματα με Photos */}
        <StepsForm
          steps={formData.steps}
          onAddStep={handleAddStep}
          availableIngredients={formData.recipeIngredients}
          mode="create"
        />

        {/* Component 4: Recipe Photos */}
        <div className={classes.subSection}>
          <h3>📷 Φωτογραφίες Συνταγής</h3>
          <p
            style={{ color: "#666", fontSize: "0.9rem", marginBottom: "15px" }}
          >
            Προσθέστε κεντρικές φωτογραφίες που αντιπροσωπεύουν τη συνταγή.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="recipe-photos"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#495057",
              }}
            >
              Επιλέξτε φωτογραφίες συνταγής:
            </label>
            <input
              id="recipe-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleRecipePhotoSelect(e.target.files)}
              disabled={uploading}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px dashed #ced4da",
                borderRadius: "8px",
                background: uploading ? "#e9ecef" : "white",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            />
            <small style={{ color: "#6c757d", fontSize: "0.8rem" }}>
              Επιτρέπονται: JPEG, PNG, GIF, BMP, WebP (μέχρι 50MB το καθένα)
            </small>
          </div>

          {/* Recipe Photo Previews */}
          {pendingRecipePhotos.length > 0 && (
            <div>
              <h4 style={{ marginBottom: "15px" }}>
                📸 Επιλεγμένες φωτογραφίες συνταγής (
                {pendingRecipePhotos.length}):
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "15px",
                }}
              >
                {pendingRecipePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      border: "2px solid #dee2e6",
                      borderRadius: "12px",
                      padding: "12px",
                      background: "#ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={photo.preview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Περιγραφή φωτογραφίας..."
                      value={photo.description}
                      onChange={(e) =>
                        handleRecipePhotoDescriptionChange(
                          photo.id,
                          e.target.value
                        )
                      }
                      disabled={uploading}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ced4da",
                        borderRadius: "6px",
                        marginBottom: "10px",
                        fontSize: "0.9rem",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6c757d",
                        marginBottom: "8px",
                      }}
                    >
                      {photo.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipePhoto(photo.id)}
                      disabled={uploading}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: uploading ? "not-allowed" : "pointer",
                        fontSize: "0.9rem",
                        opacity: uploading ? 0.6 : 1,
                      }}
                    >
                      ✖ Αφαίρεση
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Section */}
        {(pendingRecipePhotos.length > 0 ||
          formData.steps.some((step) => step.pendingPhotos?.length > 0)) && (
          <div
            className={classes.subSection}
            style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
          >
            <h4 style={{ marginTop: 0, color: "#495057" }}>
              📋 Σύνοψη Φωτογραφιών
            </h4>
            <p>📷 Φωτογραφίες συνταγής: {pendingRecipePhotos.length}</p>
            <p>
              🔢 Βήματα με φωτογραφίες:{" "}
              {
                formData.steps.filter((step) => step.pendingPhotos?.length > 0)
                  .length
              }
            </p>
            <p>
              📸 Συνολικές φωτογραφίες βημάτων:{" "}
              {formData.steps.reduce(
                (total, step) => total + (step.pendingPhotos?.length || 0),
                0
              )}
            </p>
            <div
              style={{
                background: "#e3f2fd",
                padding: "10px",
                borderRadius: "5px",
                marginTop: "10px",
                fontSize: "0.9rem",
                color: "#1565c0",
              }}
            >
              💡 <strong>Σημαντικό:</strong> Οι φωτογραφίες βημάτων θα ανέβουν
              μετά τη δημιουργία κάθε βήματος.
            </div>
          </div>
        )}

        <button
          className={classes.submitBtn}
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Αποθήκευση..." : "Αποθήκευση Ολοκληρωμένης Συνταγής"}
        </button>
      </form>

      {message && (
        <div
          className={`${classes.message} ${
            message.includes("Επιτυχία") || message.includes("🎉")
              ? classes.successMessage
              : message.includes("Σφάλμα") || message.includes("❌")
              ? classes.errorMessage
              : classes.infoMessage
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateRecipePage;
