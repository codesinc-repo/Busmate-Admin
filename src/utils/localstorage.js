// utils/localStorage.js

export function storeUserToLocalStorage(user) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user to local storage:', error);
    }
  }
  
  export function getUserFromLocalStorage() {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error retrieving user from local storage:', error);
      return null;
    }
  }

  