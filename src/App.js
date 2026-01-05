import React, { useState } from "react";

// --- Icons (Lucide React) ---
import { ChefHat, BookOpen, PlusCircle } from "lucide-react";

// --- Imports Σελίδων ---
import CreateRecipePage from "./pages/CreateRecipePage";
import RecipeListPage from "./pages/RecipeListPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import EditRecipe from "./pages/EditPage/EditRecipe";

// --- UI Components ---
import BackButton from "./components/UI/BackButton";

// --- CSS ---
import classes from "./App.module.css";

function App() {
  const [activeScreen, setActiveScreen] = useState("Welcome");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // --- HANDLERS (Navigation) ---
  const goToMenu = () => {
    setActiveScreen("Welcome");
    setSelectedRecipeId(null);
  };

  const handleRecipeSelection = (id) => {
    setSelectedRecipeId(id);
    setActiveScreen("Recipe_Details");
  };

  const handleEditRequest = () => {
    setActiveScreen("Edit_Recipe");
  };

  const handleEditComplete = () => {
    setActiveScreen("Recipe_Details");
  };

  const handleGoToRecipeList = () => {
    setActiveScreen("Recipe_List");
  };

  const handleGoToCreateRecipe = () => {
    setActiveScreen("Create_Recipe");
  };

  const handleGoToRecipeListBack = () => {
    setActiveScreen("Recipe_List");
  };

  // --- RENDER ---
  return (
    <div className={classes.appContainer}>
      {/* HEADER */}
      <header className={classes.header}>
        <h1 className={classes.appTitle} onClick={goToMenu}>
          {/* Αντικατάσταση inline style */}
          <ChefHat
            size={36}
            color="#fbbf24"
            strokeWidth={2.5}
            className={classes.titleIcon}
          />
          Recipe eBook
        </h1>
      </header>

      <main className={classes.mainContent}>
        {/* --- 1. WELCOME SCREEN --- */}
        {activeScreen === "Welcome" && (
          <div className={classes.heroSplitSection}>
            <div className={classes.heroBgLeft}></div>
            <div className={classes.heroBgRight}></div>
            <div className={classes.heroDivider}></div>

            <div className={classes.heroContent}>
              <h2 className={classes.heroHeadline}>
                Μια εφαρμογή Συνταγών
                <br /> για όλες τις Κουζίνες
              </h2>
             
              <p className={classes.heroSubHeadline}>
               <span className={classes.heroWord}>Δημιούργησε</span>
               <span className={classes.heroDot}>•</span>
               <span className={classes.heroWord}>Αποθήκευσε</span>
               <span className={classes.heroDot}>•</span>
               <span className={classes.heroWord}>Εκτέλεσε</span>
             </p>

              <nav className={classes.mainMenu}>
                <button
                  className={`${classes.menuBtn} ${classes.btnView}`}
                  onClick={handleGoToRecipeList}
                >
                  <BookOpen size={24} />
                  Προβολή Συνταγών
                </button>
                <button
                  className={`${classes.menuBtn} ${classes.btnCreate}`}
                  onClick={handleGoToCreateRecipe}
                >
                  <PlusCircle size={24} />
                  Νέα Συνταγή
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* --- 2. RECIPE LIST SCREEN --- */}
        {activeScreen === "Recipe_List" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton onClick={goToMenu} text="Πίσω στο Μενού" />
            </div>
            <RecipeListPage onRecipeClick={handleRecipeSelection} />
          </div>
        )}

        {/* --- 3. CREATE RECIPE SCREEN --- */}
        {activeScreen === "Create_Recipe" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton onClick={goToMenu} text="Πίσω στο Μενού" />
            </div>
            <CreateRecipePage />
          </div>
        )}

        {/* --- 4. RECIPE DETAILS SCREEN --- */}
        {activeScreen === "Recipe_Details" && selectedRecipeId && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton
                onClick={handleGoToRecipeListBack}
                text="Πίσω στη Λίστα"
              />
            </div>

            <RecipeDetailsPage
              recipeId={selectedRecipeId}
              onEdit={handleEditRequest}
              onBack={handleGoToRecipeListBack}
            />
          </div>
        )}

        {/* --- 5. EDIT RECIPE SCREEN --- */}
        {activeScreen === "Edit_Recipe" && selectedRecipeId && (
          <div className={classes.pageWrapper}>
            <EditRecipe
              recipeId={selectedRecipeId}
              onCancel={handleEditComplete}
              onSaveSuccess={handleEditComplete}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={classes.footer}>
        <div className={classes.footerContent}>
          <span>© 2026 Recipe eBook Project</span>
          <span className={classes.footerSeparator}>|</span>
          <span className={classes.footerTeam}>
            Powered by: <strong>Alex / Zisis / Stelios / Argiris</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;