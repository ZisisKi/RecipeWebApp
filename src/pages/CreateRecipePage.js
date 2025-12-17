import classes from "./CreateRecipePage.module.css";
// [LINE 1] Import React hooks
// Το { useState } είναι εργαλείο του React για να έχει "μνήμη" το component (να θυμάται τι γράφεις).
import React, { useState } from "react";

// [LINE 2] Import API Call
// Εισάγουμε τη συνάρτηση που κάνει το HTTP POST αίτημα.
// ΣΗΜΕΙΩΣΗ: Αυτή η συνάρτηση περιέχει το URL 'http://localhost:8080/api/recipes'.
import { createRecipe } from "../api/recipeApi";

// [LINE 5] Ορισμός Component
// Αυτή είναι η συνάρτηση που ζωγραφίζει τη σελίδα.
const CreateRecipePage = () => {
  // [LINES 7-13] STATE (Η καρδιά της σύνδεσης με το Backend)
  // Εδώ ορίζουμε το αντικείμενο που θα στείλουμε στη Java.
  // SOS BACKEND: Τα ονόματα των κλειδιών (keys) πρέπει να είναι ΙΔΙΑ με το RecipeDto.java.
  const [formData, setFormData] = useState({
    name: "", // Αντιστοιχεί στο: private String name;
    description: "", // Αντιστοιχεί στο: private String description;

    // SOS ENUMS: Οι τιμές εδώ ('EASY') πρέπει να είναι ΚΕΦΑΛΑΙΑ strings.
    // Η Java θα προσπαθήσει να ταιριάξει το string "EASY" με το Enum Difficulty.EASY.
    // Αν γράψεις 'Easy', η Java θα πετάξει σφάλμα (ConversionFailedException).
    difficulty: "EASY",

    category: "MAIN_COURSE", // Ομοίως, πρέπει να ταιριάζει με το RecipeCategory Enum.

    totalDuration: 1, // Αντιστοιχεί στο: private Integer totalDuration;
    steps: [],
    recipeIngredients: [],
    photos: [],
  });

  // [LINE 15] UI State
  // Μια απλή μεταβλητή για να δείξουμε μήνυμα επιτυχίας ή λάθους στον χρήστη.
  const [message, setMessage] = useState("");

  // [LINES 18-21] HANDLE CHANGE (Ο Μηχανισμός Ενημέρωσης)
  // Αυτή η συνάρτηση τρέχει ΚΑΘΕ φορά που πατάς ένα πλήκτρο στο πληκτρολόγιο.
  const handleChange = (e) => {
    // e.target είναι το input που πειράξαμε (π.χ. το πεδίο "Όνομα").
    // name: είναι το attribute name του input (π.χ. "name" ή "description").
    // value: είναι αυτό που μόλις πληκτρολόγησε ο χρήστης.
    const { name, value } = e.target;

    // setFormData: Ενημερώνουμε τη μνήμη.
    // ...formData: (Spread Operator) "Κράτα όλα τα υπόλοιπα πεδία όπως ήταν".
    // [name]: value: "Αλλά μόνο το πεδίο που πειράξαμε, κάνε το ίσο με το νέο value".
    setFormData({
      ...formData,
      [name]: name === "totalDuration" ? Number(value) : value,
    });
  };

  // [LINES 24-35] HANDLE SUBMIT (Η Αποστολή στο Backend)
  // async: Σημαίνει ότι η συνάρτηση θα περιμένει απάντηση από το δίκτυο.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Σημαντικό: Σταματάει το refresh της σελίδας (default browser behavior).

    try {
      // [LINE 28] Η Κλήση
      // createRecipe(formData): Στέλνουμε το JSON στη Java.
      // await: Περιμένουμε μέχρι το Backend να απαντήσει (να σώσει στη MySQL).
      // savedRecipe: Είναι το RecipeDto που επιστρέφει ο Controller (με το ID πλέον).
      const savedRecipe = await createRecipe(formData);

      // Αν φτάσαμε εδώ, όλα πήγαν καλά (Status 200 OK).
      setMessage(`Επιτυχία! Η συνταγή "${savedRecipe.name}" δημιουργήθηκε.`);
    } catch (error) {
      // Αν το Backend είναι κλειστό ή στείλαμε λάθος δεδομένα (Status 400/500).
      console.error(error);
      setMessage("Σφάλμα κατά την αποθήκευση.");
    }
  };

  // [LINES 37-END] Τι βλέπει ο χρήστης (JSX)
  return (
    <div className={classes.container}>
      {" "}
      {/* Απλό CSS class string */}
      <h1 className={classes.title}>Δημιουργία Νέας Συνταγής</h1>
      {/* Συνδέουμε τη φόρμα με τη συνάρτηση αποστολής */}
      <form onSubmit={handleSubmit}>
        {/* --- INPUT: NAME --- */}
        <div className={classes.formGroup}>
          <label className={classes.label}>Όνομα:</label>
          <input
            className={classes.input}
            type="text"
            // SOS BACKEND: Το name="name" λέει στο handleChange ποιο πεδίο να αλλάξει στο JSON.
            // Πρέπει να ταιριάζει με το κλειδί στο formData.
            name="name"
            minLength={2}
            maxLength={30}
            // Controlled Component: Η τιμή έρχεται ΠΑΝΤΑ από το state.
            value={formData.name}
            // Όταν γράφει ο χρήστης, καλείται το handleChange.
            onChange={handleChange}
            required // HTML Validation: Δεν σε αφήνει να πατήσεις submit αν είναι κενό.
          />
        </div>

        {/* --- TEXTAREA: DESCRIPTION --- */}
        <div className={classes.formGroup}>
          <label className={classes.label}>Περιγραφή:</label>
          <textarea
            className={classes.textarea}
            name="description"
            maxLength={500} // Αντιστοιχεί στο formData.description
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* --- INPUT: DURATION --- */}
        <div className={classes.formGroup}>
          <label className={classes.label}>Χρόνος (λεπτά):</label>
          <input
            className={classes.input}
            type="number" // Ο browser θα επιτρέπει μόνο αριθμούς.
            name="totalDuration"
            min="1"
            max="1440" // Αντιστοιχεί στο formData.totalDuration
            value={formData.totalDuration}
            onChange={handleChange}
          />
        </div>

        {/* --- SELECT: DIFFICULTY (SOS) --- */}
        <div className={classes.formGroup}>
          <label className={classes.label}>Δυσκολία:</label>
          {/* Όταν ο χρήστης επιλέγει, το formData.difficulty ενημερώνεται */}
          <select
            className={classes.select}
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            {/* SOS values: Τα value="EASY" είναι αυτά που στέλνονται στο Backend.
                           Πρέπει να είναι ΚΕΦΑΛΑΙΑ (Java Enum convention).
                           Το κείμενο "Εύκολο" είναι απλά αυτό που βλέπει ο χρήστης.
                        */}
            <option value="EASY">Εύκολο</option>
            <option value="MEDIUM">Μέτριο</option>
            <option value="HARD">Δύσκολο</option>
          </select>
        </div>

        {/* --- SELECT: CATEGORY --- */}
        <div className={classes.formGroup}>
          <label className={classes.label}>Κατηγορία:</label>
          <select
            className={classes.select}
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="APPETIZER">Ορεκτικό</option>
            <option value="MAIN_COURSE">Κυρίως Πιάτο</option>
            <option value="DESSERT">Επιδόρπιο</option>
            <option value="SALAD">Σαλάτα</option>
            <option value="SNACK">Σνακ</option>
          </select>
        </div>

        <button className={classes.submitBtn} type="submit">
          Αποθήκευση Συνταγής
        </button>
      </form>
      {/* Conditional Rendering: Δείχνει το μήνυμα μόνο αν υπάρχει κείμενο */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateRecipePage;
