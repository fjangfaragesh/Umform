Umform.registerRule(new Umform.Rule({
    name: "equals.swap",
    title: "Swap Equation Sides",
    matchPattern: p('equals(<lhs>,<rhs>)'),
    replacementPattern: p('equals(<rhs>,<lhs>)'),
    matchCaptures: ["lhs","rhs"],
    freeCaptures: [],
    selectOrder: []
}));






Umform.registerRule(new Umform.Rule({
    name: "equals.add.both",
    title: "Add Same Term to Both Sides",
    matchPattern: p('equals(<lhs>,<rhs>)'),
    replacementPattern: p('equals(sum(<lhs>,<x>),sum(<rhs>,<x>))'),
    matchCaptures: ["lhs","rhs"],
    freeCaptures: ["x"],
    selectOrder: []
}));