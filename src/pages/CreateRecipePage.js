import React, { useState } from "react";
import { createRecipe } from "../api/recipeApi";
import { createStep } from "../api/stepApi";
import { uploadPhotoForRecipe, uploadPhotoForStep } from "../api/PhotoApi";
import classes from "./CreateRecipePage.module.css";

// Lucide Icons
import { 
  PenLine, 
  Camera, 
  UploadCloud, 
  Save, 
  Trash2, 
  ChefHat, 
  ListOrdered,
  FileText,
  Info,
  Images, Hash, Lightbulb, Loader2  
} from "lucide-react";

// Components
import BasicInfoForm from "../components/recipe-form/BasicInfoForm";
import IngredientSelector from "../components/recipe-form/IngredientSelector";
import StepsForm from "../components/recipe-form/StepsForm";

const CreateRecipePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "EASY",
    category: "MAIN_COURSE",
    totalDuration: "1",
    steps: [],
    recipeIngredients: [],
    photos: [],
  });

  const [message, setMessage] = useState("");
  const [pendingRecipePhotos, setPendingRecipePhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // --- Handlers ---
const handleBasicChange = (e) => {
  const { name, value } = e.target;

  // ειδικά για minutes: κράτα string ώστε να επιτρέπεται "" χωρίς να γίνεται 0
  if (name === "totalDuration") {
    // κράτα μόνο digits
    const onlyDigits = value.replace(/[^\d]/g, "");
    setFormData((prev) => ({ ...prev, totalDuration: onlyDigits }));
    return;
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
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
      
      const recipeData = {
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        category: formData.category,
        totalDuration: Math.max(1, parseInt(formData.totalDuration || "1", 10)),
        recipeIngredients: formData.recipeIngredients,
        steps: [],
        photos: [],
      };

      // 1. Create Recipe
      const savedRecipe = await createRecipe(recipeData);

      let uploadedPhotosCount = 0;
      const totalRecipePhotos = pendingRecipePhotos.length;
      const totalStepPhotos = formData.steps.reduce(
        (total, step) => total + (step.pendingPhotos?.length || 0),
        0
      );
      const totalPhotos = totalRecipePhotos + totalStepPhotos;

      // 2. Upload Recipe Photos
      if (pendingRecipePhotos.length > 0) {
        setMessage(
          `Μεταφόρτωση φωτογραφιών συνταγής (${uploadedPhotosCount + 1}/${totalPhotos})...`
        );

        // ΔΙΟΡΘΩΣΗ: Αφαίρεση του [index, photo] και .entries() αφού δεν χρησιμοποιούμε το index
        for (const photo of pendingRecipePhotos) {
          try {
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

      // 3. Create Steps & Upload Step Photos
      const createdSteps = [];
      if (formData.steps.length > 0) {
        setMessage("Δημιουργία βημάτων...");
        
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
              `Δημιουργία βήματος ${stepIndex + 1}/${formData.steps.length}: "${stepDto.title}"`
            );

            const createdStep = await createStep(stepDto);
            createdSteps.push(createdStep);

            // Upload photos for this step
            if (stepData.pendingPhotos && stepData.pendingPhotos.length > 0) {
              setMessage(
                `Μεταφόρτωση φωτογραφιών βήματος "${stepData.title}"...`
              );
              for (const photo of stepData.pendingPhotos) {
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

      // Success
      const successMessage = `🎉 Επιτυχία! Η συνταγή δημιουργήθηκε με ${createdSteps.length} βήματα και ${uploadedPhotosCount} φωτογραφίες!`;

      setMessage(successMessage);

      // Reset Form
      setFormData({
        name: "",
        description: "",
        difficulty: "EASY",
        category: "MAIN_COURSE",
        totalDuration: "1",
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

  // --- Render ---
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        <PenLine size={36} /> Δημιουργία Νέας Συνταγής
      </h1>

      <form onSubmit={handleSubmit}>
        
        {/* Component 1: Βασικά Στοιχεία */}
        <div className={classes.subSection}>
           <h3><FileText size={24}/> Βασικά Στοιχεία</h3>
           <BasicInfoForm formData={formData} handleChange={handleBasicChange} />
        </div>

        {/* Component 2: Διαχείριση Υλικών */}
        <div className={classes.subSection}>
          <h3><ChefHat size={24}/> Υλικά Συνταγής</h3>
          <IngredientSelector onAdd={handleAddIngredient} />
          
          {formData.recipeIngredients.length > 0 && (
             <ul className={classes.list}>
               {formData.recipeIngredients.map((item, index) => (
                 <li key={index}>
                   <span style={{color: '#fbbf24', marginRight:'10px'}}>•</span> 
                   <strong>{item.name}</strong>: {item.quantity} {item.measurementUnit}
                 </li>
               ))}
             </ul>
          )}
        </div>

        {/* Component 3: Βήματα με Photos */}
        <div className={classes.subSection}>
           <h3><ListOrdered size={24}/> Εκτέλεση</h3>
           <StepsForm
             steps={formData.steps}
             onAddStep={handleAddStep}
             availableIngredients={formData.recipeIngredients}
             mode="create"
           />
        </div>

        {/* Component 4: Recipe Photos (Upload Section) */}
        <div className={classes.subSection}>
          <h3><Camera size={24}/> Φωτογραφίες Συνταγής</h3>
          <p className={classes.descriptionText}>
            Προσθέστε κεντρικές φωτογραφίες που θα εμφανίζονται στην κάρτα της συνταγής.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <div className={classes.fileInputWrapper} onClick={() => document.getElementById("recipe-photos").click()}>
                <UploadCloud size={40} className={classes.uploadIcon} />
                <span className={classes.uploadText}>Κλικ εδώ για επιλογή φωτογραφιών</span>
                <input
                  id="recipe-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleRecipePhotoSelect(e.target.files)}
                  disabled={uploading}
                  className={classes.fileInput}
                />
            </div>
            <small className={classes.helperText}>
              Επιτρέπονται: JPEG, PNG, GIF, BMP, WebP (μέγιστο 50MB)
            </small>
          </div>

          {/* Previews */}
          {pendingRecipePhotos.length > 0 && (
            <div>
              <h4 className={classes.photoGridTitle}>
                📸 Επιλεγμένες ({pendingRecipePhotos.length}):
              </h4>
              <div className={classes.photoGrid}>
                {pendingRecipePhotos.map((photo) => (
                  <div key={photo.id} className={classes.photoCard}>
                    <img
                      src={photo.preview}
                      alt="Preview"
                      className={classes.previewImage}
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
                      className={classes.photoDescInput}
                    />
                    <div className={classes.photoName}>{photo.name}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipePhoto(photo.id)}
                      disabled={uploading}
                      className={classes.removePhotoBtn}
                    >
                      <Trash2 size={16} /> Αφαίρεση
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
          <div className={`${classes.subSection} ${classes.summarySection}`}>
            <h4 className={classes.summaryTitle}>
  <Info size={20} /> Σύνοψη Upload
</h4>

<p className={classes.summaryRow}>
  <Images size={16} />
  Φωτογραφίες συνταγής: <strong>{pendingRecipePhotos.length}</strong>
</p>

<p className={classes.summaryRow}>
  <Hash size={16} />
  Βήματα με φωτογραφίες:{" "}
  <strong>{formData.steps.filter((step) => step.pendingPhotos?.length > 0).length}</strong>
</p>

<div className={classes.summaryInfoBox}>
  <Lightbulb size={16} />
  <div>
    <strong>Σημαντικό:</strong> Οι φωτογραφίες ανεβαίνουν αυτόματα αφού δημιουργηθεί επιτυχώς η συνταγή και τα βήματα.
  </div>
</div>

          </div>
        )}

        <button
          className={classes.submitBtn}
          type="submit"
          disabled={uploading}
        >
          {uploading ? (
  <>
    <Loader2 size={22} className={classes.spinner} />
    Αποθήκευση σε εξέλιξη...
  </>
) : (
  <>
    <Save size={24} />
    Αποθήκευση Συνταγής
  </>
)}

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