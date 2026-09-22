/* ============================================
   MacroSpots — Mock Restaurant Database
   Real Canadian fast food nutrition data
   With lat/lng for map plotting (Toronto area)
   ============================================ */

export const restaurants = [
  {
    id: 'mcdonalds',
    name: "McDonald's",
    emoji: '🍟',
    category: 'fries',
    cuisine: 'Fast Food',
    distance: '0.3 km',
    lat: 43.6532,
    lng: -79.3832,
    driveThru: true,
    items: [
      { id: 'mc-1', name: 'Big Mac', calories: 590, protein: 25, carbs: 46, fat: 34, dietaryTags: [], allergens: ['gluten','dairy','sesame'], modifications: [{ name: 'No Sauce', calDiff: -90, protDiff: 0, carbDiff: -3, fatDiff: -9 }, { name: 'No Cheese', calDiff: -50, protDiff: -3, carbDiff: -1, fatDiff: -4 }, { name: 'Lettuce Wrap', calDiff: -150, protDiff: 0, carbDiff: -40, fatDiff: -3 }] },
      { id: 'mc-2', name: 'McChicken', calories: 400, protein: 15, carbs: 40, fat: 21, dietaryTags: [], allergens: ['gluten','egg'], modifications: [{ name: 'No Mayo', calDiff: -80, protDiff: 0, carbDiff: 0, fatDiff: -9 }] },
      { id: 'mc-3', name: 'Egg McMuffin', calories: 310, protein: 17, carbs: 30, fat: 13, dietaryTags: [], allergens: ['gluten','dairy','egg'], modifications: [{ name: 'No Cheese', calDiff: -50, protDiff: -3, carbDiff: 0, fatDiff: -4 }] },
      { id: 'mc-4', name: 'Grilled Chicken Wrap (Snack)', calories: 330, protein: 28, carbs: 27, fat: 12, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Sauce', calDiff: -60, protDiff: 0, carbDiff: -2, fatDiff: -6 }] },
      { id: 'mc-5', name: 'McDouble', calories: 400, protein: 22, carbs: 34, fat: 20, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Cheese', calDiff: -50, protDiff: -3, carbDiff: 0, fatDiff: -4 }, { name: 'No Bun', calDiff: -120, protDiff: -2, carbDiff: -30, fatDiff: -2 }] },
      { id: 'mc-6', name: '6pc Chicken McNuggets', calories: 270, protein: 16, carbs: 16, fat: 16, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'mc-7', name: '10pc Chicken McNuggets', calories: 450, protein: 27, carbs: 27, fat: 27, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'mc-8', name: 'Filet-O-Fish', calories: 390, protein: 16, carbs: 39, fat: 19, dietaryTags: [], allergens: ['gluten','dairy','fish'], modifications: [{ name: 'No Tartar Sauce', calDiff: -70, protDiff: 0, carbDiff: -1, fatDiff: -7 }] },
    ]
  },
  {
    id: 'aw',
    name: 'A&W',
    emoji: '🍔',
    category: 'burger',
    cuisine: 'Fast Food',
    distance: '0.8 km',
    lat: 43.6485,
    lng: -79.3960,
    driveThru: true,
    items: [
      { id: 'aw-1', name: 'Teen Burger', calories: 500, protein: 28, carbs: 38, fat: 27, dietaryTags: [], allergens: ['gluten','dairy','egg'], modifications: [{ name: 'No Mayo', calDiff: -90, protDiff: 0, carbDiff: 0, fatDiff: -10 }, { name: 'No Cheese', calDiff: -50, protDiff: -3, carbDiff: 0, fatDiff: -4 }] },
      { id: 'aw-2', name: 'Mama Burger', calories: 430, protein: 24, carbs: 37, fat: 22, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Mayo', calDiff: -90, protDiff: 0, carbDiff: 0, fatDiff: -10 }] },
      { id: 'aw-3', name: 'Grilled Chicken Burger', calories: 400, protein: 32, carbs: 35, fat: 14, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Mayo', calDiff: -90, protDiff: 0, carbDiff: 0, fatDiff: -10 }, { name: 'Light Cheese', calDiff: -25, protDiff: -1, carbDiff: 0, fatDiff: -2 }] },
      { id: 'aw-4', name: 'Beyond Meat Burger', calories: 500, protein: 22, carbs: 48, fat: 25, dietaryTags: ['vegetarian'], allergens: ['gluten','soy'], modifications: [{ name: 'No Mayo', calDiff: -90, protDiff: 0, carbDiff: 0, fatDiff: -10 }] },
      { id: 'aw-5', name: 'Chicken Buddy Burger', calories: 370, protein: 20, carbs: 35, fat: 16, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'aw-6', name: 'Chubby Chicken Burger', calories: 640, protein: 35, carbs: 52, fat: 32, dietaryTags: [], allergens: ['gluten','dairy','egg'], modifications: [{ name: 'No Mayo', calDiff: -90, protDiff: 0, carbDiff: 0, fatDiff: -10 }] },
    ]
  },
  {
    id: 'timhortons',
    name: 'Tim Hortons',
    emoji: '☕',
    category: 'coffee',
    cuisine: 'Cafe',
    distance: '0.5 km',
    lat: 43.6510,
    lng: -79.3790,
    driveThru: true,
    items: [
      { id: 'th-1', name: 'Turkey Bacon Club Wrap', calories: 340, protein: 24, carbs: 32, fat: 13, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Cheese', calDiff: -40, protDiff: -2, carbDiff: 0, fatDiff: -3 }] },
      { id: 'th-2', name: 'Grilled Chicken BLT Wrap', calories: 370, protein: 28, carbs: 30, fat: 15, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Mayo', calDiff: -70, protDiff: 0, carbDiff: 0, fatDiff: -7 }] },
      { id: 'th-3', name: 'Harvest Chicken Soup (L)', calories: 240, protein: 16, carbs: 30, fat: 6, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'th-4', name: 'Turkey Sausage Breakfast Sandwich', calories: 340, protein: 19, carbs: 31, fat: 15, dietaryTags: [], allergens: ['gluten','dairy','egg'], modifications: [{ name: 'No Cheese', calDiff: -40, protDiff: -2, carbDiff: 0, fatDiff: -3 }] },
      { id: 'th-5', name: 'Everything Bagel w/ Cream Cheese', calories: 370, protein: 12, carbs: 52, fat: 12, dietaryTags: ['vegetarian'], allergens: ['gluten','dairy','sesame'], modifications: [{ name: 'Light Cream Cheese', calDiff: -50, protDiff: -1, carbDiff: -1, fatDiff: -5 }] },
      { id: 'th-6', name: 'Chili', calories: 300, protein: 20, carbs: 32, fat: 10, dietaryTags: [], allergens: ['gluten'], modifications: [] },
    ]
  },
  {
    id: 'subway',
    name: 'Subway',
    emoji: '🥖',
    category: 'sub',
    cuisine: 'Subs',
    distance: '1.1 km',
    lat: 43.6450,
    lng: -79.3885,
    driveThru: false,
    items: [
      { id: 'sub-1', name: '6" Turkey Breast', calories: 280, protein: 18, carbs: 40, fat: 4, dietaryTags: [], allergens: ['gluten'], modifications: [{ name: 'Add Cheese', calDiff: 40, protDiff: 2, carbDiff: 0, fatDiff: 3 }, { name: 'Add Avocado', calDiff: 60, protDiff: 1, carbDiff: 3, fatDiff: 5 }] },
      { id: 'sub-2', name: '6" Chicken Breast', calories: 320, protein: 24, carbs: 40, fat: 5, dietaryTags: [], allergens: ['gluten'], modifications: [{ name: 'Add Cheese', calDiff: 40, protDiff: 2, carbDiff: 0, fatDiff: 3 }] },
      { id: 'sub-3', name: '6" Veggie Delite', calories: 210, protein: 8, carbs: 38, fat: 2, dietaryTags: ['vegetarian','vegan'], allergens: ['gluten'], modifications: [{ name: 'Add Cheese', calDiff: 40, protDiff: 2, carbDiff: 0, fatDiff: 3 }] },
      { id: 'sub-4', name: '6" Steak & Cheese', calories: 380, protein: 26, carbs: 42, fat: 10, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Cheese', calDiff: -40, protDiff: -2, carbDiff: 0, fatDiff: -3 }] },
      { id: 'sub-5', name: '6" Italian BMT', calories: 360, protein: 17, carbs: 41, fat: 14, dietaryTags: [], allergens: ['gluten'], modifications: [{ name: 'No Mayo', calDiff: -80, protDiff: 0, carbDiff: 0, fatDiff: -9 }] },
      { id: 'sub-6', name: 'Protein Bowl - Chicken', calories: 200, protein: 22, carbs: 10, fat: 4, dietaryTags: ['low-carb'], allergens: [], modifications: [{ name: 'Add Avocado', calDiff: 60, protDiff: 1, carbDiff: 3, fatDiff: 5 }] },
    ]
  },
  {
    id: 'popeyes',
    name: 'Popeyes',
    emoji: '🍗',
    category: 'chicken',
    cuisine: 'Fast Food',
    distance: '1.5 km',
    lat: 43.6570,
    lng: -79.3920,
    driveThru: true,
    items: [
      { id: 'pop-1', name: 'Chicken Sandwich', calories: 700, protein: 28, carbs: 50, fat: 42, dietaryTags: [], allergens: ['gluten','egg'], modifications: [{ name: 'No Mayo', calDiff: -100, protDiff: 0, carbDiff: 0, fatDiff: -11 }] },
      { id: 'pop-2', name: '3pc Chicken Tenders', calories: 340, protein: 23, carbs: 17, fat: 20, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'pop-3', name: '5pc Chicken Tenders', calories: 570, protein: 38, carbs: 28, fat: 33, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'pop-4', name: 'Blackened Chicken Sandwich', calories: 480, protein: 35, carbs: 41, fat: 18, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Mayo', calDiff: -100, protDiff: 0, carbDiff: 0, fatDiff: -11 }] },
      { id: 'pop-5', name: 'Cajun Rice (Regular)', calories: 170, protein: 7, carbs: 22, fat: 6, dietaryTags: [], allergens: [], modifications: [] },
    ]
  },
  {
    id: 'wendys',
    name: "Wendy's",
    emoji: '🍔',
    category: 'burger',
    cuisine: 'Fast Food',
    distance: '0.9 km',
    lat: 43.6555,
    lng: -79.3810,
    driveThru: true,
    items: [
      { id: 'wen-1', name: 'Jr. Bacon Cheeseburger', calories: 380, protein: 20, carbs: 27, fat: 21, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Cheese', calDiff: -50, protDiff: -3, carbDiff: 0, fatDiff: -4 }] },
      { id: 'wen-2', name: 'Grilled Chicken Sandwich', calories: 370, protein: 34, carbs: 36, fat: 10, dietaryTags: [], allergens: ['gluten'], modifications: [{ name: 'No Mayo', calDiff: -80, protDiff: 0, carbDiff: 0, fatDiff: -9 }] },
      { id: 'wen-3', name: "Dave's Single", calories: 570, protein: 29, carbs: 39, fat: 33, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [{ name: 'No Cheese', calDiff: -50, protDiff: -3, carbDiff: 0, fatDiff: -4 }, { name: 'No Bun', calDiff: -150, protDiff: -3, carbDiff: -30, fatDiff: -3 }] },
      { id: 'wen-4', name: '10pc Spicy Chicken Nuggets', calories: 470, protein: 27, carbs: 27, fat: 28, dietaryTags: [], allergens: ['gluten'], modifications: [] },
      { id: 'wen-5', name: 'Apple Pecan Chicken Salad (half)', calories: 290, protein: 21, carbs: 22, fat: 14, dietaryTags: [], allergens: ['tree nuts','dairy'], modifications: [] },
    ]
  },
  {
    id: 'tacobell',
    name: 'Taco Bell',
    emoji: '🌮',
    category: 'taco',
    cuisine: 'Mexican',
    distance: '1.3 km',
    lat: 43.6478,
    lng: -79.3745,
    driveThru: true,
    items: [
      { id: 'tb-1', name: 'Crunchy Taco Supreme', calories: 190, protein: 9, carbs: 14, fat: 11, dietaryTags: [], allergens: ['dairy'], modifications: [{ name: 'No Sour Cream', calDiff: -30, protDiff: 0, carbDiff: -1, fatDiff: -3 }] },
      { id: 'tb-2', name: 'Chicken Soft Taco', calories: 180, protein: 12, carbs: 17, fat: 7, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [] },
      { id: 'tb-3', name: 'Bean Burrito', calories: 350, protein: 13, carbs: 54, fat: 9, dietaryTags: ['vegetarian'], allergens: ['gluten'], modifications: [{ name: 'No Cheese', calDiff: -40, protDiff: -2, carbDiff: 0, fatDiff: -3 }] },
      { id: 'tb-4', name: 'Power Menu Bowl - Chicken', calories: 470, protein: 26, carbs: 46, fat: 20, dietaryTags: [], allergens: ['dairy'], modifications: [{ name: 'No Sour Cream', calDiff: -30, protDiff: 0, carbDiff: -1, fatDiff: -3 }] },
      { id: 'tb-5', name: 'Soft Taco - Shredded Chicken', calories: 170, protein: 11, carbs: 16, fat: 7, dietaryTags: [], allergens: ['gluten'], modifications: [] },
    ]
  },
  {
    id: 'pizzapizza',
    name: 'Pizza Pizza',
    emoji: '🍕',
    category: 'pizza',
    cuisine: 'Pizza',
    distance: '1.0 km',
    lat: 43.6600,
    lng: -79.3900,
    driveThru: false,
    items: [
      { id: 'pp-1', name: '2 Slices - Cheese', calories: 480, protein: 22, carbs: 56, fat: 18, dietaryTags: ['vegetarian'], allergens: ['gluten','dairy'], modifications: [] },
      { id: 'pp-2', name: '2 Slices - Chicken Bacon Ranch', calories: 560, protein: 30, carbs: 54, fat: 24, dietaryTags: [], allergens: ['gluten','dairy'], modifications: [] },
      { id: 'pp-3', name: 'Grilled Chicken Caesar Salad', calories: 340, protein: 28, carbs: 14, fat: 19, dietaryTags: [], allergens: ['gluten','dairy','egg'], modifications: [{ name: 'Light Dressing', calDiff: -90, protDiff: 0, carbDiff: -2, fatDiff: -10 }] },
      { id: 'pp-4', name: 'Personal Veggie Pizza', calories: 620, protein: 24, carbs: 82, fat: 20, dietaryTags: ['vegetarian'], allergens: ['gluten','dairy'], modifications: [] },
      { id: 'pp-5', name: 'Dip - Garlic (side)', calories: 90, protein: 0, carbs: 1, fat: 10, dietaryTags: ['vegetarian'], allergens: ['dairy'], modifications: [] },
    ]
  },
  {
    id: 'freshii',
    name: 'Freshii',
    emoji: '🥗',
    category: 'bowl',
    cuisine: 'Healthy Bowls',
    distance: '1.4 km',
    lat: 43.6440,
    lng: -79.3960,
    driveThru: false,
    items: [
      { id: 'fr-1', name: 'Energize Bowl - Chicken', calories: 460, protein: 34, carbs: 48, fat: 15, dietaryTags: [], allergens: [], modifications: [{ name: 'Light Dressing', calDiff: -70, protDiff: 0, carbDiff: -1, fatDiff: -8 }] },
      { id: 'fr-2', name: 'Burrito Bowl - Tofu', calories: 420, protein: 20, carbs: 58, fat: 12, dietaryTags: ['vegan','vegetarian'], allergens: ['soy'], modifications: [] },
      { id: 'fr-3', name: 'Protein Power Salad - Chicken', calories: 380, protein: 36, carbs: 24, fat: 15, dietaryTags: [], allergens: [], modifications: [{ name: 'Light Dressing', calDiff: -70, protDiff: 0, carbDiff: -1, fatDiff: -8 }] },
      { id: 'fr-4', name: 'Rainbow Rice Bowl (Vegan)', calories: 390, protein: 12, carbs: 62, fat: 10, dietaryTags: ['vegan','vegetarian'], allergens: [], modifications: [] },
      { id: 'fr-5', name: 'Superfood Smoothie', calories: 220, protein: 8, carbs: 44, fat: 3, dietaryTags: ['vegetarian'], allergens: ['dairy'], modifications: [] },
    ]
  }
];
