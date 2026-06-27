export const weather = {
  location: "Adama, Oromia",
  temp: 26,
  condition: "Partly Cloudy",
  humidity: 54,
  wind: 12,
  rainChance: 30,
  forecast: [
    { day: "Mon", icon: "☀️", hi: 28, lo: 14, rain: 5 },
    { day: "Tue", icon: "⛅", hi: 27, lo: 15, rain: 20 },
    { day: "Wed", icon: "🌧️", hi: 24, lo: 16, rain: 70 },
    { day: "Thu", icon: "🌧️", hi: 23, lo: 15, rain: 80 },
    { day: "Fri", icon: "⛅", hi: 25, lo: 14, rain: 30 },
    { day: "Sat", icon: "☀️", hi: 27, lo: 13, rain: 10 },
    { day: "Sun", icon: "☀️", hi: 29, lo: 14, rain: 5 },
  ],
  alerts: [
    { type: "Heavy Rain", level: "High", note: "Expected Wed–Thu. Protect harvested teff." },
    { type: "Pest Outbreak", level: "Medium", note: "Fall armyworm reported nearby. Inspect maize." },
  ],
};

export const markets = ["Addis Ababa", "Adama", "Hawassa", "Dire Dawa", "Bahir Dar", "Mekelle"];

export const listings = [
  { id: "1", crop: "White Teff", qty: "20 quintal", price: "12,300/100kg", location: "Adama", date: "Harvested Oct 12", farmer: "Abebe B.", verified: true, emoji: "🌾" },
  { id: "2", crop: "Red Onion", qty: "500 kg", price: "40/kg", location: "Dire Dawa", date: "Fresh", farmer: "Fatuma A.", verified: true, emoji: "🧅" },
  { id: "3", crop: "Arabica Coffee", qty: "150 kg", price: "420/kg", location: "Hawassa", date: "Sun-dried", farmer: "Tariku M.", verified: false, emoji: "☕" },
  { id: "4", crop: "Maize", qty: "35 quintal", price: "4,100/100kg", location: "Bahir Dar", date: "Harvested Sep 30", farmer: "Genet T.", verified: true, emoji: "🌽" },
];

export const learningCategories = [
  { name: "Crop Production", emoji: "🌱", count: 24 },
  { name: "Livestock", emoji: "🐄", count: 18 },
  { name: "Soil Management", emoji: "🪨", count: 12 },
  { name: "Irrigation", emoji: "💧", count: 9 },
  { name: "Pest Control", emoji: "🐛", count: 15 },
  { name: "Climate Adaptation", emoji: "🌦️", count: 7 },
  { name: "Post-Harvest", emoji: "📦", count: 11 },
  { name: "Agribusiness", emoji: "📈", count: 8 },
];

export const lessons = [
  { id: "1", title: "Controlling Fall Armyworm in Maize", type: "Audio", duration: "8 min", category: "Pest Control", emoji: "🐛" },
  { id: "2", title: "Improving Soil with Compost", type: "Video", duration: "12 min", category: "Soil Management", emoji: "🪱" },
  { id: "3", title: "Best Time to Plant Teff", type: "Article", duration: "5 min", category: "Crop Production", emoji: "🌾" },
  { id: "4", title: "Drip Irrigation on a Budget", type: "Video", duration: "10 min", category: "Irrigation", emoji: "💧" },
  { id: "5", title: "Cattle Vaccination Schedule", type: "Audio", duration: "6 min", category: "Livestock", emoji: "🐄" },
  { id: "6", title: "Drying & Storing Coffee Cherries", type: "Image Guide", duration: "4 min", category: "Post-Harvest", emoji: "☕" },
];

export const experts = [
  { name: "Dr. Hanna Girma", field: "Crop Pathology", rating: 4.9, status: "Online" },
  { name: "Solomon Desta", field: "Livestock & Veterinary", rating: 4.8, status: "Online" },
  { name: "Marta Alemu", field: "Soil & Irrigation", rating: 4.7, status: "Away" },
];

export const advisoryTickets = [
  { id: "AB-204", title: "Yellow spots on coffee leaves", status: "Answered", expert: "Dr. Hanna Girma", date: "2 days ago" },
  { id: "AB-198", title: "Best fertilizer for teff?", status: "In Progress", expert: "Marta Alemu", date: "4 days ago" },
  { id: "AB-187", title: "Cow not eating, weak", status: "Closed", expert: "Solomon Desta", date: "1 week ago" },
];

export const priceTrend = [3900, 4000, 3950, 4100, 4050, 4200, 4150, 4300];

export const communityPosts = [
  { author: "Genet T.", time: "3h", text: "Harvested 35 quintal maize this season thanks to the armyworm tips! 🌽", likes: 42, comments: 8 },
  { author: "Tariku M.", time: "6h", text: "Anyone selling certified teff seed near Hawassa?", likes: 12, comments: 15 },
  { author: "Fatuma A.", time: "1d", text: "Onion prices dropping in Dire Dawa. Hold or sell?", likes: 28, comments: 21 },
];