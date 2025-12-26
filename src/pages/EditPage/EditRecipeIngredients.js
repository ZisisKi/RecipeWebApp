import React from "react";
import { updateRecipe } from "../../api/recipeApi";
import IngredientSelector from "../../components/recipe-form/IngredientSelector";
import { Save, ChefHat, Trash2 } from "lucide-react"; 
import classes from "./EditRecipeIngredients.module.css"; // CHANGE

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
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}><ChefHat size={24}/> Υλικά Συνταγής</h3>
        <button type="button" className={classes.btnPrimary} onClick={onSaveClick}>
          <Save size={18}/> Αποθήκευση Υλικών
        </button>
      </div>

      <IngredientSelector onAdd={onAddIngredient} />

      <ul className={classes.list}>
        {formData.recipeIngredients.map((item, index) => (
          <li key={index} className={classes.item}>
            <span>
              <span style={{color: '#fbbf24', marginRight: '8px'}}>•</span>
              <strong>{item.name}</strong>: {item.quantity} {item.measurementUnit}
            </span>
            <button 
              className={classes.btnDanger} 
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