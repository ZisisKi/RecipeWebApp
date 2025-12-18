// src/utils/enums.js

/**
 * Αντιστοίχιση των MeasurementUnits της Java για το Frontend.
 * * ΚΛΕΙΔΙ (Αριστερά): Πρέπει να είναι ΙΔΙΟ με το Java Enum (MeasurementUnit.java).
 * ΤΙΜΗ (Δεξιά): Είναι αυτό που βλέπει ο χρήστης στην οθόνη.
 */
export const MEASUREMENT_UNITS = {
    GRAMS: "γραμμάρια",
    KILOGRAMS: "κιλά",
    MILLILITERS: "ml",
    LITERS: "λίτρα",
    CUPS: "φλιτζάνια",
    TABLESPOONS: "κουταλιές σούπας",
    TEASPOONS: "κουταλάκια γλυκού",
    PIECES: "κομμάτια",
    SLICES: "φέτες",
    PINCH: "πρέζα"
};

// Βοηθητική λίστα για να γεμίζουμε εύκολα τα <select> (dropdowns)
// Μετατρέπει το αντικείμενο σε πίνακα: [{value: 'GRAMS', label: 'γραμμάρια'}, ...]
export const MEASUREMENT_OPTIONS = Object.keys(MEASUREMENT_UNITS).map(key => ({
    value: MEASUREMENT_UNITS[key],                 // Αυτό θα σταλεί στη Java (π.χ. GRAMS)
    label: MEASUREMENT_UNITS[key] // Αυτό θα δει ο χρήστης (π.χ. γραμμάρια)
}));