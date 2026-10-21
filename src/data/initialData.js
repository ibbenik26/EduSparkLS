export const INITIAL_SHOP_ITEMS = [
  { id: 'item_1', name: 'Deluxe Geometry Set', category: 'School Supplies', cost: 250, stock: 12, is_real: true, icon: '📐', desc: 'Complete metal geometry compass set for Math class.' },
  { id: 'item_2', name: 'EduSpark Hardcover Notebook', category: 'Stationery', cost: 180, stock: 20, is_real: true, icon: '📓', desc: '200-page lined notebook with EduSpark emblem.' },
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
    id: 'book_islam_1',
    title: 'އިސްލާމީ ތަރުބިޔަތު - ގްރޭޑް 10',
    subject: 'Islam',
    author: 'Ministry of Education',
    cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    summary: 'ގްރޭޑް 10 ގެ އިސްލާމް މުޤައްރަރުގައި ހިމެނޭ ޢަޤީދާއާއި ފިޤުހުގެ ފިލާވަޅުތައް.',
    reading_hours: 3.0,
    claim_code: 'LIB-ISL-10',
    pages: [
      "ފުރަތަމަ ފިލާވަޅު: ކީރިތި ޤުރުއާނަށް ޙުރުމަތްތެރިކޮށް ހިތުން\n\nކީރިތި ޤުރުއާނަކީ ﷲ ތަޢާލާގެ ކަލާމްފުޅެވެ.",
      "ދެވަނަ ފިލާވަޅު: އީމާންކަމުގެރުކުންތައް\n\nއީމާންކަމުގެ ރުކުންތަކަކީ ހައެކެވެ."
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
    claim_code: 'LIB-PHYS-0625',
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
    id: 'olevel_chem_1',
    title: 'Cambridge O-Level Chemistry 0620 - Periodic Table & Bonding',
    subject: 'Chemistry',
    grade: 9,
    subject_code: '0620',
    exam_year: 2025,
    variant: 'Paper 11',
    is_past_paper: true,
    has_diagrams: false,
    time_limit: 120,
    questions: [
      {
        id: 'qc1_1',
        topic: 'Atomic Structure',
        question_text: 'Which element in Group I of the Periodic Table reacts most vigorously with cold water?',
        option_a: 'Lithium', option_b: 'Sodium', option_c: 'Potassium', option_d: 'Caesium',
        correct_option: 'D', explanation: 'Reactivity of Group I alkali metals increases down the group, making Caesium the most reactive.'
      },
      {
        id: 'qc1_2',
        topic: 'Covalent Bonding',
        question_text: 'How many pairs of shared electrons are present in a molecule of methane (CH4)?',
        option_a: '2 pairs', option_b: '4 pairs', option_c: '6 pairs', option_d: '8 pairs',
        correct_option: 'B', explanation: 'Carbon forms four single covalent bonds with four hydrogen atoms.'
      }
    ]
  },
  {
    id: 'olevel_math_1',
    title: 'Cambridge O-Level Mathematics 4024 - Algebra & Trigonometry',
    subject: 'Maths',
    grade: 8,
    subject_code: '4024',
    exam_year: 2024,
    variant: 'Paper 12',
    is_past_paper: true,
    has_diagrams: false,
    time_limit: 120,
    questions: [
      {
        id: 'qm1_1',
        topic: 'Linear Equations',
        question_text: 'Solve the equation: 3x - 7 = 14.',
        option_a: 'x = 5', option_b: 'x = 7', option_c: 'x = 21', option_d: 'x = 3',
        correct_option: 'B', explanation: '3x = 14 + 7 => 3x = 21 => x = 7.'
      },
      {
        id: 'qm1_2',
        topic: 'Pythagoras Theorem',
        question_text: 'In a right-angled triangle, if the two shorter sides are 6 cm and 8 cm, what is the length of the hypotenuse?',
        option_a: '10 cm', option_b: '12 cm', option_c: '14 cm', option_d: '100 cm',
        correct_option: 'A', explanation: 'c² = 6² + 8² = 36 + 64 = 100 => c = 10 cm.'
      }
    ]
  },
  {
    id: 'quiz_dhivehi_1',
    title: 'ދިވެހި ބަސް - ގްރޭޑް 7 ނަންއިތުރު',
    subject: 'Dhivehi',
    grade: 7,
    subject_code: 'DHIV-07',
    exam_year: 2026,
    variant: 'Paper 1',
    is_past_paper: false,
    has_diagrams: false,
    time_limit: 60,
    questions: [
      {
        id: 'qdh_1',
        topic: 'ނަންއިތުރު',
        question_text: 'ތިރީގައިވާ ޖުމްލައިގައިވާ ނަންއިތުރަކީ ކޮބާ؟ "ރީތި ކުއްޖާ ފޮތް ކިޔަނީއެވެ."',
        option_a: 'ކުއްޖާ', option_b: 'ރީތި', option_c: 'ފޮތް', option_d: 'ކިޔަނީއެވެ',
        correct_option: 'B', explanation: '"ރީތި" އަކީ ނަމުގެ ސިފަ ބަޔާންކޮށްދޭ ނަންއިތުރެކެވެ.'
      }
    ]
  }
];