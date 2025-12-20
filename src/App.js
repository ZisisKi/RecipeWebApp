import React, { useState } from "react";
// Import όλων των σελίδων (Pages)
import CreateRecipePage from "./pages/CreateRecipePage";
import RecipeListPage from "./pages/RecipeListPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import EditRecipePage from "./pages/EditRecipePage"; 

// Import του CSS Module
import classes from "./App.module.css";

function App() {
  // --- STATE ---
  // activeScreen: Καθορίζει ποια "σελίδα" βλέπει ο χρήστης
  // Τιμές: 'Welcome', 'Recipe_List', 'Create_Recipe', 'Recipe_Details', 'Edit_Recipe'
  const [activeScreen, setActiveScreen] = useState("Welcome");
  
  // selectedRecipeId: Κρατάει το ID της συνταγής που επιλέχθηκε για προβολή ή επεξεργασία
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // --- HANDLERS (Λειτουργίες Πλοήγησης) ---

  // 1. Επιστροφή στο Κεντρικό Μενού
  const goToMenu = () => {
    setActiveScreen("Welcome");
    setSelectedRecipeId(null);
  };

  // 2. Όταν ο χρήστης επιλέγει μια συνταγή από τη λίστα
  const handleRecipeSelection = (id) => {
      setSelectedRecipeId(id);
      setActiveScreen("Recipe_Details");
  };

  // 3. Όταν ο χρήστης πατάει "Επεξεργασία" μέσα στις λεπτομέρειες
  const handleEditRequest = () => {
      setActiveScreen("Edit_Recipe");
  };

  // 4. Όταν ολοκληρωθεί η επεξεργασία (Save) ή πατήσει Ακύρωση
  const handleEditComplete = () => {
      // Επιστρέφουμε στα Details για να δούμε τις αλλαγές
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
              <button className={classes.backBtn} onClick={goToMenu}>
                ← Πίσω στο Μενού
              </button>
            </div>
            {/* Περνάμε τη συνάρτηση για το κλικ */}
            <RecipeListPage onRecipeClick={handleRecipeSelection} />
          </div>
        )}

        {/* --- 3. CREATE RECIPE SCREEN --- */}
        {activeScreen === "Create_Recipe" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <button className={classes.backBtn} onClick={goToMenu}>
                ← Πίσω στο Μενού
              </button>
            </div>
            <CreateRecipePage />
          </div>
        )}

        {/* --- 4. RECIPE DETAILS SCREEN --- */}
        {activeScreen === "Recipe_Details" && selectedRecipeId && (
            <div className={classes.pageWrapper}>
                <div className={classes.navigationHeader}>
                    <button className={classes.backBtn} onClick={() => setActiveScreen("Recipe_List")}>
                        ← Πίσω στη Λίστα
                    </button>
                </div>
                
                <RecipeDetailsPage 
                    recipeId={selectedRecipeId} 
                    onEdit={handleEditRequest}        // Σύνδεση με το Edit
                    onBack={() => setActiveScreen("Recipe_List")} // Αν διαγραφεί, γυρνάμε λίστα
                />
            </div>
        )}

        {/* --- 5. EDIT RECIPE SCREEN --- */}
        {activeScreen === "Edit_Recipe" && selectedRecipeId && (
            <div className={classes.pageWrapper}>
                <div className={classes.navigationHeader}>
                   {/* Κουμπί Ακύρωσης */}
                   <button className={classes.backBtn} onClick={handleEditComplete}>
                        ← Ακύρωση Επεξεργασίας
                    </button>
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