import React, { useEffect, useState } from "react";
import { getRecipeById, updateRecipe } from "../api/recipeApi";
import BasicInfoForm from "../components/recipe-form/BasicInfoForm";
import IngredientSelector from "../components/recipe-form/IngredientSelector";
import StepsForm from "../components/recipe-form/StepsForm";
import classes from "./CreateRecipePage.module.css"; 

const EditRecipePage = ({ recipeId, onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: "", description: "", difficulty: "EASY", category: "MAIN_COURSE", 
    totalDuration: 1, 
    steps: [], 
    recipeIngredients: [], 
    photos: []
  });
  const [loading, setLoading] = useState(true);

  // 1. Φόρτωση και ΔΙΟΡΘΩΣΗ δεδομένων (Mapping)
  useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await getRecipeById(recipeId);
            console.log("Data from API:", data); // Δες την κονσόλα αν ξαναγίνει

            // --- SOS: Διόρθωση Υλικών ---
            // Ελέγχουμε αν το όνομα είναι κρυμμένο σε κάποιο πεδίο ingredient.name ή ingredientName
            const mappedIngredients = data.recipeIngredients.map(item => ({
                ...item,
                // Αν υπάρχει item.name κράτα το, αλλιώς ψάξε στο item.ingredient.name, αλλιώς στο item.ingredientName
                name: item.name || item.ingredient?.name || item.ingredientName || "Άγνωστο Υλικό",
                // Σιγουρεύουμε ότι έχουμε quantity και unit
                quantity: item.quantity || 0,
                measurementUnit: item.measurementUnit || "τεμάχια"
            }));

            // --- SOS: Διόρθωση Βημάτων ---
            // Σιγουρεύουμε ότι τα βήματα είναι σωστά ταξινομημένα
            const sortedSteps = (data.steps || []).sort((a, b) => a.stepOrder - b.stepOrder);

            setFormData({
                ...data,
                recipeIngredients: mappedIngredients,
                steps: sortedSteps
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Δεν βρέθηκαν τα στοιχεία της συνταγής");
        }
    };
    fetchData();
  }, [recipeId]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "totalDuration" ? Number(value) : value });
  };

  const handleAddIngredient = (newIngredient) => {
    setFormData(prev => ({
        ...prev,
        recipeIngredients: [...prev.recipeIngredients, newIngredient]
    }));
  };

  // --- Εδώ διορθώνουμε την προσθήκη Βήματος ---
  const handleAddStep = (newStepObject) => {
    console.log("Προσθήκη βήματος:", newStepObject); // Debugging
    setFormData(prev => ({
        ...prev,
        // Προσθέτουμε το νέο βήμα στο τέλος της λίστας
        steps: [...prev.steps, newStepObject]
    }));
  };

  const handleRemoveStep = (indexToRemove) => {
      const updatedSteps = formData.steps.filter((_, index) => index !== indexToRemove);
      // Αναρίθμηση για να μην χάσουμε τη σειρά (1, 2, 3...)
      const reorderedSteps = updatedSteps.map((step, i) => ({
          ...step,
          stepOrder: i + 1
      }));
      setFormData(prev => ({ ...prev, steps: reorderedSteps }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log("Saving data:", formData);
        await updateRecipe(recipeId, formData);
        alert("Η συνταγή ενημερώθηκε!");
        onSaveSuccess(); 
    } catch (error) {
        console.error(error);
        alert("Σφάλμα κατά την αποθήκευση.");
    }
  };

  if (loading) return <div>Φόρτωση δεδομένων προς επεξεργασία...</div>;

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Επεξεργασία Συνταγής</h1>
      <form onSubmit={handleSubmit}>
        
        <BasicInfoForm formData={formData} handleChange={handleBasicChange} />

        <div className={classes.subSection}>
            <h3>Υλικά Συνταγής</h3>
            <IngredientSelector onAdd={handleAddIngredient} />
            
            {/* ΛΙΣΤΑ ΥΛΙΚΩΝ */}
            <ul style={{marginTop: '15px', paddingLeft: '20px'}}>
                {formData.recipeIngredients.map((item, index) => (
                    <li key={index} style={{marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span>
                            {/* Εδώ πλέον θα εμφανίζεται σωστά το όνομα χάρη στο mapping */}
                            <strong>{item.name}</strong>: {item.quantity} {item.measurementUnit}
                        </span>
                        
                        <button type="button" onClick={() => {
                            const newIngs = formData.recipeIngredients.filter((_, i) => i !== index);
                            setFormData({...formData, recipeIngredients: newIngs});
                        }} style={{color: 'red', border: '1px solid red', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', background: 'white'}}>
                            X
                        </button>
                    </li>
                ))}
            </ul>
        </div>

        {/* ΦΟΡΜΑ ΒΗΜΑΤΩΝ */}
        <StepsForm 
            steps={formData.steps}
            onAddStep={handleAddStep}
            availableIngredients={formData.recipeIngredients}
            onRemoveStep={handleRemoveStep} 
        />

        <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
            <button className={classes.submitBtn} type="submit">Αποθήκευση Αλλαγών</button>
            <button type="button" onClick={onCancel} style={{padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Ακύρωση</button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipePage;