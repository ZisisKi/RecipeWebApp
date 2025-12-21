import React, { useEffect, useState, useCallback } from "react";
import { getRecipeById, updateRecipe } from "../../api/recipeApi";
import BasicInfoForm from "../../components/recipe-form/BasicInfoForm";
import styles from "./EditRecipe.module.css";

// Sub-components
import EditRecipeIngredients from "./EditRecipeIngredients";
import EditRecipeSteps from "./EditRecipeSteps";
import EditRecipePhotos from "./EditRecipePhotos";

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
      await updateRecipe(recipeId, { ...formData, steps: [] });
      showMessage("✅ Τα βασικά στοιχεία αποθηκεύτηκαν!");
    } catch (error) {
      showMessage("❌ Σφάλμα κατά την αποθήκευση.", "error");
    }
  };

  if (loading || !formData) return <div className={styles.container}>Φόρτωση...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Επεξεργασία: {formData.name}</h1>

      {/* 1. Basic Info & Photos */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>📝 Βασικές Πληροφορίες</h3>
          <button type="button" className={styles.btnPrimary} onClick={onSaveBasicInfo}>
            Αποθήκευση Βασικών
          </button>
        </div>
        
        {/* Υποθέτω ότι το BasicInfoForm είναι ήδη έτοιμο component αλλού */}
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

      <div className={styles.backButtonContainer}>
        <button className={styles.btnSecondary} onClick={onSaveSuccess}>
          ← Επιστροφή στη Λεπτομέρεια
        </button>
      </div>

      {uiMessage && (
        <div className={`${styles.messageBar} ${uiMessage.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
          {uiMessage.type === 'error' ? '⚠️' : '✅'} {uiMessage.text}
        </div>
      )}
    </div>
  );
};

export default EditRecipe;