
// not

Umform.registerRule(new Umform.Rule({
    name: "debug",
    title: "Debug Rule",
    matchPattern: p('sum(<x>...id{"debug"})'),
    replacementPattern: p('product(<x>...)'),
    matchCaptures: ['x'],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false
}));


Umform.registerRule(new Umform.Rule({
    name: "not.not",
    title: "Double Negation",
    matchPattern: p('not(not(<x>))'),
    replacementPattern: p('<x>'),
    matchCaptures: ['x'],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("o̅̅",40,colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "not.not.reversed",
    title: "Double Negation (reversed)",
    matchPattern: p('<x>'),
    replacementPattern: p('not(not(<x>))'),
    matchCaptures: ['x'],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("⇛o̅̅",40,colors),
    tags:["logical","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "not.false",
    title: "Negation of False",
    matchPattern: p('not(id{"false"})'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("1",40,colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "not.false.reversed",
    title: "Negation of False (reversed)",
    matchPattern: p('id{"true"}'),
    replacementPattern: p('not(id{"false"})'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("⇛0̅",40,colors),
    tags:["logical","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "not.true",
    title: "Negation of True",
    matchPattern: p('not(id{"true"})'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("0",40,colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "not.true.reversed",
    title: "Negation of True (reversed)",
    matchPattern: p('id{"false"}'),
    replacementPattern: p('not(id{"true"})'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("⇛1̅",40,colors),
    tags:["logical","extend"]
}));

// and

Umform.registerRule(new Umform.Rule({
    name: "and.empty",
    title: "Empty And Equals True",
    matchPattern: p('and()'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("EMP","TY ∧",colors),
    tags:["logical","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.single",
    title: "Single And Factor Simplification",
    matchPattern: p('and(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SING","LE ∧",colors),
    tags:["logical","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.commutative",
    title: "Commutativity of And",
    matchPattern: p('and(<left>...,<a>,<middle>...,<b>,<right>...)'),
    replacementPattern: p('and(<left>...,<b>,<middle>...,<a>,<right>...)'),
    matchCaptures: ["a","b","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<a>'), p('<b>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createCommutative('∧',colors),
    tags:["logical","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.associative",
    title: "Associativity of And",
    matchPattern: p('and(<left>...,and(<x>...),<right>...)'),
    replacementPattern: p('and(<left>...,<x>...,<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('and(<x>...)')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('ASS','∧',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.idempotent",
    title: "Idempotency of And",
    matchPattern: p('and(<left>...,<x>,<middle>...,<x>,<right>...)'),
    replacementPattern: p('and(<left>...,<x>,<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∧ x','IDEM',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.idempotent.reversed",
    title: "Idempotency of And (reversed)",
    matchPattern: p('<x>'),
    replacementPattern: p('and(<x>,<x>)'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛x∧x','IDEM',colors),
    tags:["logical","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.contradiction",
    title: "Contradiction of And",
    matchPattern: p('and(<left>...,<x>,<middle>...,not(<x>),<right>...)'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∧ x̅','CNTR',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.contradiction.reversed",
    title: "Contradiction of And (reversed)",
    matchPattern: p('id{"false"}'),
    replacementPattern: p('and(<x>,not(<x>))'),
    matchCaptures: [],
    freeCaptures: ["x"],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛x∧x̅','CNTR',colors),
    tags:["logical","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.contradiction2",
    title: "Contradiction of And",
    matchPattern: p('and(<left>...,not(<x>),<middle>...,<x>,<right>...)'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x̅ ∧ x','CNTR',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.absorbtion",
    title: "Absorption of And",
    matchPattern: p('and(<left>...,<x>,<middle>...,or(<rightleft>...,<x>,<rightright>...),<right>...)'),
    replacementPattern: p('and(<left>...,<x>,<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","rightleft","rightright","right"],
    freeCaptures: [],
    selectOrder: [p('or(<rightleft>...,<x>,<rightright>...)'),p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('AB ∧','SORB',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.absorbtion.reversed",
    title: "Absorption of And (reversed)",
    matchPattern: p('<x>'),
    replacementPattern: p('and(<x>,or(<x>,<free>))'),
    matchCaptures: ["x"],
    freeCaptures: ["free"],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛AB∧','SORB',colors),
    tags:["logical","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.absorbtion2",
    title: "Absorption of And",
    matchPattern: p('and(<left>...,or(<rightleft>...,<x>,<rightright>...),<middle>...,<x>,<right>...)'),
    replacementPattern: p('and(<left>...,<middle>...,<x>,<right>...)'),
    matchCaptures: ["x","left","middle","rightleft","rightright","right"],
    freeCaptures: [],
    selectOrder: [p('or(<rightleft>...,<x>,<rightright>...)'),p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('AB ∧','SORB',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.neutrality",
    title: "Neutrality of And",
    matchPattern: p('and(<left>...,id{"true"},<right>...)'),
    replacementPattern: p('and(<left>...,<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∧ 1','NEUT',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "and.falsification",
    title: "Falsification of And",
    matchPattern: p('and(<left>...,id{"false"},<right>...)'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∧ 0','FALS',colors),
    tags:["logical","shorten"]
}));

// or

Umform.registerRule(new Umform.Rule({
    name: "or.empty",
    title: "Empty Or Equals False",
    matchPattern: p('or()'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("EMP","TY ∨",colors),
    tags:["logical","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.single",
    title: "Single Or Factor Simplification",
    matchPattern: p('or(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SING","LE ∨",colors),
    tags:["logical","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.commutative",
    title: "Commutativity of Or",
    matchPattern: p('or(<left>...,<a>,<middle>...,<b>,<right>...)'),
    replacementPattern: p('or(<left>...,<b>,<middle>...,<a>,<right>...)'),
    matchCaptures: ["a","b","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<a>'), p('<b>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createCommutative('∨',colors),
    tags:["logical","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.associative",
    title: "Associativity of Or",
    matchPattern: p('or(<left>...,or(<x>...),<right>...)'),
    replacementPattern: p('or(<left>...,<x>...,<right>...)'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('or(<x>...)')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('ASS','∨',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.idempotent",
    title: "Idempotency of Or",
    matchPattern: p('or(<left>...,<x>,<middle>...,<x>,<right>...)'),
    replacementPattern: p('or(<left>...,<x>,<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∨ x','IDEM',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.tautology",
    title: "Tautology of Or",
    matchPattern: p('or(<left>...,<x>,<middle>...,not(<x>),<right>...)'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∨ x̅','TAUT',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.tautology2",
    title: "Tautology of Or",
    matchPattern: p('or(<left>...,not(<x>),<middle>...,<x>,<right>...)'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x̅ ∨ x','TAUT',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.absorbtion",
    title: "Absorption of Or",
    matchPattern: p('or(<left>...,<x>,<middle>...,and(<rightleft>...,<x>,<rightright>...),<right>...)'),
    replacementPattern: p('or(<left>...,<x>,<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","rightleft","rightright","right"],
    freeCaptures: [],
    selectOrder: [p('and(<rightleft>...,<x>,<rightright>...)'),p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('AB ∨','SORB',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.absorbtion2",
    title: "Absorption of Or",
    matchPattern: p('or(<left>...,and(<rightleft>...,<x>,<rightright>...),<middle>...,<x>,<right>...)'),
    replacementPattern: p('or(<left>...,<middle>...,<x>,<right>...)'),
    matchCaptures: ["x","left","middle","rightleft","rightright","right"],
    freeCaptures: [],
    selectOrder: [p('and(<rightleft>...,<x>,<rightright>...)'),p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('AB ∨','SORB',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.neutrality",
    title: "Neutrality of Or",
    matchPattern: p('or(<left>...,id{"false"},<right>...)'),
    replacementPattern: p('or(<left>...,<right>...)'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∨ 0','NEUT',colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.truification",
    title: "Truification of Or",
    matchPattern: p('or(<left>...,id{"true"},<right>...)'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x ∨ 1','TRUE',colors),
    tags:["logical","shorten"]
}));

// or,and

Umform.registerRule(new Umform.Rule({
    name: "and.distribute",
    title: "Multiply Out (Distributive Law of And over Or)",
    matchPattern: p('and(<left>...,or(<x>...),<right>...)'),
    replacementPattern: p('or(__map__(<x>...,<xi>,and(<left>...,<xi>,<right>...)))'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('or(<x>...)')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∧ DIS","TRI ∨",colors),
    tags:["logical","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.distribute",
    title: "Multiply Out (Distributive Law of Or over And)",
    matchPattern: p('or(<left>...,and(<x>...),<right>...)'),
    replacementPattern: p('and(__map__(<x>...,<xi>,or(<left>...,<xi>,<right>...)))'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('and(<x>...)')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∨ DIS","TRI ∧",colors),
    tags:["logical","reshape"]
}));

// de Morgan's Laws

Umform.registerRule(new Umform.Rule({
    name: "and.deMorgan",
    title: "De Morgan's Law for And",
    matchPattern: p('and(<x>...)'),
    replacementPattern: p('not(or(__map__(<x>...,<xi>,not(<xi>))))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∧ DE","MOR",colors),
    tags:["logical","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.deMorgan",
    title: "De Morgan's Law for Or",
    matchPattern: p('or(<x>...)'),
    replacementPattern: p('not(and(__map__(<x>...,<xi>,not(<xi>))))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∨ DE","MOR",colors),
    tags:["logical","reshape"]
}));

// negierte form; vielleicht wieder löschen, wenns zu viel wird
Umform.registerRule(new Umform.Rule({
    name: "and.deMorgan2",
    title: "De Morgan's Law for And",
    matchPattern: p('not(and(<x>...))'),
    replacementPattern: p('or(__map__(<x>...,<xi>,not(<xi>)))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∧ DE","~ MOR",colors),
    tags:["logical","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "or.deMorgan2",
    title: "De Morgan's Law for Or",
    matchPattern: p('not(or(<x>...))'),
    replacementPattern: p('and(__map__(<x>...,<xi>,not(<xi>)))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∨ DE","~ MOR",colors),
    tags:["logical","reshape"]
}));

// implication

Umform.registerRule(new Umform.Rule({
    name: "implication.definition",
    title: "Implication Definition",
    matchPattern: p('implication(<x>,<y>)'),
    replacementPattern: p('or(not(<x>),<y>)'),
    matchCaptures: ["x","y"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("→DEF","o̅∨o",colors),
    tags:["logical","definition"]
}));

// implication

Umform.registerRule(new Umform.Rule({
    name: "implication.definition.reverse",
    title: "Implication Definition (Reverse)",
    matchPattern: p('or(<left>...,not(<x>),<middle>...,<y>,<right>...)'),
    replacementPattern: p('or(<left>...,implication(<x>,<y>),<middle>...,<right>...)'),
    matchCaptures: ["x","y","left","middle","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("o̅∨o","→DEF",colors),
    tags:["logical","definition_reverse"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.definition.reverse2",
    title: "Implication Definition (Reverse)",
    matchPattern: p('or(<left>...,<y>,<middle>...,not(<x>),<right>...)'),
    replacementPattern: p('or(<left>...,implication(<x>,<y>),<middle>...,<right>...)'),
    matchCaptures: ["x","y","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<y>'),p('not(<x>)')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("o∨o̅","→DEF",colors),
    tags:["logical","definition_reverse"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.falsification",
    title: "Implication Falsification",
    matchPattern: p('implication(id{"true"},id{"false"})'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("1 → 0","FALS",colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.truification",
    title: "Implication Truification",
    matchPattern: p('implication(id{"false"},<y>)'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: ["y"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("0 → x","TRUE",colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.transitivity.reduced",
    title: "Implication Transitivity (Reduced output)",
    matchPattern: p('and(<left>...,implication(<x>,<y>),<middle>...,implication(<y>,<z>),<right>...)'),
    replacementPattern: p('and(<left>...,implication(<x>,<y>),<middle>...,implication(<x>,<z>),<right>...)'),
    matchCaptures: ["x","y","z","left","middle","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("→TRA","NS",colors),
    tags:["logical"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.transitivity.reduced2",
    title: "Implication Transitivity (Reduced output)",
    matchPattern: p('and(<left>...,implication(<y>,<z>),<middle>...,implication(<x>,<y>),<right>...)'),
    replacementPattern: p('and(<left>...,implication(<x>,<z>),<middle>...,implication(<x>,<y>),<right>...)'),
    matchCaptures: ["x","y","z","left","middle","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("→TRA","NS",colors),
    tags:["logical"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.transitivity.expanded",
    title: "Implication Transitivity (Reduced output)",
    matchPattern: p('and(<left>...,implication(<x>,<y>),<middle>...,implication(<y>,<z>),<right>...)'),
    replacementPattern: p('and(<left>...,implication(<x>,<y>),<middle>...,implication(<y>,<z>),implication(<x>,<z>),<right>...)'),
    matchCaptures: ["x","y","z","left","middle","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("→TRA","NS ex",colors),
    tags:["logical"]
}));

Umform.registerRule(new Umform.Rule({
    name: "implication.transitivity.expaned2",
    title: "Implication Transitivity (Expanded output)",
    matchPattern: p('and(<left>...,implication(<y>,<z>),<middle>...,implication(<x>,<y>),<right>...)'),
    replacementPattern: p('and(<left>...,implication(<y>,<z>),<middle>...,implication(<x>,<y>),implication(<x>,<z>)<right>...)'),
    matchCaptures: ["x","y","z","left","middle","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("→TRA","NS ex",colors),
    tags:["logical"]
}));

// equivalence

Umform.registerRule(new Umform.Rule({
    name: "equivalence.definition.implication",
    title: "Equivalence Definition (Implication)",
    matchPattern: p('equivalence(<x>,<y>)'),
    replacementPattern: p('and(implication(<x>,<y>),implication(<y>,<x>))'),
    matchCaptures: ["x","y"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("↔DEF","→ →",colors),
    tags:["logical","definition"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.definition.implication.reverse",
    title: "Equivalence Definition (Implication,Reverse)",
    matchPattern: p('and(<left>...,implication(<x>,<y>),<middle>...,implication(<y>,<x>),<right>...)'),
    replacementPattern: p('and(<left>...,equivalence(<x>,<y>),<middle>...,<right>...)'),
    matchCaptures: ["x","y","left","middle","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("→ →","↔DEF",colors),
    tags:["logical","definition_reversed"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.definition.or",
    title: "Equivalence Definition (Or)",
    matchPattern: p('equivalence(<x>,<y>)'),
    replacementPattern: p('or(and(<x>,<y>),and(not(<x>),not(<y>)))'),
    matchCaptures: ["x","y"],
    freeCaptures: [],
    selectOrder: [p('implication(<x>,<y>)'),p('implication(<y>,<x>)')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("↔DEF","∨",colors),
    tags:["logical","definition"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.definition.or.reverse",
    title: "Equivalence Definition (Or,Reverse)",
    matchPattern: p('or(<left>...,and(<x>,<y>),<middle>...,and(not(<x>),not(<y>)),<right>...)'),
    replacementPattern: p('or(<left>...,equivalence(<x>,<y>),<middle>...,<right>...)'),
    matchCaptures: ["x","y","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('and(<x>,<y>)'),p('and(not(<x>),not(<y>))')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("∨","↔DEF",colors),
    tags:["logical","definition_reversed"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.truification",
    title: "Equivalence Truification",
    matchPattern: p('equivalence(<x>,<x>)'),
    replacementPattern: p('id{"true"}'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x↔x","TRUE",colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.falsification",
    title: "Equivalence Falsification",
    matchPattern: p('equivalence(<x>,not(<x>))'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x↔x̅","FALSE",colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.falsification2",
    title: "Equivalence Falsification",
    matchPattern: p('equivalence(not(<x>),<x>)'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x̅↔x","FALSE",colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.falsification.const",
    title: "Equivalence Falsification",
    matchPattern: p('equivalence(id{"true"},id{"false"})'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("1↔0","FALSE",colors),
    tags:["logical","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "equivalence.falsification2.const",
    title: "Equivalence Falsification",
    matchPattern: p('equivalence(not(id{"false"}),id{"true"})'),
    replacementPattern: p('id{"false"}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("0↔1","FALSE",colors),
    tags:["logical","shorten"]
}));