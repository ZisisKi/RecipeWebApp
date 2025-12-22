import React from "react";
import { updateRecipe } from "../../api/recipeApi";
import IngredientSelector from "../../components/recipe-form/IngredientSelector";
import { Save, ChefHat, Trash2 } from "lucide-react"; // Icons
import styles from "./EditRecipeIngredients.module.css";

const EditRecipeIngredients = ({ recipeId, formData, setFormData, onRefresh, showMessage }) => {

  const onAddIngredient = (newIngredient) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: [...prev.recipeIngredients, newIngredient]
    }));
  };

  const onRemoveIngredient = (index) => {
    const newIngs = formData.recipeIngredients.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, recipeIngredients: newIngs }));
  };

  const onSaveClick = async () => {
    try {
      await updateRecipe(recipeId, formData);
      showMessage("✅ Η λίστα υλικών ενημερώθηκε!");
      onRefresh();
    } catch (error) {
      showMessage("❌ Σφάλμα κατά την αποθήκευση υλικών.", "error");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}><ChefHat size={24}/> Υλικά Συνταγής</h3>
        <button type="button" className={styles.btnPrimary} onClick={onSaveClick}>
          <Save size={18}/> Αποθήκευση Υλικών
        </button>
      </div>

      <IngredientSelector onAdd={onAddIngredient} />

      <ul className={styles.list}>
        {formData.recipeIngredients.map((item, index) => (
          <li key={index} className={styles.item}>
            <span>
              <span style={{color: '#fbbf24', marginRight: '8px'}}>•</span>
              <strong>{item.name}</strong>: {item.quantity} {item.measurementUnit}
            </span>
            <button 
              className={styles.btnDanger} 
              onClick={() => onRemoveIngredient(index)}
              type="button"
              title="Αφαίρεση Υλικού"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditRecipeIngredients;