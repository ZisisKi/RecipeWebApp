import React from "react";
import classes from "./CreateRecipePage.module.css";
import {
  PenLine,
  Camera,
  UploadCloud,
  Save,
  ChefHat,
  X,
  ListOrdered,
  FileText,
  Info,
  Images,
  Hash,
  Lightbulb,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";

import BasicInfoForm from "../components/recipe-form/BasicInfoForm";
import IngredientSelector from "../components/recipe-form/IngredientSelector";
import StepsForm from "../components/recipe-form/StepsForm";
import ValidationModal from "../components/UI/ValidationModal";
import {
  useCreateRecipeFunctions
} from "../hooks/CreateRecipeFunctions";

const CreateRecipePage = () => {
  const {
    formData,
    message,
    validationError,
    representedRecipePhotos,
    uploading,
    fileInputRef,
    handlers
  } = useCreateRecipeFunctions();

  const createRemoveIngHandler = (index) => () => {
    handlers.handleRemoveIngredient(index);
  };

  const createPhotoDescHandler = (id) => (e) => {
    handlers.handlePhotoDescChange(id, e.target.value);
  };

  const createPhotoRemoveHandler = (id) => () => {
    handlers.handleRemoveRecipePhoto(id);
  };

  const renderMessageIcon = () => {
    if (message.includes("Επιτυχία")) return <CheckCircle2 size={20} />;
    if (message.includes("Σφάλμα")) return <AlertCircle size={20} />;
    return <Info size={20} />;
  };

  const renderIngredientItem = (item, index) => (
    <li key={index} className={classes.ingredientListItem}>
      <span className={classes.ingredientText}>
        <strong>{item.name}</strong> 
        ({item.quantity} {item.measurementUnit})
      </span>
      <button 
        type="button" 
        className={classes.deleteIconBtn}
        onClick={createRemoveIngHandler(index)}
        title="Αφαίρεση υλικού"
      >
        <X size={16} />
      </button>
    </li>
  );

  const renderPhotoItem = (photo) => (
    <div key={photo.id} className={classes.photoCard}>
      <img 
        src={photo.preview} 
        alt="Preview" 
        className={classes.previewImage} 
      />
      <input
        type="text"
        placeholder="Περιγραφή..."
        value={photo.description}
        onChange={createPhotoDescHandler(photo.id)}
        disabled={uploading}
        className={classes.photoDescInput}
      />
      <div className={classes.photoName}>{photo.name}</div>
      <button
        type="button"
        onClick={createPhotoRemoveHandler(photo.id)}
        disabled={uploading}
        className={classes.removePhotoBtn}
      >
        <X size={16} /> Αφαίρεση
      </button>
    </div>
  );

  const representedPhotosCount = representedRecipePhotos.length;
  const representedStepPhotosCount = formData.steps.filter(
    (s) => s.representedPhotos?.length > 0
  ).length;
  const hasUploads = representedPhotosCount > 0 || representedStepPhotosCount > 0;

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        <PenLine size={36} /> Δημιουργία Νέας Συνταγής
      </h1>
      
      <form onSubmit={handlers.handleSubmit}>
        <div className={classes.subSection}>
           <h3><FileText size={24}/> Βασικά Στοιχεία</h3>
           <BasicInfoForm 
             formData={formData} 
             handleChange={handlers.handleBasicChange} 
           />
        </div>

        <div className={classes.subSection}>
          <h3><ChefHat size={24}/> Υλικά Συνταγής</h3>
          <IngredientSelector onAdd={handlers.handleAddIngredient} />
          {formData.recipeIngredients.length > 0 && (
             <ul className={classes.list}>
               {formData.recipeIngredients.map(renderIngredientItem)}
             </ul>
          )}
        </div>

        <div className={classes.subSection}>
           <h3><ListOrdered size={24}/> Εκτέλεση</h3>
           <StepsForm
             steps={formData.steps}
             onAddStep={handlers.handleAddStep}
             onUpdateStep={handlers.handleUpdateStep}
             onRemoveStep={handlers.handleRemoveStep}
             availableIngredients={formData.recipeIngredients}
             mode="create"
           />
        </div>

        <div className={classes.subSection}>
          <h3>
            <Camera size={24} /> Φωτογραφίες Συνταγής
          </h3>
          <p className={classes.descriptionText}>
            Προσθέστε κεντρικές φωτογραφίες της συνταγής.
          </p>

          <div className={classes.fileInputContainer}>
            <div 
              className={classes.fileInputWrapper} 
              onClick={handlers.handleTriggerFileUpload}
            >
                <UploadCloud size={40} className={classes.uploadIcon} />
                <span className={classes.uploadText}>
                  Κλικ εδώ για επιλογή φωτογραφιών
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlers.handleRecipePhotoSelect}
                  disabled={uploading}
                  className={classes.fileInput}
                />
            </div>
            <small className={classes.helperText}>
              Επιτρέπονται: JPEG, PNG, JPG (μέγιστο 10MB)
            </small>
          </div>

          {representedRecipePhotos.length > 0 && (
            <div>
              <h4 className={classes.photoGridTitle}>
                <ImageIcon size={20} /> 
                Επιλεγμένες ({representedRecipePhotos.length}):
              </h4>
              <div className={classes.photoGrid}>
                {representedRecipePhotos.map(renderPhotoItem)}
              </div>
            </div>
          )}
        </div>

        {hasUploads && (
           <div className={`${classes.subSection} ${classes.summarySection}`}>
             <h4 className={classes.summaryTitle}>
               <Info size={20} /> Σύνοψη Upload
             </h4>
             <p className={classes.summaryRow}>
               <Images size={16} /> 
               Recipe Photos: <strong>{representedPhotosCount}</strong>
             </p>
             <p className={classes.summaryRow}>
               <Hash size={16} /> 
               Βήματα με φωτογραφίες: <strong>{representedStepPhotosCount}</strong>
             </p>
             <div className={classes.summaryInfoBox}>
               <Lightbulb size={16} />
               <div>
                 <strong>Σημαντικό:</strong> 
                 Οι φωτογραφίες ανεβαίνουν αυτόματα μετά την αποθήκευση.
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
            <><Loader2 size={22} className={classes.spinner} /> Αποθήκευση...</>
          ) : (
            <><Save size={24} /> Αποθήκευση Συνταγής</>
          )}
        </button>
      </form>

      {message && (
        <div className={`${classes.message} ${
          message.includes("Επιτυχία") 
            ? classes.successMessage 
            : message.includes("Σφάλμα") 
              ? classes.errorMessage 
              : classes.infoMessage
        }`}>
          {renderMessageIcon()}
          {message}
        </div>
      )}
      
      {validationError && (
        <ValidationModal 
          open={!!validationError} 
          type="error" 
          message={validationError} 
          onClose={handlers.handleCloseModal} 
        />
      )}
    </div>
  );
};

export default CreateRecipePage;
