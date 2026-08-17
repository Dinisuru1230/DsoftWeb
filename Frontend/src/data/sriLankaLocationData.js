export const SRI_LANKA_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'North Central Province',
  'Uva Province',
  'Northern Province',
  'Eastern Province',
];

export const SRI_LANKA_CITIES_BY_PROVINCE = {
  'Western Province': [
    'Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Colombo 06', 'Colombo 07', 'Colombo 08', 'Colombo 09', 'Colombo 10', 'Colombo 11', 'Colombo 12', 'Colombo 13', 'Colombo 14', 'Colombo 15',
    'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Sri Jayawardenepura Kotte', 'Maharagama', 'Kaduwela', 'Malabe', 'Battaramulla', 'Nugegoda', 'Piliyandala', 'Homagama', 'Rajagiriya',
    'Gampaha', 'Negombo', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Kadawatha', 'Minuwangoda', 'Nittambuwa',
    'Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Matugama',
  ],
  'Central Province': [
    'Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya', 'Kundasale',
    'Matale', 'Dambulla', 'Sigiriya', 'Ukuwela',
    'Nuwara Eliya', 'Hatton', 'Talawakele', 'Ragala',
  ],
  'Southern Province': [
    'Galle', 'Hikkaduwa', 'Ambalangoda', 'Elpitiya', 'Karapitiya',
    'Matara', 'Weligama', 'Dikwella', 'Akuressa',
    'Hambantota', 'Tangalle', 'Tissamaharama', 'Beliatta',
  ],
  'North Western Province': [
    'Kurunegala', 'Kuliyapitiya', 'Pannala', 'Mawathagama', 'Wariyapola',
    'Puttalam', 'Chilaw', 'Wennappuwa', 'Marawila',
  ],
  'Sabaragamuwa Province': [
    'Ratnapura', 'Balangoda', 'Eheliyagoda', 'Pelmadulla',
    'Kegalle', 'Mawanella', 'Rambukkana', 'Ruwanwella',
  ],
  'North Central Province': [
    'Anuradhapura', 'Kekirawa', 'Eppawala', 'Medawachchiya',
    'Polonnaruwa', 'Kaduruwela', 'Hingurakgoda',
  ],
  'Uva Province': [
    'Badulla', 'Bandarawela', 'Haputale', 'Diyatalawa', 'Welimada',
    'Monaragala', 'Wellawaya', 'Bibile',
  ],
  'Northern Province': [
    'Jaffna', 'Chavakachcheri', 'Point Pedro', 'Nallur',
    'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
  ],
  'Eastern Province': [
    'Trincomalee', 'Kantalai',
    'Batticaloa', 'Eravur', 'Kattankudy',
    'Ampara', 'Kalmunai', 'Samanthurai',
  ],
};

// All cities list for flat dropdowns
export const ALL_SRI_LANKA_CITIES = Array.from(
  new Set(Object.values(SRI_LANKA_CITIES_BY_PROVINCE).flat())
).sort();
