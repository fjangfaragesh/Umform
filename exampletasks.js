const EXAMPLE_TASKS = [
  {
    "task": "or(not(and(id{\"x\"},id{\"false\"})),and(id{\"y\"},id{\"true\"}))",
    "taskPreview": "¬(x ∧ false) ∨ (y ∧ true)",
    "solution": "id{\"true\"}",
    "solutionPreview": "true"
  },
  {
    "task": "and(or(id{\"x\"},id{\"false\"}),not(not(id{\"y\"})))",
    "taskPreview": "(x ∨ false) ∧ ¬¬y",
    "solution": "and(id{\"x\"},id{\"y\"})",
    "solutionPreview": "x ∧ y"
  },
  {
    "task": "or(and(id{\"x\"},id{\"y\"}),and(id{\"x\"},not(id{\"y\"})))",
    "taskPreview": "(x ∧ y) ∨ (x ∧ ¬y)",
    "solution": "id{\"x\"}",
    "solutionPreview": "x"
  },
  {
    "task": "not(and(not(id{\"x\"}),id{\"y\"}))",
    "taskPreview": "¬(¬x ∧ y)",
    "solution": "or(id{\"x\"},not(id{\"y\"}))",
    "solutionPreview": "x ∨ ¬y"
  },
  {
    "task": "and(or(id{\"x\"},id{\"y\"}),or(not(id{\"x\"}),id{\"y\"}))",
    "taskPreview": "(x ∨ y) ∧ (¬x ∨ y)",
    "solution": "id{\"y\"}",
    "solutionPreview": "y"
  },
  {
    "task": "not(or(not(id{\"x\"}),not(id{\"y\"})))",
    "taskPreview": "¬(¬x ∨ ¬y)",
    "solution": "and(id{\"x\"},id{\"y\"})",
    "solutionPreview": "x ∧ y"
  },
  {
    "task": "and(not(id{\"x\"}),or(id{\"x\"},id{\"y\"}))",
    "taskPreview": "¬x ∧ (x ∨ y)",
    "solution": "and(not(id{\"x\"}),id{\"y\"})",
    "solutionPreview": "¬x ∧ y"
  },
  {
    "task": "or(and(id{\"x\"},id{\"y\"}),and(not(id{\"x\"}),id{\"y\"}))",
    "taskPreview": "(x ∧ y) ∨ (¬x ∧ y)",
    "solution": "id{\"y\"}",
    "solutionPreview": "y"
  },
  {
    "task": "not(and(not(id{\"x\"}),not(id{\"y\"})))",
    "taskPreview": "¬(¬x ∧ ¬y)",
    "solution": "or(id{\"x\"},id{\"y\"})",
    "solutionPreview": "x ∨ y"
  },
  {
    "task": "not(or(and(id{\"x\"},id{\"y\"}),and(not(id{\"x\"}),not(id{\"y\"}))))",
    "taskPreview": "¬((x ∧ y) ∨ (¬x ∧ ¬y))",
    "solution": "or(and(id{\"x\"},not(id{\"y\"})),and(not(id{\"x\"}),id{\"y\"}))",
    "solutionPreview": "(x ∧ ¬y) ∨ (¬x ∧ y)"
  },
  {
    "task": "implication(id{\"x\"},id{\"y\"})",
    "taskPreview": "x → y",
    "solution": "or(not(id{\"x\"}),id{\"y\"})",
    "solutionPreview": "¬x ∨ y"
  },
  {
    "task": "not(implication(id{\"x\"},id{\"y\"}))",
    "taskPreview": "¬(x → y)",
    "solution": "and(id{\"x\"},not(id{\"y\"}))",
    "solutionPreview": "x ∧ ¬y"
  },
  {
    "task": "equivalence(id{\"x\"},id{\"y\"})",
    "taskPreview": "x ↔ y",
    "solution": "or(and(id{\"x\"},id{\"y\"}),and(not(id{\"x\"}),not(id{\"y\"})))",
    "solutionPreview": "(x ∧ y) ∨ (¬x ∧ ¬y)"
  },
  {
    "task": "equivalence(id{\"x\"},id{\"true\"})",
    "taskPreview": "x ↔ true",
    "solution": "id{\"x\"}",
    "solutionPreview": "x"
  },
  {
    "task": "equivalence(id{\"x\"},id{\"false\"})",
    "taskPreview": "x ↔ false",
    "solution": "not(id{\"x\"})",
    "solutionPreview": "¬x"
  },
  {
    "task": "implication(id{\"false\"},id{\"x\"})",
    "taskPreview": "false → x",
    "solution": "id{\"true\"}",
    "solutionPreview": "true"
  },
  {
    "task": "implication(id{\"x\"},id{\"false\"})",
    "taskPreview": "x → false",
    "solution": "not(id{\"x\"})",
    "solutionPreview": "¬x"
  },
  {
    "task": "equivalence(id{\"x\"},id{\"x\"})",
    "taskPreview": "x ↔ x",
    "solution": "id{\"true\"}",
    "solutionPreview": "true"
  },
  {
    "task": "equivalence(id{\"x\"},not(id{\"x\"}))",
    "taskPreview": "x ↔ ¬x",
    "solution": "id{\"false\"}",
    "solutionPreview": "false"
  },
  {
    "task": "not(equivalence(id{\"x\"},id{\"y\"}))",
    "taskPreview": "¬(x ↔ y)",
    "solution": "or(and(id{\"x\"},not(id{\"y\"})),and(not(id{\"x\"}),id{\"y\"}))",
    "solutionPreview": "(x ∧ ¬y) ∨ (¬x ∧ y)"
  },
  {
    "task": "fraction(sum(power(id{\"x\"},number{3}),neg(product(number{3},power(id{\"x\"},number{2}))),product(neg(number{10}),id{\"x\"}),number{24}),sum(id{\"x\"},neg(number{2})))",
    "taskPreview": "Poly Div Test",
    "solution": "sum(power(id{\"x\"},number{2}),neg(id{\"x\"}),neg(number{12}))",
    "solutionPreview": "?"
  }


  
];