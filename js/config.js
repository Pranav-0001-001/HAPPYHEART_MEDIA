/**
 * HAPPY HEART MEDIA — Client Configuration
 * Single point of configuration for API endpoints & external contacts.
 */

// Base API URL:
// - Leave as '' (empty string) when running monolithic Node + static frontend on same domain.
// - Set to your Render backend (e.g., 'https://happyheart-media.onrender.com') when hosting static files on Cloudflare Pages / Vercel.
// TODO: Update this if hosting frontend statically on Cloudflare Pages
window.API_BASE_URL = window.API_BASE_URL || '';

// WhatsApp Configuration:
// TODO: Replace with your actual WhatsApp phone number in international format without + or spaces (e.g., '15551234567')
window.HHM_CONFIG = {
  whatsappNumber: '15551234567', // TODO: Set your actual WhatsApp number
  contactEmail: 'contact@happyheartmedia.com', // TODO: Set your actual contact email
  instagramHandle: 'HAPPYHEART_MEDIA',
  frontendDomain: 'https://happyheartmedia.com' // TODO: Set your custom front-end domain
};
