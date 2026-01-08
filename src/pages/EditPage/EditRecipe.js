import React, { useEffect, useState, useCallback } from "react";
import { getRecipeById, updateRecipe } from "../../api/recipeApi";
import BasicInfoForm from "../../components/recipe-form/BasicInfoForm";
import { 
  FileText, 
  Save, 
  ArrowLeft, // <--- ΑΛΛΑΓΗ: Χρήση του ArrowLeft
  Loader2, 
  PenLine,
  CheckCircle2,
  AlertCircle 
} from "lucide-react";

import EditRecipeIngredients from "./EditRecipeIngredients";
import EditRecipeSteps from "./EditRecipeSteps";
import EditRecipePhotos from "./EditRecipePhotos";

import classes from "./EditRecipe.module.css";

const EditRecipe = ({ recipeId, onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uiMessage, setUiMessage] = useState(null);

  const showMessage = (text, type = "success") => {
    setUiMessage({ text, type });
    setTimeout(() => setUiMessage(null), 3000);
  };

  const fetchRecipeData = useCallback(async () => {
    try {
      const data = await getRecipeById(recipeId);

      const normalizeIngredient = (item) => ({
        ...item,
        ingredientId: item.ingredientId || (item.ingredient ? item.ingredient.id : item.id),
        name: item.name || (item.ingredient ? item.ingredient.name : "Άγνωστο"),
        quantity: item.quantity || 0,
        measurementUnit: item.measurementUnit || "PIECES"
      });

      const mappedRecipeIngredients = (data.recipeIngredients || []).map(normalizeIngredient);

      const processedSteps = (data.steps || []).map((step) => ({
        ...step,
        stepIngredients: (step.stepIngredients || []).map(normalizeIngredient)
      })).sort((a, b) => a.stepOrder - b.stepOrder);

      setFormData({
        ...data,
        recipeIngredients: mappedRecipeIngredients,
        steps: processedSteps
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      showMessage("Απέτυχε η φόρτωση της συνταγής.", "error");
    }
  }, [recipeId]);

  useEffect(() => {
    fetchRecipeData();
  }, [fetchRecipeData]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "totalDuration" ? Number(value) : value 
    }));
  };

  const onSaveBasicInfo = async () => {
    try {
      
      await updateRecipe(recipeId, { ...formData, steps: formData.steps });
      showMessage("Τα βασικά στοιχεία αποθηκεύτηκαν!");
    } catch (error) {
      showMessage("Σφάλμα κατά την αποθήκευση.", "error");
    }
  };

  if (loading || !formData) return (
    <div className={classes.loadingContainer}>
       <Loader2 size={48} className={classes.spinner} />
    </div>
  );

  return (
    <div className={classes.container}>
      
      {/* Top Action Bar - Επιστροφή */}
      <div className={classes.backButtonContainer}>
        <button className={classes.btnSecondary} onClick={onSaveSuccess}>
          <ArrowLeft size={20} /> Επιστροφή
        </button>
      </div>

      <h1 className={classes.title}>
        <PenLine size={32}/> Επεξεργασία: {formData.name}
      </h1>

      {/* 1. Basic Info & Photos */}
      <div className={classes.sectionCard}>
        <div className={classes.sectionHeader}>
          <h3 className={classes.sectionTitle}><FileText size={24}/> </h3>
          <button type="button" className={classes.btnPrimary} onClick={onSaveBasicInfo}>
            <Save size={18} /> Αποθήκευση
          </button>
        </div>
        
        <BasicInfoForm formData={formData} handleChange={handleBasicChange} />

        <EditRecipePhotos
          recipeId={recipeId}
          photos={formData.photos}
          onRefresh={fetchRecipeData}
          showMessage={showMessage}
        />
      </div>

      {/* 2. Ingredients */}
      <EditRecipeIngredients
        recipeId={recipeId}
        formData={formData}
        setFormData={setFormData}
        onRefresh={fetchRecipeData}
        showMessage={showMessage}
      />

      {/* 3. Steps */}
      <EditRecipeSteps
        recipeId={recipeId}
        steps={formData.steps}
        recipeIngredients={formData.recipeIngredients}
        onRefresh={fetchRecipeData}
        showMessage={showMessage}
      />

      {/* Message Toast */}
      {uiMessage && (
        <div className={`${classes.messageBar} ${uiMessage.type === 'error' ? classes.msgError : classes.msgSuccess}`}>
          {uiMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {uiMessage.text}
        </div>
      )}
    </div>
  );
};

export default EditRecipe;