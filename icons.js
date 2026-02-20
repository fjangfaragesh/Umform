Umform.Icons = {};
Umform.Icons.ClassNameCounter = 0;

Umform.Icons.createBasic = function(svgContent, colors) {
    let borderRadius=10;

    colors = colors ?? {};

    let div = document.createElement("div");
    let className = "UmformIcon" + Umform.Icons.ClassNameCounter++;

    div.innerHTML = `\
<svg class="${className}" viewBox="0 0 64 64"
     fill="none"
     stroke="currentColor"
     stroke-width="3"
     stroke-linecap="round"
     stroke-linejoin="round"
     style="user-select:none;width:100%;height:100%;display:block;">

<style>
.${className} {
    color: ${colors.color ?? "#080044"};
    cursor: pointer;
    transition:
        color 0.15s ease,
        background 0.15s ease,
        transform 0.05s ease;
}

.${className} .bg {
    fill: ${colors.bg ?? "rgba(255, 255, 255, 0.6)"};
    stroke: currentColor;
    transition: fill 0.15s ease, stroke 0.15s ease;
}

.${className}:hover {
    color: ${colors.colorHover ?? "#1884ff"};
}

.${className}:hover .bg {
    fill: ${colors.bgHover ?? "rgba(227, 247, 255, 0.6)"};
}

.${className}:active {
    color: ${colors.colorActive ?? "#1884ff"};
    transform: scale(0.95);
}

.${className}:active .bg {
    fill: ${colors.bgActive ?? "rgba(135, 217, 255, 0.9)"};
}

.${className}.disabled {
    color: ${colors.colorDisabled ?? "#373737"};
    pointer-events: none;
}

.${className}.disabled .bg {
    fill: ${colors.bgDisabled ?? "rgba(0, 0, 0, 0.41)"};
    stroke: ${colors.colorDisabled ?? "#373737"};
}
</style>

<!-- Background -->
<rect class="bg"
      x="2"
      y="2"
      width="60"
      height="60"
      rx="${borderRadius}"
      ry="${borderRadius}" />

${svgContent}

</svg>`;
    return div.childNodes[0];
}

Umform.Icons.createTextIcon = function(text, fontSize, colors) {
    return Umform.Icons.createBasic(`
<text x="32" y="40" font-size="${fontSize}"
            fill="currentColor" stroke="none"
            text-anchor="middle" font-family="serif">${text}</text>`,
        colors);
}

Umform.Icons.createTextIcon2Lines = function(text1, text2, colors) {
    return Umform.Icons.createBasic(`
<!-- Text -->
<text x="32" y="28" font-size="20" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">${text1}</text>
<text x="32" y="48" font-size="20" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">${text2}</text>
`
    ,colors)
}

Umform.Icons.createCommutative = function(symbol, colors) {
    return Umform.Icons.createBasic(`
<!-- Text -->
<text x="14" y="38" font-size="18" fill="currentColor"
      stroke="none" text-anchor="middle" font-family="serif">▢</text>

<text x="32" y="40" font-size="30" fill="currentColor"
      stroke="none" text-anchor="middle" font-family="serif">${symbol}</text>

<text x="50" y="38" font-size="18" fill="currentColor"
      stroke="none" text-anchor="middle" font-family="serif">▢</text>

<!-- Oberer Pfeil -->
<path d="M 14 18 Q 17 8 32 8 Q 47 8 50 18" />
<path d="M 46 16 L 50 18 L 51 14"/>

<!-- Unterer Pfeil -->
<path d="M 50 46 Q 47 56 32 56 Q 17 56 14 46" />
<path d="M 18 48 L 14 46 L 13 50" />`
    ,colors);
};

Umform.Icons.iconFromRule = function(rule, colors) {
    throw new Error("ich bin alt");
    let name = rule.name;

    if (name === "not.not") return Umform.Icons.createTextIcon2Lines("NOT","NOT",colors);
    if (name === "not.false") return Umform.Icons.createTextIcon("~0",40,colors);
    if (name === "not.true") return Umform.Icons.createTextIcon("~1",40,colors);

    if (name === "and.empty") return Umform.Icons.createTextIcon2Lines("EMP","TY ∧",colors);
    if (name === "and.single") return Umform.Icons.createTextIcon2Lines("SING","LE ∧",colors);
    if (name === "and.commutative") return Umform.Icons.createCommutative('∧',colors);
    if (name === "and.associative") return Umform.Icons.createTextIcon2Lines('ASS','∧',colors);
    if (name === "and.idempotent") return Umform.Icons.createTextIcon2Lines('x ∧ x','IDEM',colors);
    if (name === "and.contradiction") return Umform.Icons.createTextIcon2Lines('x ∧ ~x','CNTR',colors);
    if (name === "and.contradiction2") return Umform.Icons.createTextIcon2Lines('~x ∧ x','CNTR',colors);
    if (name === "and.absorbtion") return Umform.Icons.createTextIcon2Lines('AB ∧','SORB',colors);
    if (name === "and.absorbtion2") return Umform.Icons.createTextIcon2Lines('AB ∧','SORB',colors);
    if (name === "and.neutrality") return Umform.Icons.createTextIcon2Lines('x ∧ 1','NEUT',colors);
    if (name === "and.falsification") return Umform.Icons.createTextIcon2Lines('x ∧ 0','FALS',colors);

    if (name === "or.empty") return Umform.Icons.createTextIcon2Lines("EMP","TY ∨",colors);
    if (name === "or.single") return Umform.Icons.createTextIcon2Lines("SING","LE ∨",colors);
    if (name === "or.commutative") return Umform.Icons.createCommutative('∨',colors);
    if (name === "or.associative") return Umform.Icons.createTextIcon2Lines('ASS','∨',colors);
    if (name === "or.idempotent") return Umform.Icons.createTextIcon2Lines('x ∨ x','IDEM',colors);
    if (name === "or.tautology") return Umform.Icons.createTextIcon2Lines('x ∨ ~x','TAUT',colors);
    if (name === "or.tautology2") return Umform.Icons.createTextIcon2Lines('~x ∨ x','TAUT',colors);
    if (name === "or.absorbtion") return Umform.Icons.createTextIcon2Lines('AB ∨','SORB',colors);
    if (name === "or.absorbtion2") return Umform.Icons.createTextIcon2Lines('AB ∨','SORB',colors);
    if (name === "or.neutrality") return Umform.Icons.createTextIcon2Lines('x ∨ 0','NEUT',colors);
    if (name === "or.truification") return Umform.Icons.createTextIcon2Lines('x ∨ 1','TRUE',colors);



    if (name === "and.distribute") return Umform.Icons.createTextIcon2Lines("∧DIS","TRY∨",colors);
    if (name === "or.distribute") return Umform.Icons.createTextIcon2Lines("∨DIS","TRY∧",colors);
    if (name === "and.deMorgan") return Umform.Icons.createTextIcon2Lines("∧ DE","MOR",colors);
    if (name === "or.deMorgan") return Umform.Icons.createTextIcon2Lines("∨ DE","MOR",colors);
    if (name === "and.deMorgan2") return Umform.Icons.createTextIcon2Lines("∧ DE","MOR",colors);
    if (name === "or.deMorgan2") return Umform.Icons.createTextIcon2Lines("∨ DE","MOR",colors);

    if (name === "sum.empty") return Umform.Icons.createBasic('',colors);
    if (name === "sum.single") return Umform.Icons.createBasic('',colors);
    if (name === "sum.commutative") return Umform.Icons.createCommutative('+',colors);
    if (name === "sum.associative") return Umform.Icons.createBasic('',colors);

    return Umform.Icons.createBasic('<text x="32" y="40" font-size="30" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">?</text>',colors);
}