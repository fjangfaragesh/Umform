Umform.registerRule(new Umform.Rule({
    name: "forall.apply",
    title: "Apply Forall",
    matchPattern: p('forall(<x>,<y>)'),
    replacementPattern: p('and(forall(<x>,<y>),__replace__(<x>,<free>,<y>))'),
    matchCaptures: ['x','y'],
    freeCaptures: ['free'],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("∀",40,colors),
    tags:["logical","extend"]
}));