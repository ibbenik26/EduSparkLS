export const INITIAL_SHOP_ITEMS = [
  { id: 'item_1', name: 'Deluxe Geometry Set', category: 'School Supplies', cost: 250, stock: 12, is_real: true, icon: '📐', desc: 'Complete metal geometry compass set for Math class.' },
  { id: 'item_2', name: 'EduSpark Branded Notebook', category: 'Stationery', cost: 180, stock: 20, is_real: true, icon: '📓', desc: 'Hardcover 200-page lined notebook.' },
  { id: 'item_3', name: 'Homework Waiver Pass', category: 'Privileges', cost: 300, stock: 50, is_real: false, icon: '🎟️', desc: '1 homework waiver card approved by your class teacher.' },
  { id: 'item_4', name: 'Color Marker Set (12 Pack)', category: 'School Supplies', cost: 200, stock: 8, is_real: true, icon: '🖍️', desc: 'Highlighter & marker dual-tip set.' },
  { id: 'item_5', name: '24h Double XP Booster', category: 'Digital Perks', cost: 150, stock: 999, is_real: false, icon: '⚡', desc: 'Earn 2x XP for all quizzes and library reading completed today.' }
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
    claim_code: 'LIB-DHIV-01',
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.",
      "ދެވަނަ ބާބު: ފިލި\n\nތާނައިގައި 10 ފިލި ބޭނުންކުރެވެއެވެ."
    ]
  },
  {
    id: 'book_1',
    title: 'Physics in Everyday Life',
    subject: 'Physics',
    author: 'Dr. Marcus Vance',
    cover_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    summary: 'Explore forces, energy, gravity, thermodynamics, and electromagnetism.',
    reading_hours: 4.0,
    claim_code: 'LIB-PHYS-101',
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves.",
      "CHAPTER 2: ENERGY & WORK\n\nEnergy cannot be created or destroyed, only transformed from one form to another."
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
      },
      {
        id: 'qd1_2',
        topic: 'Vectors & Forces',
        diagram_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
        question_text: 'Based on the force vector diagram above, if F1 = 30N right and F2 = 10N left, what is the resultant force?',
        option_a: '40 N to the right', option_b: '20 N to the right', option_c: '20 N to the left', option_d: '300 N',
        correct_option: 'B', explanation: 'Resultant force = 30 N - 10 N = 20 N acting in the direction of the larger force.'
      }
    ]
  },
  {
    id: 'olevel_1',
    title: 'Cambridge O-Level Physics 0625 - Mechanics & Motion',
    subject: 'Physics',
    grade: 10,
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12',
    is_past_paper: true,
    has_diagrams: false,
    time_limit: 120,
    questions: [
      {
        id: 'q1_1',
        topic: 'Kinematics & Motion',
        question_text: 'A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is its acceleration?',
        option_a: '2 m/s²', option_b: '4 m/s²', option_c: '5 m/s²', option_d: '100 m/s²',
        correct_option: 'B', explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s².'
      },
      {
        id: 'q1_2',
        topic: 'Forces & Energy',
        question_text: 'Which quantity is calculated by multiplying force by distance moved in the direction of the force?',
        option_a: 'Power', option_b: 'Work done', option_c: 'Pressure', option_d: 'Acceleration',
        correct_option: 'B', explanation: 'Work done W = Force x Distance.'
      }
    ]
  }
];