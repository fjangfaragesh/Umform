// TODO verschieb mich zu rules.math.complex, variablen richtig benennen (complex.i)
Umform.registerRule(new Umform.Rule({
    name: "math.complex.iSquare",
    title: "i^2 = -1",
    matchPattern: p('power(id{"math.constant.i"},number{2})'),
    replacementPattern: p('neg(number{1})'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("i^1","-1",colors),
    tags:["math.complex","shorten"]
}));


// sum
Umform.registerRule(new Umform.Rule({
    name: "sum.empty",
    title: "Empty Sum Equals Zero",
    matchPattern: p('sum()'),
    replacementPattern: p('number{0}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("EMP","TY +",colors),
    tags:["math.basic","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.single",
    title: "Single Summand Simplification",
    matchPattern: p('sum(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SING","LE +",colors),
    tags:["math.basic","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.commutative",
    title: "Commutativity of Addition",
    matchPattern: p('sum(<left>...,<a>,<middle>...,<b>,<right>...)'),
    replacementPattern: p('sum(<left>...,<b>,<middle>...,<a>,<right>...)'),
    matchCaptures: ["a","b","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<a>'), p('<b>')],
    createIconFunction: (colors) => Umform.Icons.createCommutative('+',colors),
    tags:["math.basic","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.associative",
    title: "Associativity of Addition",
    matchPattern: p('sum(<left>...,sum(<x>...),<right>...)'),
    replacementPattern: p('sum(<left>...,<x>...,<right>...)'),
    matchCaptures: ["left","x","right"],
    freeCaptures: [],
    selectOrder: [p('sum(<x>...)')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('ASS','+',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.extraBrackets",
    title: "Create Extra Brackets in Sum",
    matchPattern: p('sum(<left>...,<start>,<middle>...,<end>,<right>...)'),
    replacementPattern: p('sum(<left>...,extraBrackets(sum(<start>,<middle>...,<end>)),<middle>...,<right>...)'),
    matchCaptures: ["start","end","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<start>'),p('<end>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('a+❪b+c❫+d','⇛',colors),
    tags:["math.basic","protect"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.zero",
    title: "Addition of Zero",
    matchPattern: p('sum(<left>...,number{0},<right>...)'),
    replacementPattern: p('sum(<left>...,<right>...)'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('+0','ZERO',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.zero",
    title: "Addition of Zero Reversed",
    matchPattern: p('<x>'),
    replacementPattern: p('sum(<x>,extraBrackets(number{0}))'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛+0','ZERO',colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.inverse",
    title: "Addition of Negative",
    matchPattern: p('sum(<left>...,<x>,<middle>...,neg(<x>),<right>...)'),
    replacementPattern: p('sum(<left>...,<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x-x','',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.inverse2",
    title: "Addition of Negative",
    matchPattern: p('sum(<left>...,neg(<x>),<middle>...,<x>,<right>...)'),
    replacementPattern: p('sum(<left>...,<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x-x','',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.inverse.reversed",
    title: "Addition of Negative Reversed",
    matchPattern: p('<x>'),
    replacementPattern: p('sum(sum(<x>,neg(<free>)),extraBrackets(<free>))'),
    matchCaptures: ["x"],
    freeCaptures: ["free"],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛-x+x','',colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.same",
    title: "Addition of two same Summands",
    matchPattern: p('sum(<left>...,<x>,<middle>...,<x>,<right>...)'),
    replacementPattern: p('sum(<left>...,product(number{2},<x>),<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('x+x','',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.same.reversed",
    title: "Addition of two same Summands (reversed)",
    matchPattern: p('product(<left>...,number{2},<right>...)'),
    replacementPattern: p('sum(product(<left>...,<right>...))'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛x+x','',colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.number.split",
    title: "Split Number into Sum",
    matchPattern: p('<x>number{*}'),
    replacementPattern: p('sum(__calc__(sum(<x>, neg(<free>))),<free>)'),
    matchCaptures: ["x"],
    freeCaptures: ["free"],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('4⇛2+2','SPLIT',colors),
    tags:["math.basic","extend"]
}));

// neg

Umform.registerRule(new Umform.Rule({
    name: "neg.neg",
    title: "Double Negative",
    matchPattern: p('neg(neg(<x>))'),
    replacementPattern: p('<x>'),
    matchCaptures: ['x'],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("--",40,colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.neg.reversed",
    title: "Double Negative (Reversed)",
    matchPattern: p('<x>'),
    replacementPattern: p('neg(extraBrackets(neg(<x>)))'),
    matchCaptures: ['x'],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("⇛--",40,colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.zero",
    title: "Negative of Zero",
    matchPattern: p('neg(number{0})'),
    replacementPattern: p('number{0}'),
    matchCaptures: [],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("-0",40,colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.signExtraction",
    title: "Sign Extraction",
    matchPattern: p('product(<left>...,neg(<x>),<right>...)'),
    replacementPattern: p('neg(product(<left>...,<x>,<right>...))'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("x·-y",20,colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.signMove",
    title: "Sign Move",
    matchPattern: p('product(<left>...,<y>,<middle>...,neg(<x>),<right>...)'),
    replacementPattern: p('product(<left>...,neg(<y>),<middle>...,<x>,<right>...)'),
    matchCaptures: ["x","y","left","right","middle"],
    freeCaptures: [],
    selectOrder: [p('neg(<x>)'),p('<y>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('SIGN','⮜MOVE',colors),
    tags:["math.basic","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.signMove2",
    title: "Sign Move",
    matchPattern: p('product(<left>...,neg(<x>),<middle>...,<y>,<right>...)'),
    replacementPattern: p('product(<left>...,<x>,<middle>...,neg(<y>),<right>...)'),
    matchCaptures: ["x","y","left","right","middle"],
    freeCaptures: [],
    selectOrder: [p('neg(<x>)'),p('<y>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('SIGN','MOVE⮞',colors),
    tags:["math.basic","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.signMove3",
    title: "Sign Move",
    matchPattern: p('neg(product(<left>...,<y>,<right>...))'),
    replacementPattern: p('product(<left>...,neg(<y>),<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('neg(<x>)'),p('<y>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('SIGN','MOVE',colors),
    tags:["math.basic","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.signToNeg1",
    title: "Sign no -1",
    matchPattern: p('neg(<x>)'),
    replacementPattern: p('product(neg(number{1}),<x>)'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("- to -1",10,colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "neg.neg1signSign",
    title: "-1 to Sign",
    matchPattern: p('product(<left>...,neg(number{1}),<right>...)'),
    replacementPattern: p('neg(product(<left>...,<right>...))'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [p('neg(number{1})')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("-1 to -",10,colors),
    tags:["math.basic","reshape"]
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
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("EMP","TY ·",colors),
    tags:["math.basic","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.single",
    title: "Single Factor Simplification",
    matchPattern: p('product(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SING","LE ·",colors),
    tags:["math.basic","shorten","make_valid"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.commutative",
    title: "Commutativity of Multiplication",
    matchPattern: p('product(<left>...,<x>,<middle>...,<y>,<right>...)'),
    replacementPattern: p('product(<left>...,<y>,<middle>...,<x>,<right>...)'),
    matchCaptures: ["x","y","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>'), p('<y>')],
    createIconFunction: (colors) => Umform.Icons.createCommutative('·',colors),
    tags:["math.basic","reorder"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.associative",
    title: "Associativity of Multiplication",
    matchPattern: p('product(<left>...,product(<x>...),<right>...)'),
    replacementPattern: p('product(<left>...,<x>...,<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('product(<x>...)')],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('ASS','·',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.extraBrackets",
    title: "Create Extra Brackets in Product",
    matchPattern: p('product(<left>...,<start>,<middle>...,<end>,<right>...)'),
    replacementPattern: p('product(<left>...,extraBrackets(product(<start>,<middle>...,<end>)),<right>...)'),
    matchCaptures: ["start","end","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<start>'),p('<end>')],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('a·❪b·c❫·d','⇛',colors),
    tags:["math.basic","protect"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.zero",
    title: "Product with Zero",
    matchPattern: p('product(<left>...,number{0},<right>...)'),
    replacementPattern: p('number{0}'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('·0','ZERO',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.one",
    title: "Product with One",
    matchPattern: p('product(<left>...,number{1},<right>...)'),
    replacementPattern: p('product(<left>...,<right>...)'),
    matchCaptures: ["left","right"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('·1','ONE',colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.one.reversed",
    title: "Product with One Reversed",
    matchPattern: p('<x>'),
    replacementPattern: p('product(<x>,extraBrackets(number{1}))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('⇛·1','ONE',colors),
    tags:["math.basic","extend"]
}));

// sum,product

Umform.registerRule(new Umform.Rule({
    name: "product.distribute",
    title: "Multiply Out (Distributive Law of Multiplication over Addition)",
    matchPattern: p('product(<left>...,sum(<x>...),<right>...)'),
    replacementPattern: p('sum(__map__(<x>...,<xi>,product(<left>...,<xi>,<right>...)))'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('sum(<x>...)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("· DIS","TRI +",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.factor.common",
    title: "Factor Out Common Term",
    matchPattern: p('sum(<left>...,product(<leftleft>...,<x>,<leftright>...),<middle>...,product(<rightleft>...,<x>,<rightrigh>...),<right>...)'),
    replacementPattern: p('sum(<left>...,product(<x>,sum(product(<leftleft>...,<leftright>...),product(<rightleft>...,<rightrigh>...))),<middle>...,<right>...)'),
    matchCaptures: ["x","left","leftleft","leftright","middle","rightleft","rightrigh","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("· FAC","OUT +",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.factor.common2",
    title: "Factor Out Common Term",
    matchPattern: p('sum(<left>...,<x>,<middle>...,product(<rightleft>...,<x>,<rightrigh>...),<right>...)'),
    replacementPattern: p('sum(<left>...,product(<x>,sum(number{1},product(<rightleft>...,<rightrigh>...))),<middle>...,<right>...)'),
    matchCaptures: ["x","left","middle","rightleft","rightrigh","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("· FAC","OUT +",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "sum.factor.common3",
    title: "Factor Out Common Term",
    matchPattern: p('sum(<left>...,product(<leftleft>...,<x>,<leftright>...),<middle>...,<x>,<right>...)'),
    replacementPattern: p('sum(<left>...,product(<x>,sum(product(<leftleft>...,<leftright>...),number{1})),<middle>...,<right>...)'),
    matchCaptures: ["x","left","leftleft","leftright","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("· FAC","OUT +",colors),
    tags:["math.basic","reshape"]
}));

// fraction

Umform.registerRule(new Umform.Rule({
    name: "fraction.identity",
    title: "Divide by One",
    matchPattern: p('fraction(<x>,number{1})'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x/1","IDENT",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.identity.reversed",
    title: "Divide by One (Reversed)",
    matchPattern: p('<x>'),
    replacementPattern: p('fraction(<x>,extraBrackets(number{1}))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("⇛x/1","IDENT",colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.zeroNumerator",
    title: "Zero Numerator",
    matchPattern: p('fraction(number{0},<x>)'),
    replacementPattern: p('number{0}'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("0/x","ZERO",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.selfDivision",
    title: "Self Division",
    matchPattern: p('fraction(<x>,<x>)'),
    replacementPattern: p('number{1}'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x/x","SELF",colors),
    tags:["math.basic","shorten"]
}));

// TODO: <free> != 0
Umform.registerRule(new Umform.Rule({
    name: "fraction.selfDivision.reversed",
    title: "Self Division (reversed)",
    matchPattern: p('number{1}'),
    replacementPattern: p('fraction(extraBrackets(<free>),extraBrackets(<free>))'),
    matchCaptures: [],
    freeCaptures: ["free"],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("⇛x/x","SELF",colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.shortenFraction",
    title: "Shorten Fraction",
    matchPattern: p('fraction(product(<left>...,<x>,<right>...),product(<bottomleft>...,<x>,<bottomright>...))'),
    replacementPattern: p('fraction(product(<left>...,<right>...),product(<bottomleft>...,<bottomright>...))'),
    matchCaptures: ["x","left","right","bottomleft","bottomright"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SHORT","FRACT",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.shortenFraction2",
    title: "Shorten Fraction",
    matchPattern: p('fraction(<x>,product(<bottomleft>...,<x>,<bottomright>...))'),
    replacementPattern: p('fraction(number{1},product(<bottomleft>...,<bottomright>...))'),
    matchCaptures: ["x","bottomleft","bottomright"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SHORT","FRACT",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.shortenFraction3",
    title: "Shorten Fraction",
    matchPattern: p('fraction(product(<left>...,<x>,<right>...),<x>)'),
    replacementPattern: p('product(<left>...,<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SHORT","FRACT",colors),
    tags:["math.basic","shorten"]
}));

// TODO: <free> != 0
Umform.registerRule(new Umform.Rule({
    name: "fraction.extendFraction",
    title: "Extend Fraction",
    matchPattern: p('fraction(<numerator>,<denumerator>)'),
    replacementPattern: p('fraction(product(<numerator>,<free>),product(<denumerator>,<free>))'),
    matchCaptures: ["numerator","denumerator"],
    freeCaptures: ["free"],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("EXTND","FRACT",colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.nested.numerator",
    title: "Zero Numerator",
    matchPattern: p('fraction(fraction(<x>,<y>),<z>)'),
    replacementPattern: p('fraction(<x>,product(<y>,<z>))'),
    matchCaptures: ["x","y","z"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("((x/y)/z)","NESTD",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.nested.denumerator",
    title: "Zero Numerator",
    matchPattern: p('fraction(<x>,fraction(<y>,<z>))'),
    replacementPattern: p('fraction(product(<x>,<z>),<y>)'),
    matchCaptures: ["x","y","z"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("((x/y)/z)","NESTD",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.sumOfFractions",
    title: "Sum of Fractions",
    matchPattern: p('sum(<left>...,fraction(<a>,<b>),<middle>...,fraction(<c>,<d>),<right>...)'),
    replacementPattern: p('sum(<left>...,fraction(sum(product(<a>,<d>),product(<c>,<b>)),product(<b>,<d>)),<middle>...,<right>...)'),
    matchCaptures: ["a","b","c","d","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('fraction(<a>,<b>)'),p('fraction(<c>,<d>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("a/b+c/d","SUM",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.sumOfFraction",
    title: "Sum of Fraction",
    matchPattern: p('sum(<left>...,<a>,<middle>...,fraction(<b>,<c>),<right>...)'),
    replacementPattern: p('sum(<left>...,fraction(sum(product(<a>,<c>),<b>),<c>),<right>...)'),
    matchCaptures: ["a","b","c","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('fraction(<b>,<c>)'),p('<a>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("a+b/c","SUM",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.sumOfFraction2",
    title: "Sum of Fraction",
    matchPattern: p('sum(<left>...,fraction(<a>,<b>),<middle>...,<c>,<right>...)'),
    replacementPattern: p('sum(<left>...,fraction(sum(<a>,product(<c>,<b>)),<b>),<middle>...,<right>...)'),
    matchCaptures: ["a","b","c","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('fraction(<a>,<b>)'),p('<c>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("a/b+c","SUM",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.productOfFractions",
    title: "Product of Fractions",
    matchPattern: p('product(<left>...,fraction(<a>,<b>),<middle>...,fraction(<c>,<d>),<right>...)'),
    replacementPattern: p('product(<left>...,fraction(product(<a>,<c>),product(<b>,<d>)),<middle>...,<right>...)'),
    matchCaptures: ["a","b","c","d","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('fraction(<a>,<b>)'),p('fraction(<c>,<d>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("a/b·c/d","PRD",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.productXFraction",
    title: "Product of Fraction",
    matchPattern: p('product(<left>...,<a>,<middle>...,fraction(<b>,<c>),<right>...)'),
    replacementPattern: p('product(<left>...,fraction(product(<a>,<b>),product(<c>)),<middle>...,<right>...)'),
    matchCaptures: ["a","b","c","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<a>'),p('fraction(<b>,<c>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("a·b/c","PRD",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.productXFraction2",
    title: "Product of Fraction",
    matchPattern: p('product(<left>...,fraction(<a>,<b>),<middle>...,<c>,<right>...)'),
    replacementPattern: p('product(<left>...,fraction(product(<a>,<c>),product(<b>)),<middle>...,<right>...)'),
    matchCaptures: ["a","b","c","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('<c>'),p('fraction(<a>,<b>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("a/b·c","PRD",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.split",
    title: "Split Fraction",
    matchPattern: p('fraction(sum(<left>...,<beforeSplit>,<afterSplit>,<right>...),<denumerator>)'),
    replacementPattern: p('sum(fraction(sum(<left>...,<beforeSplit>),<denumerator>),fraction(sum(<afterSplit>,<right>...),<denumerator>))'),
    matchCaptures: ["afterSplit","left","beforeSplit","right"],
    freeCaptures: [],
    selectOrder: [p('<afterSplit>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("SPLIT","FRACT",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.extractFactor.numerator",
    title: "Extract Factor from Numerator",
    matchPattern: p('fraction(product(<left>...,<x>,<right>...),<denumerator>)'),
    replacementPattern: p('product(<x>,fraction(product(<left>...,<right>...),<denumerator>))'),
    matchCaptures: ["x","left","right","denumerator"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("FACTOR","XTRCT",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.extractNumerator",
    title: "Extract Numerator",
    matchPattern: p('fraction(<x>,<denumerator>)'),
    replacementPattern: p('product(<x>,fraction(number{1},<denumerator>))'),
    matchCaptures: ["x","denumerator"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("NMRT","XTRCT",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.extractFactor.denumerator",
    title: "Extract Factor from Numerator",
    matchPattern: p('fraction(<numerator>,product(<left>...,<x>,<right>...))'),
    replacementPattern: p('product(fraction(number{1},<x>),fraction(<numerator>,product(<left>...,<right>...)))'),
    matchCaptures: ["x","left","right","numerator"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("FACTOR","XTRCT",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.toPower",
    title: "Denumerator to Power",
    matchPattern: p('fraction(<numerator>,<denumerator>)'),
    replacementPattern: p('product(<numerator>,power(<denumerator>,neg(number{1})))'),
    matchCaptures: ["numerator","denumerator"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x/y","⇛x·y^-1",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.toPower2",
    title: "Denumerator to Power",
    matchPattern: p('fraction(<numerator>,power(<base>,<exp>))'),
    replacementPattern: p('product(<numerator>,power(<base>,neg(exp)))'),
    matchCaptures: ["numerator","base","exp"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x/y^z","⇛x·y^-z",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "fraction.toPower3",
    title: "Denumerator to Power",
    matchPattern: p('fraction(<numerator>,power(<base>,neg(<exp>)))'),
    replacementPattern: p('product(<numerator>,power(<base>,<exp>))'),
    matchCaptures: ["numerator","base","exp"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x/y^-z","⇛x·y^z",colors),
    tags:["math.basic","reshape"]
}));

// power:
Umform.registerRule(new Umform.Rule({
    name: "power.expOne",
    title: "Power Exponent One",
    matchPattern: p('power(<x>,number{1})'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x^1","POW",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.expOne.reversed",
    title: "Power Exponent One (Reversed)",
    matchPattern: p('<x>'),
    replacementPattern: p('power(<x>,extraBrackets(number{1}))'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("⇛x^1","POW",colors),
    tags:["math.basic","extend"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.expZero",
    title: "Power Exponent Zero",
    matchPattern: p('power(<x>,number{0})'),
    replacementPattern: p('number{1}'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x^0","POW",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.expZero.reversed",
    title: "Power Exponent Zero (Reversed)",
    matchPattern: p('number{1}'),
    replacementPattern: p('power(<free>,number{0})'),
    matchCaptures: [],
    freeCaptures: ["free"],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("⇛x^0","POW",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.nested",
    title: "Power of Power",
    matchPattern: p('power(power(<x>,<y>),<z>)'),
    replacementPattern: p('power(<x>,product(<y>,<z>))'),
    matchCaptures: ["x","y","z"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("(x^y)^z","NEST",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.nested.reversed",
    title: "Power of Power (Reversed)",
    matchPattern: p('power(<x>,product(<left>...,<y>,<right>...))'),
    replacementPattern: p('power(power(<x>,<left>...,<right>...),<y>)'),
    matchCaptures: ["x","y","left","right"],
    freeCaptures: [],
    selectOrder: [p('<y>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("(x^y)^z","⇛NEST",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.productSameBase",
    title: "Product of Powers with same Base",
    matchPattern: p('product(<left>...,power(<base>,<exp1>),<middle>...,power(<base>,<exp2>),<right>...)'),
    replacementPattern: p('product(<left>...,power(<base>,sum(<exp1>,<exp2>)),<middle>...,<right>...)'),
    matchCaptures: ["base","exp1","exp2","left","right"],
    freeCaptures: [],
    selectOrder: [p('power(<base>,<exp1>)'),p('power(<base>,<exp2>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("(b^x)(b^y)","SM BSE",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.expSum",
    title: "Power with Sum as Exponent",
    matchPattern: p('power(<base>,sum(<left>...,<beforeSplit>,<afterSplit>,<right>...))'),
    replacementPattern: p('product(power(<base>,sum(<left>...,<beforeSplit>)),power(<base>,sum(<afterSplit>,<right>...)))'),
    matchCaptures: ["base","beforeSplit","afterSplit","left","right"],
    freeCaptures: [],
    selectOrder: [p('<afterSplit>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("b^(x+y)","SPLT",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.productBase",
    title: "Product of Power and Base",
    matchPattern: p('product(<left>...,<base>,<middle>...,power(<base>,<exp2>),<right>...)'),
    replacementPattern: p('product(<left>...,power(<base>,sum(number{1},<exp2>)),<middle>...,<right>...)'),
    matchCaptures: ["base","exp2","left","right"],
    freeCaptures: [],
    selectOrder: [p('power(<base>,<exp2>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("b(b^y)","BASE",colors),
    tags:["math.basic","reshape"]
}));


Umform.registerRule(new Umform.Rule({
    name: "power.productBase2",
    title: "Product of Power and Base",
    matchPattern: p('product(<left>...,power(<base>,<exp1>),<middle>...,<base>,<right>...)'),
    replacementPattern: p('product(<left>...,power(<base>,sum(number{1},<exp1>)),<middle>...,<right>...)'),
    matchCaptures: ["base","exp1","left","right"],
    freeCaptures: [],
    selectOrder: [p('power(<base>,<exp1>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("(b^x)b","BASE",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.create",
    title: "Create Power from two same Factora",
    matchPattern: p('product(<left>...,<x>,<middle>...,<x>,<right>...)'),
    replacementPattern: p('product(<left>...,power(<x>,number{2}),<middle>...,<right>...)'),
    matchCaptures: ["x","left","right"],
    freeCaptures: [],
    selectOrder: [p('<x>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x·x","POW",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.create.reversed",
    title: "Create Power from two same Factora (reversed)",
    matchPattern: p('power(<x>,number{2})'),
    replacementPattern: p('product(<x>,<x>)'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("⇛x·x","POW",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.negExp",
    title: "Power with negative Exponent",
    matchPattern: p('power(<x>,neg(<y>))'),
    replacementPattern: p('fraction(number{1},power(<x>,<y>))'),
    matchCaptures: ["x","y"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x^-y","NG EXP",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.negExp.reversed",
    title: "Power with negative Exponent (Reversed)",
    matchPattern: p('fraction(number{1},power(<x>,<y>))'),
    replacementPattern: p('power(<x>,neg(<y>))'),
    matchCaptures: ["x","y"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("⇛x^-y","NG EXP",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.productSameExponent",
    title: "Product of Power with same Exponent",
    matchPattern: p('product(<left>...,power(<x>,<exp>),<middle>...,power(<y>,<exp>),<right>...)'),
    replacementPattern: p('product(<left>...,power(product(<x>,<y>),<exp>),<middle>...,<right>...)'),
    matchCaptures: ["x","y","exp","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('power(<x>,<exp>)'),p('power(<y>,<exp>)')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x^z·y^z","POW",colors),
    tags:["math.basic","shorten"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.split",
    title: "Split Power with Product as Base",
    matchPattern: p('power(product(<left>...,<beforeSplit>,<afterSplit>,<right>...),<exp>)'),
    replacementPattern: p('product(power(product(<left>...,<beforeSplit>),<exp>),power(product(<afterSplit>,<right>...),<exp>))'),
    matchCaptures: ["afterSplit","beforeSplit","exp","left","right"],
    freeCaptures: [],
    selectOrder: [p('<afterSplit>')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("x^z·y^z","⇛POW",colors),
    tags:["math.basic","reshape"]
}));

// binomial formulas

Umform.registerRule(new Umform.Rule({
    name: "power.binomialFormula1",
    title: "First Binomial Formula",
    matchPattern: p('power(sum(<a>,<b>),number{2})'),
    replacementPattern: p('sum(power(<a>,number{2}),product(number{2},<a>,<b>),power(<b>,number{2}))'),
    matchCaptures: ["a","b"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("BINO","1",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "power.binomialFormula2",
    title: "Second Binomial Formula",
    matchPattern: p('power(sum(<a>,neg(<b>)),number{2})'),
    replacementPattern: p('sum(power(<a>,number{2}),neg(product(number{2},<a>,<b>)),power(<b>,number{2}))'),
    matchCaptures: ["a","b"],
    freeCaptures: [],
    selectOrder: [],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("BINO","2",colors),
    tags:["math.basic","reshape"]
}));

Umform.registerRule(new Umform.Rule({
    name: "product.binomialFormula3",
    title: "Third Binomial Formula",
    matchPattern: p('product(<left>...,sum(<a>,<b>),<middle>...,sum(<a>,neg(<b>)),<right>...)'),
    replacementPattern: p('product(<left>...,sum(power(<a>,number{2}),neg(power(<b>,number{2}))),<middle>...,<right>...)'),
    matchCaptures: ["a","b","left","middle","right"],
    freeCaptures: [],
    selectOrder: [p('sum(<a>,<b>)'),p('sum(<a>,neg(<b>))')],
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines("BINO","3",colors),
    tags:["math.basic","reshape"]
}));