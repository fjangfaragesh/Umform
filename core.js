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
        const type = parseIdentifier();
        const data = parseData();
        const children = parseChildren();

        return new Umform.ExprNode({
            type,
            data,
            children
        });
    }

    const result = parseExpression();
    skipWs();

    if (i !== str.length) {
        throw new Error("Unerwarteter Rest bei Position " + i);
    }

    return result;
};


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




const PRECEDENCE = {
    "number": 100,
    "var": 100,
    "op": 100,
    "neg": 90,
    "power": 80,
    "fraction": 70,
    "product": 60,
    "sum": 50,
    "equals": 40
};


Umform.ExprNodeUI = class {

    constructor(node, controller) {
        this.node = node;
        this.controller = controller;

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.style.overflow = "visible";

        this.ctx = document.createElement("canvas").getContext("2d");

        this.selectedNode = null;

        this.render();
    }

    // ---------- Public ----------

    render() {
        this.svg.innerHTML = "";

        const box = this.nodeToBox(this.node);
        box.layout(this.ctx);

        const padding = 10;
        const baseline = padding + box.height;

        box.render(this.svg, padding, baseline);

        this.svg.setAttribute("width", box.width + padding * 2);
        this.svg.setAttribute("height", box.height + box.depth + padding * 2);
    }

    get element() {
        return this.svg;
    }

    // ---------- Core Conversion ----------

    nodeToBox(node, parentPrec = 0) {
        const nodePrec = PRECEDENCE[node.type] || 0;

        let box;
        let nodeContentElements = [];// <--- das hier muss fill unterstützen


        let creator = NodeBoxCreators[node.type] || NodeBoxCreators.DEFAULT;
        let result = creator(this, node, nodePrec);
        box = result.box;
        nodeContentElements = result.nodeContentElements;
        

        // Automatische Klammern, falls Kind niedriger bindend als Parent
        if (node._forceBrackets || (nodePrec < parentPrec)) {
            box = new ParenthesisBox(box);
        }

        // Wrappen für Clickable
        return new ClickableBox(box, node, this.controller, nodeContentElements);
    }
};


// todo auslagern
const NodeBoxCreators = {}

NodeBoxCreators.var = function(exprNodeUI, node, nodePrec) {
    const textbox = new TextBox(String(node.data));
    return {box:textbox, nodeContentElements:[textbox]}
}

NodeBoxCreators.number = function(exprNodeUI, node, nodePrec) {
    const textbox = new TextBox(String(node.data));
    return {box:textbox, nodeContentElements:[textbox]}
}

NodeBoxCreators.neg = function(exprNodeUI, node, nodePrec) {
    const minusbox = new TextBox("−")
    box = new HBox([
                    minusbox,
                    exprNodeUI.nodeToBox(node.children[0], nodePrec)
                ], 2);

    return {box:box, nodeContentElements:[minusbox]}
}

function joinInfix(exprNodeUI, children, symbol, parentPrec) {
    const boxes = [];
    const symbols = [];

    children.forEach((c, i) => {
        if (i > 0) {
            let symbolbox = new OperatorBox(symbol);
            boxes.push(symbolbox);
            symbols.push(symbolbox);
        }
        // Kind bekommt aktuelle Präzedenz
         boxes.push(exprNodeUI.nodeToBox(c, parentPrec));
    });

    return {box:new HBox(boxes, 0), nodeContentElements:symbols};
}

NodeBoxCreators.sum = function(exprNodeUI, node, nodePrec) {
    return joinInfix(exprNodeUI,node.children, "+", nodePrec);
}

NodeBoxCreators.product = function(exprNodeUI, node, nodePrec) {
    return joinInfix(exprNodeUI,node.children, "·", nodePrec);
}

NodeBoxCreators.power = function(exprNodeUI, node, nodePrec) {
    const box = new SuperScriptBox(
        exprNodeUI.nodeToBox(node.children[0], nodePrec),
        exprNodeUI.nodeToBox(node.children[1], nodePrec)
    );
    return {box:box, nodeContentElements:[]};
}

NodeBoxCreators.fraction = function(exprNodeUI, node, nodePrec) {
    const box = new FractionBox(
                    exprNodeUI.nodeToBox(node.children[0], nodePrec),
                    exprNodeUI.nodeToBox(node.children[1], nodePrec)
                );
    return {box:box, nodeContentElements:[]};
}

NodeBoxCreators.equals = function(exprNodeUI, node, nodePrec) {
    const equalsbox = new TextBox(" = ");
    const box = new HBox([
                    exprNodeUI.nodeToBox(node.children[0], nodePrec),
                    equalsbox,
                    exprNodeUI.nodeToBox(node.children[1], nodePrec)
                ]);
    return {box:box, nodeContentElements:[equalsbox]};
}

NodeBoxCreators.DEFAULT = function(exprNodeUI, node, nodePrec) {
    const textbox = new TextBox("<?>");
    return {box:textbox, nodeContentElements:[textbox]}
}



class ExprViewer {
    constructor(exprNodeUI, width = 600, height = 400) {
        this.exprNodeUI = exprNodeUI;

        this.width = width;
        this.height = height;

        // SVG Setup
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", width);
        this.svg.setAttribute("height", height);
        this.svg.style.border = "1px solid #aaa";
        this.svg.style.background = "#fff";
        this.svg.style.overflow = "hidden";

        // Container-G für transform (Zoom & Pan)
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.container);

        this.container.appendChild(exprNodeUI.element);

        // Zoom & Pan state
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.offsetStart = { x: 0, y: 0 };

        this.updateTransform();
        this.attachEvents();
    }

    get element() {
        return this.svg;
    }

    updateTransform() {
        this.container.setAttribute(
            "transform",
            `translate(${this.offsetX},${this.offsetY}) scale(${this.scale})`
        );
    }

    attachEvents() {
        // Zoom mit Mausrad
        this.svg.addEventListener("wheel", (e) => {
            e.preventDefault();

            const delta = -e.deltaY; // normales Mausrad
            const zoomFactor = 1.1;

            const rect = this.svg.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            let scaleFactor = delta > 0 ? zoomFactor : 1 / zoomFactor;

            // Zoom um Mauszeiger
            this.offsetX = cx - scaleFactor * (cx - this.offsetX);
            this.offsetY = cy - scaleFactor * (cy - this.offsetY);
            this.scale *= scaleFactor;

            this.updateTransform();
        });

        // Pan mit mittlerer Maustaste
        this.svg.addEventListener("mousedown", (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                this.isPanning = true;
                this.panStart = { x: e.clientX, y: e.clientY };
                this.offsetStart = { x: this.offsetX, y: this.offsetY };
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.panStart.x;
                const dy = e.clientY - this.panStart.y;

                this.offsetX = this.offsetStart.x + dx;
                this.offsetY = this.offsetStart.y + dy;
                this.updateTransform();
            }
        });

        window.addEventListener("mouseup", (e) => {
            this.isPanning = false;
        });
    }
}

class NodeStateController {
    constructor() {
        // key = node id oder Pfad, value = {selected, selectable, highlighted}
        this.nodes = new Map();

        // callback(node, currentState)
        this.onNodeClick = null;
    }

    register(node, box) {
        const key = this.getKey(node);
        if (!this.nodes.has(key)) {
            this.nodes.set(key, {
                selected: false,
                selectable: true,
                highlighted: false,
                box: box
            });
        }
    }

    getKey(node) {
        // Wir können Pfad oder Referenz nutzen
        return node._uid || (node._uid = Symbol());
    }

    click(node) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state || !state.selectable) return;

        if (this.onNodeClick) {
            this.onNodeClick(node, state);
        }
    }

    setSelected(node, value, stroke = null, fill = null, fg = null) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state) return;
        state.selected = value;
        state.box.setSelectedColor(stroke, fill, fg);
        state.box.updateVisual();
    }

    setHighlighted(node, value, stroke = null, fill = null, fg = null) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state) return;
        state.highlighted = value;
        state.box.setHighlightedColor(stroke, fill);
        state.box.updateVisual();
    }

    setSelectable(node, value, stroke = null, fill = null, fg = null) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state) return;
        state.selectable = value;
        //state.box.setSelectableColor(stroke, fill, fg);
        state.box.updateVisual();
    }

    getState(node) {
        const key = this.getKey(node);
        return this.nodes.get(key);
    }
}