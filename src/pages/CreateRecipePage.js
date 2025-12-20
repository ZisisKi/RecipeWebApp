import classes from "./CreateRecipePage.module.css";
import React, { useState } from "react";
import { createRecipe } from "../api/recipeApi";

// Import τα νέα μας components
import BasicInfoForm from "../components/recipe-form/BasicInfoForm";
import IngredientSelector from "../components/recipe-form/IngredientSelector";
import StepsForm from "../components/recipe-form/StepsForm";

const CreateRecipePage = () => {
  
  const [formData, setFormData] = useState({
    name: "", description: "", difficulty: "EASY", category: "MAIN_COURSE", 
    totalDuration: 1, 
    steps: [], 
    recipeIngredients: [], 
    photos: []
  });

  const [message, setMessage] = useState("");

  // Handler για τα βασικά πεδία (περνιέται στο BasicInfoForm)
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "totalDuration" ? Number(value) : value,
    });
  };

  // Handler για προσθήκη Υλικού (περνιέται στο IngredientSelector)
  const handleAddIngredient = (newIngredient) => {
    setFormData({
        ...formData,
        recipeIngredients: [...formData.recipeIngredients, newIngredient]
    });
  };

  // Handler για προσθήκη Βήματος (περνιέται στο StepsForm)
  const handleAddStep = (newStepObject) => {
    setFormData({
        ...formData,
        steps: [...formData.steps, newStepObject]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
        console.log("Sending:", formData);
        const savedRecipe = await createRecipe(formData);
        setMessage(`Επιτυχία! Η συνταγή "${savedRecipe.name}" δημιουργήθηκε.`);
        // Reset
        setFormData({
            name: "", description: "", difficulty: "EASY", category: "MAIN_COURSE", 
            totalDuration: 1, steps: [], recipeIngredients: [], photos: []
        });
    } catch (error) {
      console.error(error);
      setMessage("Σφάλμα κατά την αποθήκευση.");
    }
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Δημιουργία Νέας Συνταγής</h1>
      
      <form onSubmit={handleSubmit}>
        
        {/* Component 1: Βασικά Στοιχεία */}
        <BasicInfoForm 
            formData={formData} 
            handleChange={handleBasicChange} 
        />

        {/* Component 2: Διαχείριση Υλικών */}
        <div className={classes.subSection}>
            <h3>Υλικά Συνταγής</h3>
            <IngredientSelector onAdd={handleAddIngredient} />
            <ul className={classes.list}>
                {formData.recipeIngredients.map((item, index) => (
                    <li key={index}>- {item.name}: {item.quantity} {item.measurementUnit}</li>
                ))}
            </ul>
        </div>

        {/* Component 3: Βήματα (Τώρα ξέρει ποια υλικά είναι διαθέσιμα!) */}
        <StepsForm 
            steps={formData.steps}
            onAddStep={handleAddStep}
            availableIngredients={formData.recipeIngredients} 
        />

        <button className={classes.submitBtn} type="submit">
          Αποθήκευση Ολοκληρωμένης Συνταγής
        </button>

      </form>
      {message && <p className={classes.message}>{message}</p>}
    </div>
  );
};

export default CreateRecipePage;