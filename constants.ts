
import { SectionType, Subject } from './types';

export const SYLLABUS: Subject[] = [
  {
    id: 'english',
    name: 'English Language',
    section: SectionType.ENGLISH,
    icon: '📚',
    topics: [
      { id: 'spotting-errors', name: 'Spotting Errors', description: 'Identify grammatical errors in sentences' },
      { id: 'antonyms', name: 'Antonyms', description: 'Choose the word opposite in meaning' },
      { id: 'synonyms', name: 'Synonyms', description: 'Choose the word similar in meaning' },
      { id: 'idioms-phrases', name: 'Idioms & Phrases', description: 'Meaning and usage of idioms' },
      { id: 'ordering-of-words', name: 'Ordering of Words', description: 'Arrange jumbled parts (P, Q, R, S) within a sentence' },
      { id: 'ordering-of-sentences', name: 'Ordering of Sentences', description: 'Logical arrangement of sentences into a paragraph' },
      { id: 'fill-in-the-blanks', name: 'Fill in the Blanks', description: 'Grammar and vocabulary based fillers' },
      { id: 'cloze-composition', name: 'Cloze Composition', description: 'Passage with blanks to be filled' },
      { id: 'reading-comprehension', name: 'Reading Comprehension', description: 'Passage analysis and inference' },
      { id: 'parts-of-speech', name: 'Parts of Speech', description: 'Identify Noun, Pronoun, Adverb, etc. of specific words' },
      { id: 'word-meaning', name: 'Word Meaning', description: 'Contextual meaning of specific words' },
      { id: 'prepositions-determiners', name: 'Prepositions & Determiners', description: 'Specific usage of grammar particles' },
      { id: 'completion-of-sentence', name: 'Completion of Sentence', description: 'Complete the sentence logically' }
    ]
  },
  {
    id: 'maths',
    name: 'Elementary Mathematics',
    section: SectionType.MATHEMATICS,
    icon: '📐',
    topics: [
      { id: 'number-system', name: 'Number System', description: 'Divisibility, remainders, and properties' },
      { id: 'algebra', name: 'Algebra', description: 'Polynomials, Linear/Quadratic Equations, Sets' },
      { id: 'trigonometry', name: 'Trigonometry', description: 'Identities, Heights & Distances' },
      { id: 'geometry', name: 'Geometry', description: 'Triangles, Circles, Lines & Angles' },
      { id: 'mensuration', name: 'Mensuration', description: 'Area (2D) and Volume (3D)' },
      { id: 'statistics', name: 'Statistics', description: 'Mean, Median, Mode, Data Interpretation' },
      { id: 'percentage', name: 'Percentage', description: 'Calculations based on parts of a hundred' },
      { id: 'profit-loss', name: 'Profit & Loss', description: 'Commercial mathematics' },
      { id: 'simple-compound-interest', name: 'SI & CI', description: 'Interest calculations' },
      { id: 'ratio-proportion', name: 'Ratio & Proportion', description: 'Comparison of quantities' },
      { id: 'time-work', name: 'Time & Work', description: 'Efficiency and work days' },
      { id: 'time-speed-distance', name: 'Time, Speed & Distance', description: 'Relative speed, trains, boats' },
      { id: 'logarithms', name: 'Logarithms', description: 'Basic properties and calculations' }
    ]
  },
  {
    id: 'gk_general_science',
    name: 'General Science',
    section: SectionType.GK,
    icon: '🔬',
    categories: [
         {
             id: 'physics',
             name: 'Physics',
             topics: [
                 { id: 'mechanics', name: 'Mechanics', description: 'Motion, Force, Newton\'s Laws' },
                 { id: 'optics', name: 'Optics', description: 'Light, Mirrors, Lenses' },
                 { id: 'electricity-magnetism', name: 'Electricity & Magnetism', description: 'Circuits, Current, Magnetic Effects' },
                 { id: 'thermodynamics', name: 'Heat & Thermodynamics', description: 'Temperature, Heat transfer' },
                 { id: 'sound-waves', name: 'Sound & Waves', description: 'Properties of sound, wave motion' },
                 { id: 'properties-of-matter', name: 'Properties of Matter', description: 'Elasticity, Surface Tension, Viscosity' }
             ]
         },
         {
             id: 'chemistry',
             name: 'Chemistry',
             topics: [
                 { id: 'atomic-structure', name: 'Atomic Structure', description: 'Atoms, Molecules, Isotopes' },
                 { id: 'acids-bases-salts', name: 'Acids, Bases & Salts', description: 'pH scale, chemical properties' },
                 { id: 'metals-nonmetals', name: 'Metals & Non-Metals', description: 'Properties and reactivity series' },
                 { id: 'carbon-compounds', name: 'Carbon & its Compounds', description: 'Organic chemistry basics' },
                 { id: 'chemical-reactions', name: 'Chemical Reactions', description: 'Types of reactions, oxidation-reduction' },
                 { id: 'everyday-chemistry', name: 'Chemistry in Everyday Life', description: 'Soaps, Glass, Polymers, Fuels' }
             ]
         },
         {
             id: 'biology',
             name: 'Biology',
             topics: [
                 { id: 'cell-biology', name: 'Cell Biology', description: 'Structure of cell, DNA, RNA' },
                 { id: 'human-physiology', name: 'Human Physiology', description: 'Digestive, Respiratory, Circulatory systems' },
                 { id: 'diseases-nutrition', name: 'Diseases & Nutrition', description: 'Vitamins, deficiency, pathogens' },
                 { id: 'plant-physiology', name: 'Plant Physiology', description: 'Photosynthesis, plant parts' },
                 { id: 'genetics-evolution', name: 'Genetics & Evolution', description: 'Heredity and origin of life' }
             ]
         }
    ]
  },
  {
    id: 'gk_history',
    name: 'History',
    section: SectionType.GK,
    icon: '🏛️',
    categories: [
      {
        id: 'ancient-history',
        name: 'Ancient History',
        topics: [
          { id: 'ivc', name: 'Indus Valley Civilization', description: 'Urban planning and Harappan culture' },
          { id: 'vedic-age', name: 'Vedic Age', description: 'Society, religion, and the Vedas' },
          { id: 'religious-movements', name: 'Buddhism & Jainism', description: 'Teachings and Councils' },
          { id: 'mauryan-gupta', name: 'Mauryan & Gupta Empires', description: 'Administration and Golden Age' }
        ]
      },
      {
        id: 'medieval-history',
        name: 'Medieval History',
        topics: [
          { id: 'delhi-sultanate', name: 'Delhi Sultanate', description: 'Slave to Lodi dynasties' },
          { id: 'mughal-empire', name: 'Mughal Empire', description: 'Administration, Art, and Architecture' },
          { id: 'vijayanagara', name: 'Vijayanagara Empire', description: 'South Indian Polity' }
        ]
      },
      {
        id: 'modern-history',
        name: 'Modern History',
        topics: [
          { id: 'advent-europeans', name: 'Advent of Europeans', description: 'Portuguese, British, French' },
          { id: 'revolt-1857', name: 'Revolt of 1857', description: 'Causes and Consequences' },
          { id: 'socio-religious', name: 'Socio-Religious Reforms', description: 'Raja Ram Mohan Roy, etc.' }
        ]
      },
      {
        id: 'national-movement',
        name: 'Indian National Movement',
        topics: [
          { id: 'inc-phase', name: 'INC Phases (Moderate/Extremist)', description: 'Congress ideology' },
          { id: 'gandhian-era', name: 'Gandhian Era', description: 'NCM, CDM, Quit India' },
          { id: 'independence-partition', name: 'Partition & Independence', description: 'Cabinet Mission, Mountbatten Plan' }
        ]
      }
    ]
  },
  {
    id: 'gk_geography',
    name: 'Geography',
    section: SectionType.GK,
    icon: '🌍',
    categories: [
      {
        id: 'physical-geography',
        name: 'Physical Geography',
        topics: [
          { id: 'geo-solar-system', name: 'Solar System & Evolution', description: 'Planets, Earth origin, Geological Time Scale' },
          { id: 'geo-interior', name: 'Interior of the Earth', description: 'Crust, Mantle, Core, Discontinuities' },
          { id: 'geo-rocks', name: 'Rocks & Rock Cycle', description: 'Igneous, Sedimentary, Metamorphic rocks' },
          { id: 'geo-tectonics', name: 'Plate Tectonics & Drift', description: 'Continental Drift, Plates, Boundaries' },
          { id: 'geo-volcanoes', name: 'Volcanism & Earthquakes', description: 'Volcano types, Earthquake waves, Zones' },
          { id: 'geo-landforms', name: 'Geomorphic Landforms', description: 'Fluvial, Glacial, Aeolian, Karst features' },
          { id: 'geo-atmosphere', name: 'Atmosphere Composition', description: 'Layers, Composition, Insolation, Heat Budget' },
          { id: 'geo-winds', name: 'Winds & Pressure Belts', description: 'Planetary winds, Coriolis force, Jet Streams' },
          { id: 'geo-cyclones', name: 'Cyclones & Fronts', description: 'Tropical/Temperate Cyclones, Humidity' },
          { id: 'geo-ocean-relief', name: 'Ocean Relief & Salinity', description: 'Ocean floor, Salinity distribution' },
          { id: 'geo-currents', name: 'Ocean Currents & Tides', description: 'Atlantic/Pacific/Indian currents, Tides' },
          { id: 'geo-climate-zones', name: 'World Climatic Zones', description: 'Koppen classification, Biomes' }
        ]
      },
      {
        id: 'indian-geography',
        name: 'Indian Geography',
        topics: [
          { id: 'ind-physio-north', name: 'Physiography: Himalayas', description: 'Ranges, Passes, Glaciers' },
          { id: 'ind-physio-plains', name: 'Physiography: Great Plains', description: 'Bhabar, Terai, Bhangar, Khadar' },
          { id: 'ind-physio-plateau', name: 'Physiography: Plateau', description: 'Deccan, Central Highlands, Hills' },
          { id: 'ind-physio-coast', name: 'Coastal Plains & Islands', description: 'Coasts, Andaman & Nicobar, Lakshadweep' },
          { id: 'ind-river-himal', name: 'Rivers: Himalayan System', description: 'Indus, Ganga, Brahmaputra systems' },
          { id: 'ind-river-penin', name: 'Rivers: Peninsular System', description: 'Godavari, Krishna, Kaveri, Mahanadi' },
          { id: 'ind-monsoon', name: 'Climate & Monsoons', description: 'Mechanism, Seasons, Rainfall patterns' },
          { id: 'ind-soils', name: 'Soils of India', description: 'Alluvial, Black, Red, Laterite, Conservation' },
          { id: 'ind-forests', name: 'Natural Vegetation', description: 'Forest types, Wildlife Sanctuaries, Biospheres' },
          { id: 'ind-agri', name: 'Agriculture & Crops', description: 'Rabi/Kharif, Major crops, Green Revolution' },
          { id: 'ind-minerals', name: 'Mineral Resources', description: 'Iron, Coal, Manganese, Bauxite belts' },
          { id: 'ind-transport', name: 'Transport & Infrastructure', description: 'Railways, NH, Ports, Inland Waterways' }
        ]
      },
      {
        id: 'world-geography',
        name: 'World Geography',
        topics: [
          { id: 'world-asia', name: 'Continent: Asia', description: 'Physical features, Straits, Deserts' },
          { id: 'world-africa', name: 'Continent: Africa', description: 'Rift Valley, Rivers, Savanna' },
          { id: 'world-namerica', name: 'Continent: North America', description: 'Lakes, Prairies, Mountains' },
          { id: 'world-samerica', name: 'Continent: South America', description: 'Amazon, Andes, Pampas' },
          { id: 'world-europe', name: 'Continent: Europe', description: 'Peninsulas, Rivers, Alps' },
          { id: 'world-aus', name: 'Continent: Australia', description: 'Great Barrier Reef, Deserts' },
          { id: 'world-economic', name: 'Economic Geography', description: 'Global transport, Resources, Industry' }
        ]
      }
    ]
  },
  {
    id: 'gk_polity',
    name: 'Indian Polity',
    section: SectionType.GK,
    icon: '⚖️',
    topics: [
      { id: 'constitution-preamble', name: 'Constitution & Preamble', description: 'Features and philosophy' },
      { id: 'fr-dpsp-fd', name: 'FR, DPSP & Fundamental Duties', description: 'Rights and State Guidelines' },
      { id: 'parliament', name: 'Parliament', description: 'Lok Sabha, Rajya Sabha, Procedures' },
      { id: 'judiciary', name: 'Judiciary', description: 'Supreme Court & High Courts' },
      { id: 'constitutional-bodies', name: 'Constitutional Bodies', description: 'UPSC, EC, CAG' },
      { id: 'panchayati-raj', name: 'Panchayati Raj', description: 'Local Self Government' }
    ]
  },
  {
    id: 'gk_economy',
    name: 'Indian Economy',
    section: SectionType.GK,
    icon: '💹',
    topics: [
      { id: 'national-income', name: 'National Income & Inflation', description: 'GDP, CPI, WPI' },
      { id: 'banking-monetary', name: 'Banking & Monetary Policy', description: 'RBI functions, Repo Rate' },
      { id: 'budget-taxation', name: 'Budget & Fiscal Policy', description: 'Taxation, Deficits, GST' },
      { id: 'poverty-unemployment', name: 'Poverty & Unemployment', description: 'Schemes and Indices' }
    ]
  },
  {
    id: 'gk_current_affairs',
    name: 'Current Affairs',
    section: SectionType.GK,
    icon: '📰',
    topics: [
      { id: 'defence-news', name: 'Defence News', description: 'Exercises, Weapons, Deals' },
      { id: 'international-relations', name: 'International Relations', description: 'Summits, Treaties, Geopolitics' },
      { id: 'awards-sports', name: 'Awards & Sports', description: 'Honours and Championships' },
      { id: 'sci-tech-current', name: 'Science & Tech Developments', description: 'Space missions, New tech' }
    ]
  }
];
