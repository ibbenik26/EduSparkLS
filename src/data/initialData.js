export const INITIAL_SHOP_ITEMS = [
  {
    id: 'item_1',
    name: 'Grade 7 Deluxe Geometry Kit',
    category: 'School Supplies',
    cost: 250,
    stock: 12,
    target_grade: 7,
    image_url: 'https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80',
    desc: 'Complete metal geometry compass & protractor set reserved for Grade 7 math class.'
  },
  {
    id: 'item_2',
    name: 'EduSpark Hardcover Notebook',
    category: 'Stationery',
    cost: 180,
    stock: 20,
    target_grade: 'All',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    desc: 'Hardcover 200-page lined notebook for all student grades.'
  },
  {
    id: 'item_3',
    name: 'Homework Waiver Pass',
    category: 'Privileges',
    cost: 300,
    stock: 50,
    target_grade: 'All',
    image_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=600&q=80',
    desc: '1 homework waiver card approved by class teachers.'
  }
];

export const INITIAL_BOOKS = [
  {
    id: 'book_dhivehi_1',
    title: 'ދިވެހިބަހުގެ ގަވާއިދު',
    subject: 'Dhivehi',
    author: 'އަލްއުސްތާޛު މުޙައްމަދު ޖަމީލު',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    summary: 'ދިވެހިބަހުގެ އަސާސީ ގަވާއިދުތަކާއި ތާނައަކުރުތަކުގެ ބޭނުންކުރާނެ ގޮތުގެ ތަފްޞީލު.',
    reading_hours: 2.5,
    claim_code: 'LIB-DHIV-01', // Secret code given by librarian
    edu_points_reward: 150,    // Visible reward on book card
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.",
      "ދެވަނަ ބާބު: ފިލި\n\nތާނައިގައި 10 ފިލި ބޭނުންކުރެވެއެވެ."
    ]
  },
  {
    id: 'book_physics_1',
    title: 'Cambridge O-Level Physics Revision Guide',
    subject: 'Physics',
    author: 'Dr. Marcus Vance',
    cover_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    summary: 'Comprehensive guide covering optics, forces, kinetic energy, and electricity for Cambridge Paper 0625.',
    reading_hours: 4.0,
    claim_code: 'LIB-PHYS-0625', // Secret code
    edu_points_reward: 200,     // Visible reward
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves.",
      "CHAPTER 2: REFRACTION AND LENSES\n\nWhen light passes from air into glass, it slows down and bends toward the normal line."
    ]
  }
];

export const INITIAL_QUIZZES = [
  {
    id: 'olevel_diagram_1',
    title: 'Cambridge O-Level Physics 0625 - Ray & Optics Diagrams',
    subject: 'Physics',
    grade: 10,
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12 (Diagram Special)',
    is_past_paper: true,
    has_diagrams: true,
    time_limit: 120,
    questions: [
      {
        id: 'qd1_1',
        topic: 'Optics & Lenses',
        diagram_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        question_text: 'Study the optical ray diagram shown above. What phenomenon is represented when light passes through the boundary?',
        option_a: 'Total Internal Reflection', option_b: 'Refraction and Dispersion', option_c: 'Diffraction', option_d: 'Polarization',
        correct_option: 'B', explanation: 'The diagram illustrates refraction and color dispersion as white light passes through a glass prism.'
      }
    ]
  }
];