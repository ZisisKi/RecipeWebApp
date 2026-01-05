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
  PINCH: "πρέζα",
};

export const MEASUREMENT_OPTIONS = Object.keys(MEASUREMENT_UNITS).map(
  (key) => ({
    value: MEASUREMENT_UNITS[key], 
    label: MEASUREMENT_UNITS[key], 
  })
);
