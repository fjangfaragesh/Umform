// sum
Umform.registerRule(new Umform.Rule({
    name: "sum.empty",
    title: "Empty Sum Equals Zero",
    matchPattern: p('sum()'),
    replacementPattern: p('number{0}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.single",
    title: "Single Summand Simplification",
    matchPattern: p('sum(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: true
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.commutative",
    title: "Commutativity of Addition",
    matchPattern: p('sum(<left>...,<a>,<middle>...,<b>,<right>...)'),
    replacementPattern: p('sum(<left>...,<b>,<middle>...,<a>,<right>...)'),
    matchCaptures: ["a","b","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<a>'), p('<b>')]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.associative",
    title: "Associativity of Addition",
    matchPattern: p('sum(<left>...,sum(<x>...),<right>...)'),
    replacementPattern: p('sum(<left>...,<x>...,<right>...)'),
    matchCaptures: ["left","x","right"],
    freeCaptures: [],
    selectOrder: [p('sum(<x>...)')],
    isAutoRule: true
}));

// product
Umform.registerRule(new Umform.Rule({
    name: "product.empty",
    title: "Empty Product Equals One",
    matchPattern: p('product()'),
    replacementPattern: p('number{1}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true
}));

Umform.registerRule(new Umform.Rule({
    name: "product.single",
    title: "Single Factor Simplification",
    matchPattern: p('product(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: true
}));

Umform.registerRule(new Umform.Rule({
    name: "product.commutative",
    title: "Commutativity of Multiplication",
    matchPattern: p('product(<left>...,<x>,<middle>...,<y>,<right>...)'),
    replacementPattern: p('product(<left>...,<y>,<middle>...,<x>,<right>...)'),
    matchCaptures: ["x","y","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>'), p('<y>')]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.associative",
    title: "Associativity of Multiplication",
    matchPattern: p('product(<left>...,product(<x>...),<right>...)'),
    replacementPattern: p('product(<left>...,<x>...,<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('product(<x>...)')],
    isAutoRule: true
}));



// sum,product

Umform.registerRule(new Umform.Rule({
    name: "product.distribute",
    title: "Multiply Out (Distributive Law of Multiplication over Addition)",
    matchPattern: p('product(<left>...,sum(<x>...),<right>...)'),
    replacementPattern: p('sum(__map__(<x>...,<xi>,product(<left>...,<xi>,<right>...)))'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('sum(<x>...)')]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.factor.common",
    title: "Factor Out Common Term",
    matchPattern: p('sum(<left>...,product(<leftleft>...,<x>,<leftright>...),<middle>...,product(<rightleft>...,<x>,<rightrigh>...),<right>...)'),
    replacementPattern: p('sum(<left>...,product(<x>,sum(product(<leftleft>...,<leftright>...),product(<rightleft>...,<rightrigh>...))),<middle>...,<right>...)'),
    matchCaptures: ["x","left","leftleft","leftright","middle","rightleft","rightrigh","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')]
}));