import React, { useState } from "react";
// Import όλων των σελίδων (Pages)
import CreateRecipePage from "./pages/CreateRecipePage";
import RecipeListPage from "./pages/RecipeListPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import EditRecipePage from "./pages/EditRecipePage";
import BackButton from "./components/UI/BackButton";

// Import του CSS Module
import classes from "./App.module.css";

function App() {
  // --- STATE ---
  const [activeScreen, setActiveScreen] = useState("Welcome");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // --- HANDLERS (Λειτουργίες Πλοήγησης) ---
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

  // --- RENDER ---
  return (
    <div className={classes.appContainer}>
      {/* HEADER: Πάντα ορατό */}
      <header className={classes.header}>
        <h1 className={classes.appTitle} onClick={goToMenu}>
          🍴 Recipe eBook
        </h1>
      </header>

      <main className={classes.mainContent}>
        {/* --- 1. WELCOME SCREEN (ΑΡΧΙΚΗ) --- */}
        {activeScreen === "Welcome" && (
          <div className={classes.heroSection}>
            <div className={classes.heroImagePlaceholder}>
              <h2 className={classes.heroText}>
                Οι καλύτερες συνταγές, συγκεντρωμένες.
              </h2>
            </div>

            <nav className={classes.mainMenu}>
              <button
                className={`${classes.menuBtn} ${classes.btnView}`}
                onClick={() => setActiveScreen("Recipe_List")}
              >
                📖 Προβολή Συνταγών
              </button>
              <button
                className={`${classes.menuBtn} ${classes.btnCreate}`}
                onClick={() => setActiveScreen("Create_Recipe")}
              >
                ➕ Νέα Συνταγή
              </button>
            </nav>
          </div>
        )}

        {/* --- 2. RECIPE LIST SCREEN --- */}
        {activeScreen === "Recipe_List" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton onClick={goToMenu} text="← Πίσω στο Μενού" />
            </div>
            <RecipeListPage onRecipeClick={handleRecipeSelection} />
          </div>
        )}

        {/* --- 3. CREATE RECIPE SCREEN --- */}
        {activeScreen === "Create_Recipe" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton onClick={goToMenu} text="← Πίσω στο Μενού" />
            </div>
            <CreateRecipePage />
          </div>
        )}

        {/* --- 4. RECIPE DETAILS SCREEN --- */}
        {activeScreen === "Recipe_Details" && selectedRecipeId && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton
                onClick={() => setActiveScreen("Recipe_List")}
                text="← Πίσω στη Λίστα"
              />
            </div>

            <RecipeDetailsPage
              recipeId={selectedRecipeId}
              onEdit={handleEditRequest}
              onBack={() => setActiveScreen("Recipe_List")}
            />
          </div>
        )}

        {/* --- 5. EDIT RECIPE SCREEN --- */}
        {activeScreen === "Edit_Recipe" && selectedRecipeId && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton
                onClick={handleEditComplete}
                text="← Ακύρωση Επεξεργασίας"
              />
            </div>

            <EditRecipePage
              recipeId={selectedRecipeId}
              onCancel={handleEditComplete}
              onSaveSuccess={handleEditComplete}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={classes.footer}>© 2025 My Recipe eBook Project</footer>
    </div>
  );
}

export default App;
