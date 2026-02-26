import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Gets user preferences from Firestore
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} userId
 * @returns {Promise<Object>} User preferences object
 */
export const getUserPreferences = async (db, userId) => {
  try {
    const userDoc = doc(db, 'users', userId);
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    
    return { beta_enabled: false };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return { beta_enabled: false };
  }
};

/**
 * Updates user beta preference in Firestore
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} userId
 * @param {boolean} betaEnabled
 * @returns {Promise<void>}
 */
export const setUserBetaPreference = async (db, userId, betaEnabled) => {
  try {
    const userDoc = doc(db, 'users', userId);
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      await updateDoc(userDoc, { beta_enabled: betaEnabled });
    } else {
      await setDoc(userDoc, { beta_enabled: betaEnabled, createdAt: new Date() });
    }
  } catch (error) {
    console.error('Error setting beta preference:', error);
    throw error;
  }
};
