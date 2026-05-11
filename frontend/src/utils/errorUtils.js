import { toast } from 'react-hot-toast';

/**
 * Centralized error handling for API calls.
 * Extracts the message, shows a toast, and returns the message for local state.
 * 
 * @param {Error} err - The error object from catch
 * @param {string} fallbackMsg - Default message if backend doesn't provide one
 * @returns {string} The formatted error message
 */
export const handleApiError = (err, fallbackMsg = "Something went wrong. Please try again.") => {
    console.error("API Error:", err);
    
    let message = fallbackMsg;
    
    if (err.response?.data) {
        const data = err.response.data;
        
        // If the backend sent a direct 'error' string
        if (data.error) {
            message = data.error;
        } 
        // If it's a Django Rest Framework validation error object
        else if (typeof data === 'object') {
            message = Object.values(data).flat().join(" | ");
        }
    } else if (err.message) {
        message = err.message;
    }

    toast.error(message);
    return message;
};
