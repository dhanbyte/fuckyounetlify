// Global image error handler to suppress 404 errors in production
export const suppressImageErrors = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Suppress image 404 errors in console
    const originalError = console.error;
    console.error = (...args) => {
      // Check if it's an image loading error
      const message = args[0]?.toString() || '';
      if (
        message.includes('404') && 
        (message.includes('image') || message.includes('img') || message.includes('.jpg') || message.includes('.png') || message.includes('.webp'))
      ) {
        // Silently ignore image 404 errors
        return;
      }
      // Log other errors normally
      originalError.apply(console, args);
    };
  }
};

// Call this in your app initialization
if (typeof window !== 'undefined') {
  suppressImageErrors();
}