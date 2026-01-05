import React from "react";
import { updateRecipe } from "../../api/recipeApi";
import IngredientSelector from "../../components/recipe-form/IngredientSelector";
import { Save, ChefHat, Trash2, Circle } from "lucide-react"; 
import classes from "./EditRecipeIngredients.module.css";
// 1. Import του Confirm Hook
import { useConfirm } from "../../components/UI/ConfirmProvider";

const EditRecipeIngredients = ({ recipeId, formData, setFormData, onRefresh, showMessage }) => {
  // 2. Αρχικοποίηση του Confirm Dialog
  const confirmDialog = useConfirm();

  const onAddIngredient = (newIngredient) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: [...prev.recipeIngredients, newIngredient]
    }));
  };

  // 3. Τροποποίηση του handler διαγραφής
  const createRemoveHandler = (index) => async () => {
    // Εμφάνιση του Modal
    const isConfirmed = await confirmDialog({
      title: "Διαγραφή Υλικού",
      message: "Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτό το υλικό από τη λίστα;",
      confirmText: "Ναι, αφαίρεση",
      cancelText: "Ακύρωση"
    });

    // Αν ο χρήστης πατήσει "Ακύρωση", σταματάμε εδώ
    if (!isConfirmed) return;

    // Αν πατήσει "Ναι", προχωράμε στη διαγραφή
    const newIngs = formData.recipeIngredients.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, recipeIngredients: newIngs }));
  };

  const onSaveClick = async () => {
    try {
      await updateRecipe(recipeId, formData);
      showMessage("Η λίστα υλικών ενημερώθηκε!", "success");
      onRefresh();
    } catch (error) {
      showMessage("Σφάλμα κατά την αποθήκευση υλικών.", "error");
    }
  };

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>
          <ChefHat size={24} className={classes.iconGold} /> Υλικά Συνταγής
        </h3>
        <button type="button" className={classes.btnPrimary} onClick={onSaveClick}>
          <Save size={18}/> Αποθήκευση Υλικών
        </button>
      </div>

      <IngredientSelector onAdd={onAddIngredient} />

      <ul className={classes.list}>
        {formData.recipeIngredients.map((item, index) => (
          <li key={index} className={classes.item}>
            <span className={classes.itemText}>
              <Circle size={8} className={classes.bulletIcon} fill="currentColor" />
              <strong>{item.name}</strong>: {item.quantity} {item.measurementUnit}
            </span>
            <button 
              className={classes.btnDanger} 
              onClick={createRemoveHandler(index)}
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