import classes from "./CreateRecipePage.module.css";
import React, { useState } from "react";
import { createRecipe, getRecipeById } from "../api/recipeApi";
import { uploadPhotoForRecipe } from "../api/PhotoApi";

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
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [createdRecipe, setCreatedRecipe] = useState(null);

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

  const handlePhotoSelect = (files) => {
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
      setPendingPhotos([...pendingPhotos, ...newPhotos]);
    } catch (error) {
      setMessage(`Σφάλμα φωτογραφίας: ${error.message}`);
    }
  };

  const handleRemovePhoto = (photoId) => {
    setPendingPhotos(pendingPhotos.filter((photo) => photo.id !== photoId));
  };

  const handlePhotoDescriptionChange = (photoId, description) => {
    setPendingPhotos(
      pendingPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      setMessage("Δημιουργία συνταγής...");
      console.log("Creating recipe...");

      const savedRecipe = await createRecipe(formData);
      console.log("Recipe created:", savedRecipe);

      if (pendingPhotos.length > 0) {
        setMessage(
          `Συνταγή δημιουργήθηκε! Μεταφόρτωση ${pendingPhotos.length} φωτογραφιών...`
        );

        let uploadedCount = 0;
        for (const photo of pendingPhotos) {
          try {
            await uploadPhotoForRecipe(
              savedRecipe.id,
              photo.file,
              photo.description
            );
            uploadedCount++;
            setMessage(
              `Μεταφόρτωση φωτογραφιών: ${uploadedCount}/${pendingPhotos.length}`
            );
          } catch (photoError) {
            console.error("Photo upload failed:", photoError);
            setMessage(
              `Σφάλμα μεταφόρτωσης φωτογραφίας "${photo.name}": ${photoError.message}`
            );
          }
        }
      }

      setMessage("Φόρτωση ολοκληρωμένης συνταγής...");
      const completeRecipe = await getRecipeById(savedRecipe.id);
      console.log("Complete recipe with photos:", completeRecipe);

      setCreatedRecipe(completeRecipe);
      setMessage(
        `Επιτυχία! Η συνταγή "${savedRecipe.name}" δημιουργήθηκε με ${
          completeRecipe.photos?.length || 0
        } φωτογραφίες.`
      );

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
      setPendingPhotos([]);

      const fileInput = document.getElementById("recipe-photos");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Recipe creation error:", error);
      setMessage(`Σφάλμα κατά την αποθήκευση: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleStartNewRecipe = () => {
    setCreatedRecipe(null);
    setMessage("");
  };

  if (createdRecipe) {
    return (
      <div className={classes.container}>
        <h1 className={classes.title}>✅ Συνταγή Δημιουργήθηκε!</h1>

        <div
          className={classes.subSection}
          style={{
            background: "linear-gradient(135deg, #d4f5d4, #e8f5e8)",
            borderColor: "#28a745",
          }}
        >
          <h3 style={{ color: "#155724", marginTop: 0 }}>Στοιχεία Συνταγής:</h3>
          <p>
            <strong>ID:</strong> {createdRecipe.id}
          </p>
          <p>
            <strong>Όνομα:</strong> {createdRecipe.name}
          </p>
          <p>
            <strong>Περιγραφή:</strong> {createdRecipe.description}
          </p>
          <p>
            <strong>Υλικά:</strong>{" "}
            {createdRecipe.recipeIngredients?.length || 0}
          </p>
          <p>
            <strong>Βήματα:</strong> {createdRecipe.steps?.length || 0}
          </p>
          <p>
            <strong>Φωτογραφίες:</strong> {createdRecipe.photos?.length || 0}
          </p>

          {createdRecipe.photos && createdRecipe.photos.length > 0 && (
            <div>
              <h4>📷 Ανεβασμένες Φωτογραφίες:</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "10px",
                }}
              >
                {createdRecipe.photos.map((photo, index) => (
                  <div key={photo.id || index} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        background: "#ddd",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        color: "#666",
                      }}
                    >
                      📷 Photo {index + 1}
                      <br />
                      ID: {photo.id}
                    </div>
                    {photo.description && (
                      <p style={{ fontSize: "0.8rem", margin: "5px 0" }}>
                        {photo.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className={classes.submitBtn} onClick={handleStartNewRecipe}>
          🆕 Δημιουργία Νέας Συνταγής
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Δημιουργία Νέας Συνταγής</h1>

      <form onSubmit={handleSubmit}>
        <BasicInfoForm formData={formData} handleChange={handleBasicChange} />

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

        <StepsForm
          steps={formData.steps}
          onAddStep={handleAddStep}
          availableIngredients={formData.recipeIngredients}
        />

        <div className={classes.subSection}>
          <h3>📷 Φωτογραφίες Συνταγής</h3>
          <input
            id="recipe-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handlePhotoSelect(e.target.files)}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px dashed #ced4da",
              borderRadius: "8px",
            }}
          />

          {/* Photo previews */}
          {pendingPhotos.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <h4>📸 Επιλεγμένες φωτογραφίες ({pendingPhotos.length}):</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                {pendingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src={photo.preview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Περιγραφή..."
                      value={photo.description}
                      onChange={(e) =>
                        handlePhotoDescriptionChange(photo.id, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "5px",
                        margin: "5px 0",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      style={{
                        width: "100%",
                        padding: "5px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
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

        <button
          className={classes.submitBtn}
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Αποθήκευση..." : "Αποθήκευση Ολοκληρωμένης Συνταγής"}
        </button>
      </form>
      {message && <p className={classes.message}>{message}</p>}
    </div>
  );
};

export default CreateRecipePage;
