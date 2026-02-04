
import { SectionType, Subject } from './types';

export const SYLLABUS: Subject[] = [
  {
    id: 'english',
    name: 'English Language',
    section: SectionType.ENGLISH,
    icon: '📚',
    topics: [
      { id: 'spotting-errors', name: 'Spotting Errors', description: 'Grammar and usage analysis' },
      { id: 'sentence-improvement', name: 'Sentence Improvement', description: 'Refining sentence structure and syntax' },
      { id: 'sentence-rearrangement', name: 'Sentence Rearrangement', description: 'Logical ordering of sentences' },
      { id: 'synonyms-antonyms', name: 'Synonyms & Antonyms', description: 'Vocabulary range and word meanings' },
      { id: 'idioms-phrases', name: 'Idioms & Phrases', description: 'Idiomatic expressions and their usage' },
      { id: 'vocabulary', name: 'Vocabulary', description: 'Comprehensive lexical knowledge' },
      { id: 'reading-comprehension', name: 'Reading Comprehension', description: 'Analytical reading and inference' },
      { id: 'grammar-usage', name: 'Grammar & Usage', description: 'Advanced rules of English grammar' }
    ]
  },
  {
    id: 'maths',
    name: 'Elementary Mathematics',
    section: SectionType.MATHEMATICS,
    icon: '📐',
    topics: [
      { id: 'number-system', name: 'Number System', description: 'Types of numbers, divisibility, and properties' },
      { id: 'lcm-hcf', name: 'LCM & HCF', description: 'Common multiples and factors' },
      { id: 'ratio-proportion', name: 'Ratio & Proportion', description: 'Comparison of quantities and variations' },
      { id: 'percentage', name: 'Percentage', description: 'Calculations based on parts of a hundred' },
      { id: 'profit-loss', name: 'Profit & Loss', description: 'Commercial mathematics and trade logic' },
      { id: 'interest', name: 'Simple & Compound Interest', description: 'Time value of money and interest rates' },
      { id: 'time-work', name: 'Time & Work', description: 'Work efficiency and temporal calculations' },
      { id: 'time-distance', name: 'Time & Distance', description: 'Speed, distance, and relative motion' },
      { id: 'algebraic-expressions', name: 'Algebraic Expressions', description: 'Polynomials and algebraic identities' },
      { id: 'linear-equations', name: 'Linear Equations', description: 'Solving equations in one and two variables' },
      { id: 'geometry', name: 'Geometry', description: 'Theorems on lines, angles, and shapes' },
      { id: 'mensuration', name: 'Mensuration', description: 'Area, perimeter, and volume of figures' },
      { id: 'statistics', name: 'Statistics', description: 'Data presentation and central tendency' }
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
          { id: 'prehistoric-age', name: 'Prehistoric Age', description: 'Stone age to metal age transition' },
          { id: 'ivc', name: 'Indus Valley Civilization', description: 'Urban planning and Harappan culture' },
          { id: 'vedic-age', name: 'Vedic Age (Early & Later)', description: 'Society, religion, and the Vedas' },
          { id: 'religious-movements', name: 'Religious Movements', description: 'Buddhism & Jainism' },
          { id: 'mauryan-empire', name: 'Mauryan Empire', description: 'Chandra Gupta to Ashoka' },
          { id: 'post-mauryan', name: 'Post-Mauryan Period', description: 'Regional powers after the Mauryas' },
          { id: 'gupta-empire', name: 'Gupta Empire', description: 'Golden age of Ancient India' }
        ]
      },
      {
        id: 'medieval-history',
        name: 'Medieval History',
        topics: [
          { id: 'delhi-sultanate', name: 'Delhi Sultanate', description: 'Slave to Lodi dynasties' },
          { id: 'mughal-empire', name: 'Mughal Empire', description: 'Babur to the Great Mughals' },
          { id: 'vijayanagara-bahmani', name: 'Vijayanagara & Bahmani Kingdoms', description: 'Southern medieval powers' },
          { id: 'bhakti-sufi', name: 'Bhakti & Sufi Movements', description: 'Spiritual and cultural reforms' }
        ]
      },
      {
        id: 'modern-history',
        name: 'Modern History',
        topics: [
          { id: 'advent-europeans', name: 'Advent of Europeans', description: 'Portuguese, Dutch, French, and British' },
          { id: 'british-expansion', name: 'British Expansion in India', description: 'Conquests and administrative policies' },
          { id: 'economic-impact', name: 'Economic Impact of British Rule', description: 'Land revenue and drainage of wealth' },
          { id: 'socio-religious-reforms', name: 'Socio-Religious Reform Movements', description: '19th-century social awakening' },
          { id: 'revolt-1857', name: 'Revolt of 1857', description: 'First war of independence' }
        ]
      },
      {
        id: 'national-movement',
        name: 'Indian National Movement',
        topics: [
          { id: 'formation-inc', name: 'Formation of INC', description: 'Birth of Indian National Congress' },
          { id: 'moderates-extremists', name: 'Moderates & Extremists', description: 'Internal ideologies of the Congress' },
          { id: 'gandhian-era', name: 'Gandhian Era', description: 'Gandhi’s entry and major movements' },
          { id: 'mass-movements', name: 'Mass Movements', description: 'NCM, CDM, and Quit India' },
          { id: 'constitutional-dev', name: 'Constitutional Developments', description: 'Pre-independence acts and laws' },
          { id: 'partition-independence', name: 'Partition & Independence', description: 'Transfer of power and 1947' }
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
          { id: 'earth-structure', name: 'Earth Structure', description: 'Internal layers and composition' },
          { id: 'rocks', name: 'Rocks', description: 'Types and rock cycle' },
          { id: 'mountains-plateaus', name: 'Mountains & Plateaus', description: 'Geomorphology of landforms' },
          { id: 'rivers-physical', name: 'Rivers', description: 'Fluvial processes and drainage patterns' },
          { id: 'climate-physical', name: 'Climate', description: 'Weather patterns and global climate' },
          { id: 'natural-vegetation', name: 'Natural Vegetation', description: 'Global flora and biomes' }
        ]
      },
      {
        id: 'indian-geography',
        name: 'Indian Geography',
        topics: [
          { id: 'himalayan-mountains', name: 'The Himalayan Mountains', description: 'Formation, ranges, and peaks' },
          { id: 'northern-plains', name: 'The Northern Plains', description: 'Indo-Gangetic-Brahmaputra plains' },
          { id: 'peninsular-plateau', name: 'The Peninsular Plateau', description: 'Central Highlands and Deccan Plateau' },
          { id: 'indian-desert', name: 'The Indian Desert', description: 'Arid region and Thar topography' },
          { id: 'coastal-plains', name: 'The Coastal Plains', description: 'Western and Eastern coastal strips' },
          { id: 'islands-india', name: 'The Islands', description: 'Andaman & Nicobar and Lakshadweep' },
          { id: 'himalayan-river-system', name: 'Himalayan River Systems', description: 'Indus, Ganga, and Brahmaputra' },
          { id: 'peninsular-river-system', name: 'Peninsular River Systems', description: 'East and West flowing rivers' },
          { id: 'lakes-water-resources', name: 'Lakes & Water Resources', description: 'Indian lakes and wetland conservation' },
          { id: 'soils-india', name: 'Soils', description: 'Alluvial, Black, Red, Laterite, etc.' },
          { id: 'climate-india', name: 'Climate of India', description: 'Monsoons and regional seasons' },
          { id: 'natural-resources', name: 'Natural Resources', description: 'Minerals, energy, and forest wealth' },
          { id: 'agriculture-india', name: 'Agriculture', description: 'Crops, irrigation, and green revolution' }
        ]
      },
      {
        id: 'world-geography',
        name: 'World Geography',
        topics: [
          { id: 'continents', name: 'Continents', description: 'Major features of all continents' },
          { id: 'oceans', name: 'Oceans', description: 'Oceanography and marine resources' },
          { id: 'major-deserts', name: 'Major Deserts', description: 'Global arid regions' },
          { id: 'major-rivers-world', name: 'Major Rivers', description: 'World’s important river systems' },
          { id: 'straits-canals', name: 'Important Straits & Canals', description: 'Global maritime mapping' }
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
      { id: 'constitution-india', name: 'Constitution of India', description: 'Framing, sources, and key features' },
      { id: 'preamble', name: 'Preamble', description: 'Philosophy and objectives of the Constitution' },
      { id: 'fundamental-rights', name: 'Fundamental Rights', description: 'Part III - Rights and writs' },
      { id: 'dpsp', name: 'Directive Principles of State Policy', description: 'Part IV - State guidance' },
      { id: 'fundamental-duties', name: 'Fundamental Duties', description: 'Responsibilities of Indian citizens' },
      { id: 'union-government', name: 'Union Government', description: 'President, PM, Parliament, and Cabinet' },
      { id: 'state-government', name: 'State Government', description: 'Governor, CM, and State Legislature' },
      { id: 'judiciary', name: 'The Judiciary', description: 'Supreme Court and High Courts' },
      { id: 'local-self-government', name: 'Local Self Government', description: '73rd & 74th Amendment Acts' },
      { id: 'emergency-provisions', name: 'Emergency Provisions', description: 'National, State, and Financial emergency' },
      { id: 'amendments', name: 'Important Amendments', description: 'Landmark changes to the Constitution' },
      { id: 'constitutional-bodies', name: 'Constitutional & Statutory Bodies', description: 'UPSC, ECI, CAG, NITI Aayog' }
    ]
  },
  {
    id: 'gk_economy',
    name: 'Indian Economy',
    section: SectionType.GK,
    icon: '💹',
    topics: [
      { id: 'basic-economic-concepts', name: 'Basic Economic Concepts', description: 'Micro and Macro fundamentals' },
      { id: 'national-income', name: 'National Income', description: 'GDP, GNP, and NNP concepts' },
      { id: 'indian-economy-overview', name: 'Indian Economy', description: 'Features and structural changes' },
      { id: 'planning-india', name: 'Planning in India', description: 'Five Year Plans and NITI Aayog' },
      { id: 'poverty-unemployment', name: 'Poverty & Unemployment', description: 'Socio-economic challenges' },
      { id: 'banking-system', name: 'Banking System', description: 'RBI and commercial banking' },
      { id: 'inflation', name: 'Inflation', description: 'Causes, effects, and control measures' },
      { id: 'budget-fiscal-policy', name: 'Budget & Fiscal Policy', description: 'Government finance and taxation' }
    ]
  },
  {
    id: 'gk_environment',
    name: 'Environment & Ecology',
    section: SectionType.GK,
    icon: '🌳',
    topics: [
      { id: 'ecosystem', name: 'Ecosystem', description: 'Structure and functions of ecosystems' },
      { id: 'biodiversity', name: 'Biodiversity', description: 'Flora, fauna, and hotspots' },
      { id: 'environmental-pollution', name: 'Environmental Pollution', description: 'Air, water, and soil pollution' },
      { id: 'climate-change', name: 'Climate Change', description: 'Global warming and mitigation' },
      { id: 'conservation-environment', name: 'Conservation of Environment', description: 'Efforts and laws for conservation' },
      { id: 'national-parks-wildlife', name: 'National Parks & Wildlife Sanctuaries', description: 'Protected areas in India' }
    ]
  },
  {
    id: 'gk_art_culture',
    name: 'Art & Culture',
    section: SectionType.GK,
    icon: '🎨',
    topics: [
      { id: 'indian-architecture', name: 'Indian Architecture', description: 'Ancient to modern building styles' },
      { id: 'sculpture', name: 'Sculpture', description: 'Art of carving and modeling' },
      { id: 'paintings', name: 'Paintings', description: 'Mural, miniature, and folk paintings' },
      { id: 'classical-folk-dances', name: 'Classical & Folk Dances', description: 'Indian dance traditions' },
      { id: 'music', name: 'Music', description: 'Hindustani and Carnatic styles' },
      { id: 'fairs-festivals', name: 'Fairs & Festivals', description: 'Cultural celebrations across India' }
    ]
  },
  {
    id: 'gk_science_tech',
    name: 'Science & Technology',
    section: SectionType.GK,
    icon: '🚀',
    topics: [
      { id: 'defence-technology', name: 'Defence Technology', description: 'Missiles, tanks, and defense systems' },
      { id: 'space-technology', name: 'Space Technology', description: 'ISRO missions and satellites' },
      { id: 'nuclear-technology', name: 'Nuclear Technology', description: 'Atomic power and weapons' },
      { id: 'information-technology', name: 'Information Technology', description: 'Computers, internet, and AI' },
      { id: 'biotechnology', name: 'Biotechnology', description: 'Genetic engineering and medical tech' }
    ]
  },
  {
    id: 'gk_current_affairs',
    name: 'Current Affairs',
    section: SectionType.GK,
    icon: '📰',
    topics: [
      { id: 'national-international-events', name: 'National & International Events', description: 'Significant global happenings' },
      { id: 'important-dates-events', name: 'Important Dates & Events', description: 'Yearly milestones' },
      { id: 'sports-current', name: 'Sports', description: 'Latest in athletic championships' },
      { id: 'awards-honours', name: 'Awards & Honours', description: 'Civilian and gallantry awards' },
      { id: 'government-schemes', name: 'Government Schemes', description: 'Welfare and development programs' }
    ]
  }
];
