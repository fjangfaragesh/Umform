const Umform = {};

Umform.ExprNode = class ExprNode {
    // type: string
    // children: ExprNode array.
    // data: PlainObject
    constructor({type, children = [], data = null}) {
        this.type = type;
        this.children = children;
        this.data = data;
    }

    clone() {
        return new ExprNode({
            type: this.type,
            data: structuredClone(this.data),
            children: this.children.map(c => c.clone())
        });
    }

    cloneReplace(nodeToReplace, replacementNode) {
        if (this === nodeToReplace) {
            return replacementNode.clone();
        }
        return new ExprNode({
            type: this.type,
            data: structuredClone(this.data),
            children: this.children.map(c => c.cloneReplace(nodeToReplace, replacementNode))
        });
    }

    equals(otherNode) {
        if (this.type !== otherNode.type) return false;
        if (JSON.stringify(this.data) !== JSON.stringify(otherNode.data)) return false;
        if (this.children.length !== otherNode.children.length) return false;
        for (let i = 0; i < this.children.length; i++) {
            if (!this.children[i].equals(otherNode.children[i])) return false;
        }
        return true;
    }


    stringify() {
        return Umform.ExprNode.stringify(this);
    }


    getAllChildren() {
        const result = [];
        const stack = [...this.children];
        while (stack.length > 0) {
            const node = stack.pop();
            result.push(node);
            stack.push(...node.children);
        }
        return result;
    }

    getAllNodes() {
        return [this, ...this.getAllChildren()];
    }

    foreach(callback) {
        callback(this);
        this.children.forEach(c => c.foreach(callback));
    }

    findAll(condition) {
        const result = [];
        this.foreach(node => {
            if (condition(node)) {
                result.push(node);
            }
        });
        return result;
    }

    // Prüfen, ob der Baum Zyklen enthält
    hasCycles() {
        const visited = new Set();

        const visit = (node, path = new Set()) => {
            if (path.has(node)) return true;  // Zyklus entdeckt
            path.add(node);

            for (const child of node.children) {
                if (visit(child, path)) return true;
            }

            path.delete(node);
            return false;
        };

        return visit(this);
    }

    // Prüfen, ob der Baum mehrfach die gleiche Instanz enthält
    hasDuplicateNodes() {
        const seen = new Set();

        const visit = (node) => {
            if (seen.has(node)) return true; // gleiche Instanz mehrfach
            seen.add(node);
            for (const child of node.children) {
                if (visit(child)) return true;
            }
            return false;
        };

        return visit(this);
    }

    // Kombinierte Prüfung: Baum gültig, keine Zyklen, keine mehrfachen Instanzen
    isValidTree() {
        return !this.hasCycles() && !this.hasDuplicateNodes();
    }
}


// ohne operanten "type"
// mit operanten "type(operant1, operant2, ...)"
// zusätzlich mit zusatzdaten "type{data}(operant1, operant2, ...)", wobei data ein json ist
// beispiel: sum(number{1},number{2},neg(number{3})) -> 1 + 2 + -(3) -> 1 + 2 - 3
// beispiel: product(var{"a"},var{"namespace1.b"},var{"const.math.e"}) -> a * b * e (wobei mit e die konstante e gemeint ist)
// beispiel: matproduct(var{"A"},var{"B"}) -> A*B, wobei mit * das nicht kommutative Produkt von Matritzen gemeint ist
// beispiel: op{"sum"} -> meint die Summenoperation, aber als Operant (für Gruppen oder Mengen wichtig, wo Opertionen auch teil sein können)
// beispiel: set.explicit(number{1},var{"A"},op{"matproduct"}) -> Die Menge {1,A,*}, wobei * das Produkt zweier Matritzen ist
// beispiel: equals(var{"a"} = var{"b"}) --> Die gleichung a = b
Umform.ExprNode.parse = function (str) {
    let i = 0;

    function skipWs() {
        while (i < str.length && /\s/.test(str[i])) i++;
    }

    function peek() {
        skipWs();
        return str[i];
    }

    function consume(char) {
        skipWs();
        if (str[i] !== char) {
            throw new Error("Erwartet '" + char + "' bei Position " + i);
        }
        i++;
    }

    function parseIdentifier() {
        skipWs();
        let start = i;
        while (i < str.length && /[a-zA-Z0-9_.]/.test(str[i])) i++;
        if (start === i) {
            throw new Error("Identifier erwartet bei Position " + i);
        }
        return str.slice(start, i);
    }

    function parseData() {
        skipWs();
        if (peek() !== "{") return null;
        let start = i;
        let depth = 0;

        while (i < str.length) {
            if (str[i] === "{") depth++;
            else if (str[i] === "}") {
                depth--;
                if (depth === 0) {
                    i++;
                    break;
                }
            }
            i++;
        }

        const jsonStr = str.slice(start + 1, i - 1);
        return JSON.parse(jsonStr);
    }

    function parseChildren() {
        skipWs();
        if (peek() !== "(") return [];

        consume("(");
        const children = [];

        while (true) {
            skipWs();
            if (peek() === ")") {
                consume(")");
                break;
            }

            children.push(parseExpression());

            skipWs();
            if (peek() === ",") {
                consume(",");
                continue;
            }
            if (peek() === ")") {
                consume(")");
                break;
            }
        }

        return children;
    }

    function parseExpression() {
        skipWs();

        // Capture erkennen
        if (peek() === "<") {
            return parseCapture();
        }

        const type = parseIdentifier();
        const data = parseData();
        const children = parseChildren();

        return new Umform.ExprNode({
            type,
            data,
            children
        });
    }

    function parseCapture() {
        consume("<");
        const name = parseIdentifier();
        consume(">");

        skipWs();

        let variadic = false;
        if (str.slice(i, i + 3) === "...") {
            i += 3;
            variadic = true;
        }

        return new Umform.ExprNode({
            type: "__capture__",
            data: { name, variadic },
            children: []
        });
    }

    const result = parseExpression();
    skipWs();

    if (i !== str.length) {
        throw new Error("Unerwarteter Rest bei Position " + i);
    }

    return result;
};

function p(x) {
    return Umform.ExprNode.parse(x);
}

Umform.ExprNode.stringify = function(node) {
    if (!node) return "";

    let str = node.type;

    // Daten als JSON, falls vorhanden
    if (node.data !== null) {
        str += "{" + JSON.stringify(node.data) + "}";
    }

    // Kinder rekursiv
    if (node.children && node.children.length > 0) {
        str += "(" + node.children.map(c => Umform.ExprNode.stringify(c)).join(",") + ")";
    }

    return str;
};

Umform.TypeDefinition = class {
    constructor() {

    }
    getName() {
        throw new Error("implement me");
    }
    getPrecedence() {
        throw new Error("implement me");
    }
    createBox(exprNodeUI, node, parentPrec) {
        throw new Error("implement me");
    }
}

Umform.UNKNOWN_TYPE_DEFINITION = new class extends Umform.TypeDefinition {
    getName() {
        return "UNKNOWN_TYPE";
    }   
    getPrecedence() {
        return 0;
    }
    createBox(exprNodeUI, node, parentPrec) {
        const textbox = new TextBox("<?>");
        return {box:textbox, nodeContentElements:[textbox]}
    }
}();

Umform.TYPE_REGISTRY = new Map();
Umform.registerType = function(typeDef) {
    Umform.TYPE_REGISTRY.set(typeDef.getName(), typeDef);
}
Umform.getTypeDefinition = function(typeName) {
    return Umform.TYPE_REGISTRY.get(typeName) || Umform.UNKNOWN_TYPE_DEFINITION;
}

Umform.RULES = new Map();
Umform.AUTO_RULES = new Map();

Umform.registerRule = function(rule) {
    Umform.RULES.set(rule.name, rule);
    if (rule.isAutoRule) {
        Umform.AUTO_RULES.set(rule.name, rule);
    }
}

Umform.getRule = function(ruleName) {
    return Umform.RULES.get(ruleName);
}

// basic operationen: 
// sum(a,b,c,...); subtraktion gibt es nicht, a-b --> sum(a,neg(b))
// neg(a)  --> -a
// product(a,b,c,...)
// fraction(denominator,numerator)
// power(base,exponent)
// equation(left,right)
// and(a,b,c,...)
// or(a,b,c,...)
// not(a)
// forall(var, expression)


Umform.Rule = class {
    constructor({name, title, matchPattern, replacementPattern, matchCaptures, freeCaptures=[], selectOrder=[], isAutoRule=false}) {
        this.name = name;
        this.title = title;
        this.matchPattern = matchPattern;
        this.replacementPattern = replacementPattern;
        this.matchCaptures = matchCaptures;
        this.freeCaptures = freeCaptures;
        this.selectOrder = selectOrder;
        this.isAutoRule = isAutoRule;
    }

    matches(expr) {
        return matchAll(this.matchPattern, expr).length > 0;
    }

    getSelectableNodes(expr, initialBindings, selectOrderIndex) {
        let selectableNodes = new Set();
        let nextSelectionPattern = this.selectOrder[selectOrderIndex];

        function calcSelectableNodesRecursive(n) {
            if (matchAll(nextSelectionPattern,n,initialBindings).length > 0) {
                selectableNodes.add(n);
            }
            for (let child of n.children) {
                calcSelectableNodesRecursive(child);
            }
        }

        calcSelectableNodesRecursive(expr);
        return selectableNodes; 
    }

    getMatches(expr, initialBindings) {
        return matchAll(this.matchPattern, expr, initialBindings);
    }

    apply(expr, matchIndex = 0, freeCaptureValues = new Map(), initialMatches) {
        /*for (let freeCaptureName of this.freeCaptures) {
            if (!freeCaptureValues.has(freeCaptureName)) {
                freeCaptureValues.set(freeCaptureName, Umform.ExprNode.parse("_"));
            }
        }*/
        const matches = this.getMatches(expr, initialMatches);
        const binding = matches[matchIndex];
        if (!binding) {
            throw new Error("No match at index " + matchIndex);
        }
        for (let [key, value] of freeCaptureValues) {
            if (!this.freeCaptures.includes(key)) {
                throw new Error("Capture " + key + " is not a free capture of this rule");
            }
            if (binding.has(key)) {
                throw new Error("Capture " + key + " is already bound in the match");
            }
            binding.set(key, value);
        }
        return applyReplacement(binding, this.replacementPattern);
    }
}

function matchAll(pattern, expr, initialBindings = new Set([new Map()])) {
    function matchNode(pn, en, bindings) {
        if (pn.type === "__capture__") {
            
            if (pn.data.variadic) {
                throw new Error("Variadic capture not allowed here (must be in children)");
            }

            let allowedBindings = new Set();

            for (let b of bindings) {
                if (b.has(pn.data.name)) {
                    if (b.get(pn.data.name).equals(en)) {
                        allowedBindings.add(b);
                    }
                } else {
                    let bNew = new Map(b);
                    bNew.set(pn.data.name, en); // capture belegen
                    allowedBindings.add(bNew);
                }
            }
            return allowedBindings;
        }

        if (pn.type !== en.type) {
            return new Set(); // unterschiedliche Typen können nicht gematcht werden
        }
        
        if (JSON.stringify(pn.data) !== JSON.stringify(en.data)) {
            return new Set(); // knoten mit unterschiedlichen Daten sind verschieden
        }

        return matchChildren(pn.children, en.children, bindings);
    }

    function matchChildren(pChildren, eChildren, bindings) {
        function matchChildrenStep(pIndex, eIndex, currentBindings) {
            if (pIndex === pChildren.length && eIndex === eChildren.length) {
                return currentBindings;
            }

            if (pIndex === pChildren.length) {
                return new Set(); // zu wenige Kinder im Pattern
            }

            let pChild = pChildren[pIndex];
            if (pChild.type === "__capture__" && pChild.data.variadic) {
                let newBindings = new Set();
                for (let b of currentBindings) {
                    if (b.has(pChild.data.name)) {
                        let boundNodes = b.get(pChild.data.name);
                        if (equalsNodes(boundNodes, eChildren.slice(eIndex,eIndex+boundNodes.length))) {
                            newBindings = newBindings.union(matchChildrenStep(pIndex + 1, eIndex + boundNodes.length, new Set([b])));
                        }
                    } else {
                        for (let len = 0; len <= eChildren.length - eIndex; len++) {
                            let bNew = new Map(b);
                            bNew.set(pChild.data.name, eChildren.slice(eIndex,eIndex+len));
                            newBindings = newBindings.union(matchChildrenStep(pIndex + 1, eIndex + len, new Set([bNew])));
                        }
                    }
                }
                return newBindings;
            }
            
            if (eIndex === eChildren.length) {
                return new Set(); // zu wenige Kinder im Ausdruck
            }

            let newBindings = matchNode(pChild, eChildren[eIndex], currentBindings);
            if (newBindings.size === 0) {
                return newBindings; // aktuelles Kind passt nicht, daher kein Match
            }
            return matchChildrenStep(pIndex + 1, eIndex + 1, newBindings);
        }
        return matchChildrenStep(0, 0, bindings);
    }

    function equalsNodes(nodes1, nodes2) {
        if (nodes1.length !== nodes2.length) return false;
        for (let i = 0; i < nodes1.length; i++) {
            if (!nodes1[i].equals(nodes2[i])) return false;
        }
        return true;
    }
    return Array.from(matchNode(pattern, expr, new Set(initialBindings)));
}

function applyReplacement(binding, replacementPattern) {
    function replaceNode(currentBinding, node) {
        if (node.type === "__capture__") {
            if (currentBinding.has(node.data.name)) {
                if (node.data.variadic) {
                    throw new Error("Variadic capture not allowed here (must be in children)");
                }
                return currentBinding.get(node.data.name).clone();
            }
        }

        return new Umform.ExprNode({
            type: node.type,
            data: structuredClone(node.data),
            children: replaceChildren(currentBinding, node.children)
        });
    }

    function replaceChildren(currentBinding, children) {
        let childrenReplaced = [];
        for (let child of children) {
            if (child.type === "__capture__" && child.data.variadic) {
                if (currentBinding.has(child.data.name)) {
                    childrenReplaced.push(...currentBinding.get(child.data.name).map(n => n.clone()));
                    continue;
                }
            }

            if (child.type === "__map__") {
                let captureV = child.children[0];
                let captureI = child.children[1];
                let expr = child.children[2];
                if (currentBinding.has(captureV.data.name)) {
                    let boundNodes = currentBinding.get(captureV.data.name);
                    let innerBinding = new Map(currentBinding);
                    for (let n of boundNodes) {
                        innerBinding.set(captureI.data.name, n);
                        childrenReplaced.push(replaceNode(innerBinding, expr));
                    }
                    continue;
                }
            }

            childrenReplaced.push(replaceNode(currentBinding, child));
        }
        return childrenReplaced;
    }

    return replaceNode(binding,replacementPattern);
}




/* precedence table (höherer Wert = höhere Präzedenz):
100: atomare Ausdrücke (Zahlen, Variablen, Konstanten)

90: unäre Operationen (Negation, logische Negation)

83: Potenzierung
82: Brüche
81: Produkt
80: Summe

71: Schnittmenge
70: Vereinigunsmenge

60: Gleichungen

52 Und
51 Oder
50 Implikation, Äquivalenz
*/