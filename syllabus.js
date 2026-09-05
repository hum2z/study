/* Syllabus data.
   Cambridge CS 9618 (2026-2028) and Physics 9702 (2025-2027) syllabuses.
   Pearson Edexcel International A Level Mathematics spec (Issue 3): P3, P4, M1.
   IELTS Academic: standard test structure. */

const SYLLABUS = [
  {
    id: "cs",
    name: "Computer Science",
    code: "Cambridge 9618 · Year 2",
    colour: "#4f8cff",
    groups: [
      { name: "Paper 3 — Advanced Theory", chapters: [
        { n: "13", t: "Data Representation", subs: ["13.1 User-defined data types", "13.2 File organisation and access", "13.3 Floating-point numbers, representation and manipulation"] },
        { n: "14", t: "Communication and Internet Technologies", subs: ["14.1 Protocols", "14.2 Circuit switching, packet switching"] },
        { n: "15", t: "Hardware and Virtual Machines", subs: ["15.1 Processors, parallel processing and virtual machines", "15.2 Boolean algebra and logic circuits"] },
        { n: "16", t: "System Software", subs: ["16.1 Purposes of an operating system", "16.2 Translation software"] },
        { n: "17", t: "Security", subs: ["17.1 Encryption, encryption protocols and digital certificates"] },
        { n: "18", t: "Artificial Intelligence (AI)", subs: ["18.1 Artificial intelligence"] },
        { n: "19", t: "Computational Thinking and Problem-solving", subs: ["19.1 Algorithms", "19.2 Recursion"] },
        { n: "20", t: "Further Programming", subs: ["20.1 Programming paradigms", "20.2 File processing and exception handling"] }
      ]},
      { name: "Paper 4 — Practical (sections 19–20)", chapters: [
        { n: "PR", t: "Practical Programming", subs: [
          "Working fluently in one console language — Python, Java or VB",
          "Implementing 19.1 algorithms — searching, sorting and ADTs in code",
          "Recursion in code (19.2)",
          "Object-oriented programming — classes, inheritance, polymorphism (20.1)",
          "File processing — reading from and writing to files (20.2)",
          "Exception handling (20.2)",
          "Producing complete program code and evidence of testing"] }
      ]}
    ]
  },
  {
    id: "phy",
    name: "Physics",
    code: "Cambridge 9702 · Year 2",
    colour: "#ff8a4f",
    groups: [
      { name: "Paper 4 — A Level topics", chapters: [
        { n: "12", t: "Motion in a Circle", subs: ["12.1 Kinematics of uniform circular motion", "12.2 Centripetal acceleration"] },
        { n: "13", t: "Gravitational Fields", subs: ["13.1 Gravitational field", "13.2 Gravitational force between point masses", "13.3 Gravitational field of a point mass", "13.4 Gravitational potential"] },
        { n: "14", t: "Temperature", subs: ["14.1 Thermal equilibrium", "14.2 Temperature scales", "14.3 Specific heat capacity and specific latent heat"] },
        { n: "15", t: "Ideal Gases", subs: ["15.1 The mole", "15.2 Equation of state", "15.3 Kinetic theory of gases"] },
        { n: "16", t: "Thermodynamics", subs: ["16.1 Internal energy", "16.2 The first law of thermodynamics"] },
        { n: "17", t: "Oscillations", subs: ["17.1 Simple harmonic oscillations", "17.2 Energy in simple harmonic motion", "17.3 Damped and forced oscillations, resonance"] },
        { n: "18", t: "Electric Fields", subs: ["18.1 Electric fields and field lines", "18.2 Uniform electric fields", "18.3 Electric force between point charges", "18.4 Electric field of a point charge", "18.5 Electric potential"] },
        { n: "19", t: "Capacitance", subs: ["19.1 Capacitors and capacitance", "19.2 Energy stored in a capacitor", "19.3 Discharging a capacitor"] },
        { n: "20", t: "Magnetic Fields", subs: ["20.1 Concept of a magnetic field", "20.2 Force on a current-carrying conductor", "20.3 Force on a moving charge", "20.4 Magnetic fields due to currents", "20.5 Electromagnetic induction"] },
        { n: "21", t: "Alternating Currents", subs: ["21.1 Characteristics of alternating currents", "21.2 Rectification and smoothing"] },
        { n: "22", t: "Quantum Physics", subs: ["22.1 Energy and momentum of a photon", "22.2 Photoelectric effect", "22.3 Wave-particle duality", "22.4 Energy levels in atoms and line spectra"] },
        { n: "23", t: "Nuclear Physics", subs: ["23.1 Mass defect and nuclear binding energy", "23.2 Radioactive decay"] },
        { n: "24", t: "Medical Physics", subs: ["24.1 Production and use of ultrasound", "24.2 Production and use of X-rays", "24.3 PET scanning"] },
        { n: "25", t: "Astronomy and Cosmology", subs: ["25.1 Standard candles", "25.2 Stellar radii", "25.3 Hubble's law and the Big Bang theory"] }
      ]},
      { name: "Paper 5 — Planning, analysis and evaluation", chapters: [
        { n: "Q1", t: "Planning", subs: [
          "Defining the problem — independent, dependent and controlled variables",
          "Methods of data collection — how to vary and measure each variable",
          "Method of analysis — what to plot and how the constant follows",
          "Labelled diagram of a workable apparatus arrangement",
          "Additional detail, including safety considerations"] },
        { n: "Q2", t: "Analysis, Conclusions and Evaluation", subs: [
          "Data analysis — rearranging the equation into y = mx + c",
          "Table of results — calculated values and significant figures",
          "Graph — plotting, error bars, best and worst-fit lines",
          "Conclusion — gradient and intercept to find the constant",
          "Treatment of uncertainties — absolute and percentage"] }
      ]}
    ]
  },
  {
    id: "p3",
    name: "Pure Maths 3",
    code: "Edexcel IAL WMA13",
    colour: "#3ecf8e",
    groups: [
      { name: "Unit P3 content", chapters: [
        { n: "1", t: "Algebra and Functions", subs: ["1.1 Simplification of rational expressions, algebraic division", "1.2 Functions: domain, range, composition, inverses", "1.3 The modulus function", "1.4 Combinations of transformations"] },
        { n: "2", t: "Trigonometry", subs: ["2.1 sec, cosec, cot; arcsin, arccos, arctan and their graphs", "2.2 sec²θ = 1 + tan²θ and cosec²θ = 1 + cot²θ", "2.3 Double angle, addition formulae, a cosθ + b sinθ in R cos(θ ± α) form"] },
        { n: "3", t: "Exponentials and Logarithms", subs: ["3.1 The function eˣ and its graph", "3.2 The function ln x; inverse of eˣ", "3.3 Logarithmic graphs to estimate parameters (y = axⁿ, y = kbˣ)"] },
        { n: "4", t: "Differentiation", subs: ["4.1 Differentiating e^kx, ln kx, sin kx, cos kx, tan kx", "4.2 Product, quotient and chain rules", "4.3 Use of dy/dx = 1 ÷ (dx/dy)", "4.4 Exponential growth and decay"] },
        { n: "5", t: "Integration", subs: ["5.1 Integrating e^kx, 1/xⁿ, sin kx, cos kx", "5.2 Integration by recognition of known derivatives"] },
        { n: "6", t: "Numerical Methods", subs: ["6.1 Location of roots by change of sign", "6.2 Iterative methods and recurrence relations"] }
      ]}
    ]
  },
  {
    id: "p4",
    name: "Pure Maths 4",
    code: "Edexcel IAL WMA14",
    colour: "#b06bff",
    groups: [
      { name: "Unit P4 content", chapters: [
        { n: "1", t: "Proof", subs: ["1.1 Proof by contradiction"] },
        { n: "2", t: "Algebra and Functions", subs: ["2.1 Partial fractions (incl. repeated linear factors)"] },
        { n: "3", t: "Coordinate Geometry in the (x, y) Plane", subs: ["3.1 Parametric equations; converting parametric ↔ cartesian"] },
        { n: "4", t: "Binomial Expansion", subs: ["4.1 Binomial series for any rational n"] },
        { n: "5", t: "Differentiation", subs: ["5.1 Implicit and parametric differentiation", "5.2 Forming simple differential equations; connected rates of change"] },
        { n: "6", t: "Integration", subs: ["6.1 Volumes of revolution", "6.2 Integration by substitution and by parts", "6.3 Integration using partial fractions", "6.4 First order differential equations with separable variables", "6.5 Area under a curve given parametric equations"] },
        { n: "7", t: "Vectors", subs: ["7.1 Vectors in two and three dimensions", "7.2 Magnitude of a vector; unit vectors", "7.3 Vector addition and multiplication by scalars", "7.4 Position vectors", "7.5 Distance between two points", "7.6 Vector equations of lines (parallel, intersecting, skew)", "7.7 The scalar product and angle between lines"] }
      ]}
    ]
  },
  {
    id: "m1",
    name: "Mechanics 1",
    code: "Edexcel IAL WME01",
    colour: "#ff5d8f",
    groups: [
      { name: "Unit M1 content", chapters: [
        { n: "1", t: "Mathematical Models in Mechanics", subs: ["1.1 Basic ideas of mathematical modelling in mechanics"] },
        { n: "2", t: "Vectors in Mechanics", subs: ["2.1 Magnitude and direction of a vector; resultants", "2.2 Vectors applied to displacement, velocity, acceleration and force"] },
        { n: "3", t: "Kinematics of a Particle in a Straight Line", subs: ["3.1 Motion with constant acceleration; suvat and graphs"] },
        { n: "4", t: "Dynamics of a Particle in a Straight Line or Plane", subs: ["4.1 Force and Newton's laws of motion", "4.2 Connected particles (pulleys, tow bars, lifts)", "4.3 Momentum and impulse; conservation of momentum", "4.4 Coefficient of friction (moving particle)"] },
        { n: "5", t: "Statics of a Particle", subs: ["5.1 Resolution of forces", "5.2 Equilibrium under coplanar forces", "5.3 Coefficient of friction in equilibrium"] },
        { n: "6", t: "Moments", subs: ["6.1 Moment of a force; equilibrium of a rigid body"] }
      ]}
    ]
  },
  {
    id: "ielts",
    name: "IELTS Academic",
    code: "British Council / IDP",
    colour: "#ffd166",
    groups: [
      { name: "Listening (30 min)", chapters: [
        { n: "L1", t: "Listening Skills", subs: ["Part 1 – everyday conversation (form/note completion)", "Part 2 – monologue on a social situation (maps, matching)", "Part 3 – academic discussion (MCQ, matching)", "Part 4 – academic lecture (note completion)", "Spelling, numbers, dates and plurals", "Distractors and paraphrase spotting"] }
      ]},
      { name: "Reading (60 min)", chapters: [
        { n: "R1", t: "Reading Skills", subs: ["Skimming and scanning under time pressure", "Multiple choice & sentence completion", "True / False / Not Given", "Yes / No / Not Given", "Matching headings", "Matching information to paragraphs", "Matching features / sentence endings", "Summary, note, table & flow-chart completion", "Diagram label completion", "Short-answer questions"] }
      ]},
      { name: "Writing (60 min)", chapters: [
        { n: "W1", t: "Task 1 – Report (150 words, 20 min)", subs: ["Line graphs", "Bar charts", "Pie charts", "Tables", "Process diagrams", "Maps / changes over time", "Mixed charts", "Overview paragraph & key trends", "Language of comparison and change"] },
        { n: "W2", t: "Task 2 – Essay (250 words, 40 min)", subs: ["Opinion (agree/disagree)", "Discussion (both views)", "Advantages & disadvantages", "Problem & solution", "Two-part questions", "Essay structure & paragraphing", "Cohesion and linking devices", "Task response & developing ideas"] }
      ]},
      { name: "Speaking (11–14 min)", chapters: [
        { n: "S1", t: "Speaking Skills", subs: ["Part 1 – introduction & familiar topics", "Part 2 – cue card long turn (1 min prep, 2 min talk)", "Part 3 – abstract discussion", "Fluency & coherence", "Lexical resource / topic vocabulary", "Grammatical range & accuracy", "Pronunciation and stress"] }
      ]},
      { name: "General prep", chapters: [
        { n: "G1", t: "Practice & Review", subs: ["Full mock test 1", "Full mock test 2", "Full mock test 3", "Full mock test 4", "Vocabulary bank (topic-based)", "Grammar review (tenses, articles, complex sentences)", "Timing strategy for each section"] }
      ]}
    ]
  }
];
