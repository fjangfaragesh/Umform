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
        return new Umform.ExprNode({
            type: this.type,
            data: structuredClone(this.data),
            children: this.children.map(c => c.clone())
        });
    }

    cloneReplace(nodeToReplace, replacementNode) {
        return this.cloneReplaceConditional((x)=>x===nodeToReplace, replacementNode);
    }

    cloneReplaceConditional(condition, replacementNode) {
        if (condition(this)) {
            return replacementNode.clone();
        }
        return new Umform.ExprNode({
            type: this.type,
            data: structuredClone(this.data),
            children: this.children.map(c => c.cloneReplaceConditional(condition, replacementNode))
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

Umform.TypeDefinition = class {
    constructor() {

    }
    getName() {
        throw new Error("getName() must be implemented for TypeDefinition");
    }
    getTitle() {
        return "no title (" + this.getName() + ")";
    }
    getPrecedence() {
        throw new Error("getPrecedence() must be implemented for TypeDefinition of " + this.getName());
    }
    createBlanc(options) {
        throw new Error("createBlanc() must be implemented for TypeDefinition of " + this.getName());
    }
    createBox(exprNodeUI, node, parentPrec) {
        throw new Error("createBox() must be implemented for TypeDefinition of " + this.getName());
    }

    // overwrite, if node can calc
    calc(data, childrenCalc) {
        return new Umform.ExprNode({
            type: this.getName(),
            data: structuredClone(data),
            children: childrenCalc
        });
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

Umform.uniqueIdCounter = 0;
Umform.uniqueSessionId = Math.floor(Math.random()*1000000);
Umform.getUniqueId = function() {
    return Umform.uniqueSessionId + "." + Umform.uniqueSessionId++;
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
    constructor({name, title, matchPattern, replacementPattern, matchCaptures, freeCaptures=[], selectOrder=[], isAutoRule=false, displayBefore=null, displayAfter=null, createIconFunction=null, tags=new Set()}) {
        this.name = name;
        this.title = title;
        this.matchPattern = matchPattern;
        this.replacementPattern = replacementPattern;
        this.matchCaptures = matchCaptures;
        this.freeCaptures = freeCaptures;
        this.selectOrder = selectOrder;
        this.isAutoRule = isAutoRule;
        this.displayBefore = displayBefore ?? matchPattern;
        this.displayAfter = displayAfter ?? replacementPattern;
        this.createIconFunction = createIconFunction;
        this.tags = new Set(tags);
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

    getMatchesWithUniqueSolutions(expr, initialBindings) {
        let matches = this.getMatches(expr, initialBindings);
        return this.calcMatchsWithUniqueSolutions(matches);
    }

    calcMatchsWithUniqueSolutions(matches) {
        let result = [];
        let solutions = [];
        for (let binding of matches) {
            let solution = this.replace(binding);
            if (!solutions.some(x => solution.equals(x))) {
                solutions.push(solution);
                result.push(binding);
            }
        }
        return result;
    }

    replace(binding, freeCaptureValues = new Map()) {
        // clone
        binding = new Map(binding);
        freeCaptureValues = new Map(freeCaptureValues);

        for (let freeCaptureName of this.freeCaptures) {
            if (!freeCaptureValues.has(freeCaptureName)) {
                freeCaptureValues.set(freeCaptureName, new Umform.ExprNode({
                    type:"_",
                    data:{linkId: Umform.getUniqueId()}
                }));
            }
        }

        for (let [key, value] of freeCaptureValues) {
            if (!this.freeCaptures.includes(key)) {
                throw new Error("Capture " + key + " is not a free capture of this rule");
            }
            if (binding.has(key)) {
                throw new Error("Capture " + key + " is already bound with " + binding.get(key).stringify() + " in the match");
            }
            binding.set(key, value);
        }
        return applyReplacement(binding, this.replacementPattern);
    }

    apply(expr, matchIndex = 0, freeCaptureValues = new Map(), initialMatches) {
        const matches = this.getMatches(expr, initialMatches);
        const binding = matches[matchIndex];
        if (!binding) {
            throw new Error("No match at index " + matchIndex);
        }
        return this.replace(binding,freeCaptureValues);
    }

    createIcon(colors) {
        if (this.createIconFunction) {
            return this.createIconFunction(colors);
        }
        return Umform.Icons.createTextIcon("?",40,colors);
    }
}

Umform.calc = function(exprNode) {
    if (exprNode.type === "__calc__") return Umform.calc(exprNode.children[0]);

    let childrenCalc = exprNode.children.map((x)=>Umform.calc(x));

    let type = Umform.getTypeDefinition(exprNode.type);
    return type.calc(exprNode.data, childrenCalc);
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