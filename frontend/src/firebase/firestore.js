import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// User operations
export const createUser = async (uid, userData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (uid, userData) => {
  try {
    await updateDoc(doc(db, 'users', uid), userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Wardrobe operations
export const saveWardrobeItem = async (uid, type, itemData) => {
  try {
    const wardrobeRef = doc(db, 'wardrobe', uid);
    const wardrobeDoc = await getDoc(wardrobeRef);
    
    const currentItems = wardrobeDoc.exists() 
      ? wardrobeDoc.data()[type] || [] 
      : [];
    
    const newItem = {
      ...itemData,
      uploadedAt: new Date().toISOString(),
    };
    
    await setDoc(wardrobeRef, {
      [type]: [...currentItems, newItem],
    }, { merge: true });
    
    return newItem;
  } catch (error) {
    console.error('Error saving wardrobe item:', error);
    throw error;
  }
};

export const saveWardrobeItems = async (uid, type, itemsData) => {
  try {
    const wardrobeRef = doc(db, 'wardrobe', uid);
    const wardrobeDoc = await getDoc(wardrobeRef);
    
    const currentItems = wardrobeDoc.exists() 
      ? wardrobeDoc.data()[type] || [] 
      : [];
    
    const newItems = itemsData.map(itemData => ({
      ...itemData,
      uploadedAt: new Date().toISOString(),
    }));
    
    await setDoc(wardrobeRef, {
      [type]: [...currentItems, ...newItems],
    }, { merge: true });
    
    return newItems;
  } catch (error) {
    console.error('Error saving wardrobe items:', error);
    throw error;
  }
};

export const getWardrobe = async (uid) => {
  try {
    const wardrobeDoc = await getDoc(doc(db, 'wardrobe', uid));
    if (wardrobeDoc.exists()) {
      const data = wardrobeDoc.data();
      return {
        topwear: data.topwear || [],
        bottomwear: data.bottomwear || [],
      };
    }
    return { topwear: [], bottomwear: [] };
  } catch (error) {
    console.error('Error getting wardrobe:', error);
    throw error;
  }
};

export const deleteWardrobeItem = async (uid, type, itemUrl) => {
  try {
    const wardrobeRef = doc(db, 'wardrobe', uid);
    const wardrobeDoc = await getDoc(wardrobeRef);
    
    if (wardrobeDoc.exists()) {
      const items = wardrobeDoc.data()[type] || [];
      const updatedItems = items.filter(item => item.url !== itemUrl);
      
      await updateDoc(wardrobeRef, {
        [type]: updatedItems,
      });
    }
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    throw error;
  }
};

// Outfit operations
export const saveOutfit = async (uid, outfitData) => {
  try {
    const outfitId = `outfit_${Date.now()}`;
    const outfitRef = doc(db, 'outfits', uid, 'saved', outfitId);
    
    await setDoc(outfitRef, {
      ...outfitData,
      createdAt: serverTimestamp(),
    });
    
    return outfitId;
  } catch (error) {
    console.error('Error saving outfit:', error);
    throw error;
  }
};

export const getOutfits = async (uid) => {
  try {
    const outfitsRef = collection(db, 'outfits', uid, 'saved');
    const q = query(outfitsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const outfits = [];
    querySnapshot.forEach((doc) => {
      outfits.push({ id: doc.id, ...doc.data() });
    });
    
    return outfits;
  } catch (error) {
    console.error('Error getting outfits:', error);
    throw error;
  }
};

export const deleteOutfit = async (uid, outfitId) => {
  try {
    await deleteDoc(doc(db, 'outfits', uid, 'saved', outfitId));
  } catch (error) {
    console.error('Error deleting outfit:', error);
    throw error;
  }
};
