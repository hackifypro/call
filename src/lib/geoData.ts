import { StateData, CityData } from './types';

export const INDIAN_STATES: StateData[] = [
  { id: 1, name: 'Maharashtra', slug: 'maharashtra', code: 'MH', tier: 1 },
  { id: 2, name: 'Delhi (NCT)', slug: 'delhi', code: 'DL', tier: 1 },
  { id: 3, name: 'Karnataka', slug: 'karnataka', code: 'KA', tier: 1 },
  { id: 4, name: 'Tamil Nadu', slug: 'tamil-nadu', code: 'TN', tier: 1 },
  { id: 5, name: 'Telangana', slug: 'telangana', code: 'TS', tier: 1 },
  { id: 6, name: 'Gujarat', slug: 'gujarat', code: 'GJ', tier: 1 },
  { id: 7, name: 'West Bengal', slug: 'west-bengal', code: 'WB', tier: 1 },
  { id: 8, name: 'Uttar Pradesh', slug: 'uttar-pradesh', code: 'UP', tier: 1 },
  { id: 9, name: 'Haryana', slug: 'haryana', code: 'HR', tier: 2 },
  { id: 10, name: 'Rajasthan', slug: 'rajasthan', code: 'RJ', tier: 2 },
  { id: 11, name: 'Goa', slug: 'goa', code: 'GA', tier: 2 },
  { id: 12, name: 'Punjab', slug: 'punjab', code: 'PB', tier: 2 },
  { id: 13, name: 'Kerala', slug: 'kerala', code: 'KL', tier: 2 },
  { id: 14, name: 'Madhya Pradesh', slug: 'madhya-pradesh', code: 'MP', tier: 2 },
  { id: 15, name: 'Andhra Pradesh', slug: 'andhra-pradesh', code: 'AP', tier: 2 },
  { id: 16, name: 'Chandigarh (UT)', slug: 'chandigarh', code: 'CH', tier: 2 },
  { id: 17, name: 'Uttarakhand', slug: 'uttarakhand', code: 'UK', tier: 2 },
  { id: 18, name: 'Bihar', slug: 'bihar', code: 'BR', tier: 3 },
  { id: 19, name: 'Odisha', slug: 'odisha', code: 'OD', tier: 3 },
  { id: 20, name: 'Assam', slug: 'assam', code: 'AS', tier: 3 },
  { id: 21, name: 'Himachal Pradesh', slug: 'himachal-pradesh', code: 'HP', tier: 3 },
  { id: 22, name: 'Puducherry (UT)', slug: 'puducherry', code: 'PY', tier: 3 },
];

export const INDIAN_CITIES: CityData[] = [
  // Maharashtra
  {
    id: 101,
    stateId: 1,
    stateName: 'Maharashtra',
    stateSlug: 'maharashtra',
    name: 'Mumbai',
    slug: 'mumbai',
    tier: 1,
    latitude: 19.076,
    longitude: 72.8777,
    metaDescription: 'Find verified, cultured, and professional companions in Mumbai for fine dining, business galas, art exhibitions, and city exploration. 100% ID-verified adults.',
    popularAreas: ['Bandra West', 'Colaba', 'Juhu', 'Lower Parel', 'BKC (Bandra Kurla Complex)', 'Powai', 'Worli'],
    nearbyCities: [
      { name: 'Pune', slug: 'pune', stateSlug: 'maharashtra' },
      { name: 'Thane', slug: 'thane', stateSlug: 'maharashtra' },
      { name: 'Navi Mumbai', slug: 'navi-mumbai', stateSlug: 'maharashtra' },
      { name: 'Nashik', slug: 'nashik', stateSlug: 'maharashtra' },
    ],
    isServed: true,
  },
  {
    id: 102,
    stateId: 1,
    stateName: 'Maharashtra',
    stateSlug: 'maharashtra',
    name: 'Pune',
    slug: 'pune',
    tier: 1,
    latitude: 18.5204,
    longitude: 73.8567,
    metaDescription: 'Explore verified adult companions in Pune for intellectual conversations, cafe hopping, literary meets, and cultural festivals. Safe, discreet, and transparent.',
    popularAreas: ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Viman Nagar', 'Aundh', 'Shivajinagar'],
    nearbyCities: [
      { name: 'Mumbai', slug: 'mumbai', stateSlug: 'maharashtra' },
      { name: 'Nashik', slug: 'nashik', stateSlug: 'maharashtra' },
    ],
    isServed: true,
  },
  {
    id: 103,
    stateId: 1,
    stateName: 'Maharashtra',
    stateSlug: 'maharashtra',
    name: 'Nashik',
    slug: 'nashik',
    tier: 2,
    latitude: 19.9975,
    longitude: 73.7898,
    metaDescription: 'Connect with verified adult companions in Nashik for vineyard tours, culinary experiences, social events, and scenic weekend retreats.',
    popularAreas: ['College Road', 'Gangapur Road', 'Indira Nagar', 'Panchavati', 'Mahatma Nagar'],
    nearbyCities: [
      { name: 'Mumbai', slug: 'mumbai', stateSlug: 'maharashtra' },
      { name: 'Pune', slug: 'pune', stateSlug: 'maharashtra' },
      { name: 'Aurangabad', slug: 'aurangabad', stateSlug: 'maharashtra' },
    ],
    isServed: true,
  },
  {
    id: 104,
    stateId: 1,
    stateName: 'Maharashtra',
    stateSlug: 'maharashtra',
    name: 'Nagpur',
    slug: 'nagpur',
    tier: 2,
    latitude: 21.1458,
    longitude: 79.0882,
    metaDescription: 'Verified adult companions in Nagpur for executive networking, dinner companionship, and cultural visits in the Orange City.',
    popularAreas: ['Dharampeth', 'Ramdaspeth', 'Civil Lines', 'Sadar'],
    nearbyCities: [
      { name: 'Pune', slug: 'pune', stateSlug: 'maharashtra' },
    ],
    isServed: false, // Explicit empty state
  },
  {
    id: 105,
    stateId: 1,
    stateName: 'Maharashtra',
    stateSlug: 'maharashtra',
    name: 'Thane',
    slug: 'thane',
    tier: 2,
    latitude: 19.2183,
    longitude: 72.9781,
    metaDescription: 'Premium companions in Thane for lakefront dining, theatre, and social gatherings.',
    popularAreas: ['Majiwada', 'Ghopbunder Road', 'Panchpakhadi'],
    nearbyCities: [{ name: 'Mumbai', slug: 'mumbai', stateSlug: 'maharashtra' }],
    isServed: true,
  },

  // Delhi NCT
  {
    id: 201,
    stateId: 2,
    stateName: 'Delhi (NCT)',
    stateSlug: 'delhi',
    name: 'Delhi',
    slug: 'delhi',
    tier: 1,
    latitude: 28.6139,
    longitude: 77.209,
    metaDescription: 'Discover sophisticated companions in Delhi for heritage walks, embassy dinners, gallery tours, and high-profile networking events. 100% verified adults.',
    popularAreas: ['Connaught Place', 'Hauz Khas Village', 'Vasant Kunj', 'Saket', 'Khan Market', 'Aerocity', 'Defence Colony'],
    nearbyCities: [
      { name: 'Gurugram', slug: 'gurugram', stateSlug: 'haryana' },
      { name: 'Noida', slug: 'noida', stateSlug: 'uttar-pradesh' },
      { name: 'Faridabad', slug: 'faridabad', stateSlug: 'haryana' },
    ],
    isServed: true,
  },

  // Karnataka
  {
    id: 301,
    stateId: 3,
    stateName: 'Karnataka',
    stateSlug: 'karnataka',
    name: 'Bengaluru',
    slug: 'bengaluru',
    tier: 1,
    latitude: 12.9716,
    longitude: 77.5946,
    metaDescription: 'Book intelligent, cosmopolitan companions in Bengaluru for tech meetups, microbrewery visits, networking dinners, and theater evenings in Silicon Valley of India.',
    popularAreas: ['Indiranagar', 'Koramangala', 'UB City / Lavelle Road', 'HSR Layout', 'Whitefield', 'Jayanagar'],
    nearbyCities: [
      { name: 'Mysuru', slug: 'mysuru', stateSlug: 'karnataka' },
      { name: 'Mangaluru', slug: 'mangaluru', stateSlug: 'karnataka' },
    ],
    isServed: true,
  },
  {
    id: 302,
    stateId: 3,
    stateName: 'Karnataka',
    stateSlug: 'karnataka',
    name: 'Mysuru',
    slug: 'mysuru',
    tier: 2,
    latitude: 12.2958,
    longitude: 76.6394,
    metaDescription: 'Verified companions in Mysuru for royal heritage tours, palace festivals, and peaceful conversations.',
    popularAreas: ['Gokulam', 'Jayalakshmipuram', 'Saraswathipuram'],
    nearbyCities: [{ name: 'Bengaluru', slug: 'bengaluru', stateSlug: 'karnataka' }],
    isServed: false,
  },

  // Telangana
  {
    id: 501,
    stateId: 5,
    stateName: 'Telangana',
    stateSlug: 'telangana',
    name: 'Hyderabad',
    slug: 'hyderabad',
    tier: 1,
    latitude: 17.385,
    longitude: 78.4867,
    metaDescription: 'Find verified companions in Hyderabad for royal Nizami dining, corporate retreats, art events, and high-end social dinners in Jubilee Hills & HITEC City.',
    popularAreas: ['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'HITEC City', 'Madhapur', 'Begumpet'],
    nearbyCities: [
      { name: 'Bengaluru', slug: 'bengaluru', stateSlug: 'karnataka' },
    ],
    isServed: true,
  },

  // Gujarat
  {
    id: 601,
    stateId: 6,
    stateName: 'Gujarat',
    stateSlug: 'gujarat',
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    tier: 1,
    latitude: 23.0225,
    longitude: 72.5714,
    metaDescription: 'Verified adult companions in Ahmedabad for cultural evenings, Riverfront strolls, business dinners, and heritage walks. Transparent pricing with 10% platform fee.',
    popularAreas: ['SG Highway', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'Navrangpura', 'Sindhu Bhavan Road'],
    nearbyCities: [
      { name: 'Gandhinagar', slug: 'gandhinagar', stateSlug: 'gujarat' },
      { name: 'Vadodara', slug: 'vadodara', stateSlug: 'gujarat' },
      { name: 'Surat', slug: 'surat', stateSlug: 'gujarat' },
    ],
    isServed: true,
  },
  {
    id: 602,
    stateId: 6,
    stateName: 'Gujarat',
    stateSlug: 'gujarat',
    name: 'Surat',
    slug: 'surat',
    tier: 2,
    latitude: 21.1702,
    longitude: 72.8311,
    metaDescription: 'Companions in Surat for textile business networking and culinary delights.',
    popularAreas: ['Vesu', 'Piplod', 'Adajan'],
    nearbyCities: [{ name: 'Ahmedabad', slug: 'ahmedabad', stateSlug: 'gujarat' }],
    isServed: false,
  },

  // Tamil Nadu
  {
    id: 401,
    stateId: 4,
    stateName: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    name: 'Chennai',
    slug: 'chennai',
    tier: 1,
    latitude: 13.0827,
    longitude: 80.2707,
    metaDescription: 'Verified companions in Chennai for classical music concerts, beach promenade dinners, film festivals, and executive gatherings.',
    popularAreas: ['Nungambakkam', 'Alwarpet', 'Besant Nagar', 'ECR (East Coast Road)', 'Mylapore', 'Anna Nagar'],
    nearbyCities: [
      { name: 'Bengaluru', slug: 'bengaluru', stateSlug: 'karnataka' },
      { name: 'Puducherry', slug: 'puducherry', stateSlug: 'puducherry' },
    ],
    isServed: true,
  },

  // West Bengal
  {
    id: 701,
    stateId: 7,
    stateName: 'West Bengal',
    stateSlug: 'west-bengal',
    name: 'Kolkata',
    slug: 'kolkata',
    tier: 1,
    latitude: 22.5726,
    longitude: 88.3639,
    metaDescription: 'Find cultured companions in Kolkata for literary discussions, fine dining on Park Street, colonial heritage tours, and art exhibitions.',
    popularAreas: ['Park Street', 'Salt Lake City', 'Ballygunge', 'New Town', 'Alipore'],
    nearbyCities: [
      { name: 'Howrah', slug: 'howrah', stateSlug: 'west-bengal' },
    ],
    isServed: true,
  },

  // Haryana (NCR)
  {
    id: 901,
    stateId: 9,
    stateName: 'Haryana',
    stateSlug: 'haryana',
    name: 'Gurugram',
    slug: 'gurugram',
    tier: 1,
    latitude: 28.4595,
    longitude: 77.0266,
    metaDescription: 'Book verified executive companions in Gurugram (Gurgaon) for Cyber Hub dining, corporate networking, golf events, and elite social occasions.',
    popularAreas: ['Cyber Hub / DLF Phase 2', 'Golf Course Road', 'DLF Phase 5', 'Sohna Road', 'Ambience Island'],
    nearbyCities: [
      { name: 'Delhi', slug: 'delhi', stateSlug: 'delhi' },
      { name: 'Noida', slug: 'noida', stateSlug: 'uttar-pradesh' },
    ],
    isServed: true,
  },

  // Uttar Pradesh (NCR)
  {
    id: 801,
    stateId: 8,
    stateName: 'Uttar Pradesh',
    stateSlug: 'uttar-pradesh',
    name: 'Noida',
    slug: 'noida',
    tier: 2,
    latitude: 28.5355,
    longitude: 77.391,
    metaDescription: 'Verified adult companions in Noida for corporate banquets, dining at Sector 18 / Mall of India, and social events.',
    popularAreas: ['Sector 18', 'Sector 62', 'Expressway Sectors', 'Greater Noida Knowledge Park'],
    nearbyCities: [
      { name: 'Delhi', slug: 'delhi', stateSlug: 'delhi' },
      { name: 'Gurugram', slug: 'gurugram', stateSlug: 'haryana' },
    ],
    isServed: true,
  },
  {
    id: 802,
    stateId: 8,
    stateName: 'Uttar Pradesh',
    stateSlug: 'uttar-pradesh',
    name: 'Lucknow',
    slug: 'lucknow',
    tier: 2,
    latitude: 26.8467,
    longitude: 80.9462,
    metaDescription: 'Experience Lucknowi hospitality and Tehzeeb with verified companions for Awadhi culinary tours, historical walks, and royal cultural events.',
    popularAreas: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar'],
    nearbyCities: [
      { name: 'Kanpur', slug: 'kanpur', stateSlug: 'uttar-pradesh' },
    ],
    isServed: true,
  },

  // Rajasthan
  {
    id: 1001,
    stateId: 10,
    stateName: 'Rajasthan',
    stateSlug: 'rajasthan',
    name: 'Jaipur',
    slug: 'jaipur',
    tier: 2,
    latitude: 26.9124,
    longitude: 75.7873,
    metaDescription: 'Verified companions in Jaipur for palace dinners, polo matches, literary festivals, and heritage sightseeing in the Pink City.',
    popularAreas: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Raja Park', 'Civil Lines'],
    nearbyCities: [
      { name: 'Delhi', slug: 'delhi', stateSlug: 'delhi' },
      { name: 'Udaipur', slug: 'udaipur', stateSlug: 'rajasthan' },
    ],
    isServed: true,
  },
  {
    id: 1002,
    stateId: 10,
    stateName: 'Rajasthan',
    stateSlug: 'rajasthan',
    name: 'Udaipur',
    slug: 'udaipur',
    tier: 2,
    latitude: 24.5854,
    longitude: 73.7125,
    metaDescription: 'Companions in Udaipur for Lake Pichola sunset boat tours, royal heritage galas, and art gallery walks.',
    popularAreas: ['Fateh Sagar', 'Lake City Old Area', 'Sukhadia Circle'],
    nearbyCities: [{ name: 'Jaipur', slug: 'jaipur', stateSlug: 'rajasthan' }],
    isServed: false,
  },

  // Goa
  {
    id: 1101,
    stateId: 11,
    stateName: 'Goa',
    stateSlug: 'goa',
    name: 'Goa',
    slug: 'goa',
    tier: 2,
    latitude: 15.2993,
    longitude: 74.124,
    metaDescription: 'Connect with verified companions in Goa for sunset sailing, beachside gourmet dining, electronic music festivals, and tranquil seaside retreats.',
    popularAreas: ['Panaji', 'Candolim', 'Calangute', 'Vagator', 'Assagao', 'Morjim', 'Benaulim'],
    nearbyCities: [
      { name: 'Mumbai', slug: 'mumbai', stateSlug: 'maharashtra' },
      { name: 'Pune', slug: 'pune', stateSlug: 'maharashtra' },
    ],
    isServed: true,
  },

  // Punjab / UT
  {
    id: 1601,
    stateId: 16,
    stateName: 'Chandigarh (UT)',
    stateSlug: 'chandigarh',
    name: 'Chandigarh',
    slug: 'chandigarh',
    tier: 2,
    latitude: 30.7333,
    longitude: 76.7794,
    metaDescription: 'Sophisticated adult companions in Chandigarh for Sukhna Lake walks, sector 17/26 dining, and elite club gatherings.',
    popularAreas: ['Sector 26', 'Sector 35', 'Sukhna Lake Promenade', 'Sector 9'],
    nearbyCities: [
      { name: 'Delhi', slug: 'delhi', stateSlug: 'delhi' },
      { name: 'Ludhiana', slug: 'ludhiana', stateSlug: 'punjab' },
    ],
    isServed: true,
  },

  // Kerala
  {
    id: 1301,
    stateId: 13,
    stateName: 'Kerala',
    stateSlug: 'kerala',
    name: 'Kochi',
    slug: 'kochi',
    tier: 2,
    latitude: 9.9312,
    longitude: 76.2673,
    metaDescription: 'Verified companions in Kochi for Fort Kochi art biennales, harbor cruises, and coastal culinary experiences.',
    popularAreas: ['Fort Kochi', 'Marine Drive', 'Panampilly Nagar', 'Kakkanad'],
    nearbyCities: [{ name: 'Bengaluru', slug: 'bengaluru', stateSlug: 'karnataka' }],
    isServed: false, // Explicit empty state to prove truth in advertising
  },
];

export function getCitiesByStateSlug(stateSlug: string): CityData[] {
  return INDIAN_CITIES.filter((c) => c.stateSlug.toLowerCase() === stateSlug.toLowerCase());
}

export function getCityBySlug(stateSlug: string, citySlug: string): CityData | undefined {
  return INDIAN_CITIES.find(
    (c) =>
      c.stateSlug.toLowerCase() === stateSlug.toLowerCase() &&
      c.slug.toLowerCase() === citySlug.toLowerCase()
  );
}

export function getAllServedCities(): CityData[] {
  return INDIAN_CITIES.filter((c) => c.isServed);
}
