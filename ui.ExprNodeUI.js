Umform.ExprNodeUI = class {

    constructor(node, controller=new Umform.NodeStateController()) {
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
        const nodePrec = Umform.getTypeDefinition(node.type).getPrecedence();

        let box;
        let nodeContentElements = [];// <--- das hier muss fill unterstützen

        let result = Umform.getTypeDefinition(node.type).createBox(this, node, nodePrec);
        box = result.box;
        nodeContentElements = result.nodeContentElements;
        
        // Automatische Klammern, falls Kind niedriger bindend als Parent
        if (node._forceBrackets || (nodePrec <= parentPrec)) {
            box = new ParenthesisBox(box);
            nodeContentElements.push(box);
        }

        // Wrappen für Clickable
        return new InteractiveBox(box, node, this.controller, nodeContentElements);
    }
};


Umform.NodeStateController = class {
    constructor() {
        // key = node id oder Pfad, value = {selected, selectable, highlighted}
        this.nodes = new Map();

        // callback(node, currentState)
        this.onNodeClick = null;
        this.onNodeContextMenu = null;
    }

    reset() {
        this.nodes = new Map();
    }

    register(node, box) {
        const key = this.getKey(node);
        if (!this.nodes.has(key)) {
            this.nodes.set(key, {
                selected: false,
                selectable: false,
                highlighted: false,
                box: box
            });
        }
    }

    getKey(node) {
        // Wir können Pfad oder Referenz nutzen
        return node._uid || (node._uid = Symbol());
    }

    click(node,e) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state || !state.selectable) return;

        if (this.onNodeClick) {
            e.stopPropagation();
            this.onNodeClick(node, state, e);
        }
    }

    contextmenu(node,e) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state || !state.selectable) return;

        if (this.onNodeContextMenu) {
            e.stopPropagation();
            e.preventDefault();
            this.onNodeContextMenu(node, state, e);
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
        state.box.setHighlightedColor(stroke, fill, fg);
        state.box.updateVisual();
    }

    setSelectable(node, value, stroke = null, fill = null, fg = null) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state) return;
        state.selectable = value;
        state.box.setSelectableColor(stroke, fill, fg);
        state.box.updateVisual();
    }

    getState(node) {
        const key = this.getKey(node);
        return this.nodes.get(key);
    }
}