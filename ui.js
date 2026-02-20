
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
    return {box:box, nodeContentElements:[box]};
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
        this.scale = 5;
        this.offsetX = 0;
        this.offsetY = 100;

        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.offsetStart = { x: 0, y: 0 };

        this.updateTransform();
        this.attachEvents();
    }

    get element() {
        return this.svg;
    }

    setExprNodeUI(exprNodeUI) {
        this.exprNodeUI = exprNodeUI;
        this.container.innerHTML = "";
        this.container.appendChild(exprNodeUI.element);
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

    click(node,e) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state || !state.selectable) return;

        if (this.onNodeClick) {
            this.onNodeClick(node, state, e);
        }
    }

    contextmenu(node,e) {
        const key = this.getKey(node);
        const state = this.nodes.get(key);
        if (!state || !state.selectable) return;

        if (this.onNodeContextMenu) {
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

Umform.Workspace = class{
    constructor({expr, rules, autoRules = []}) {
        this.expr = expr;
        this.rules = rules;
        this.autoRules = autoRules;

        this.element = document.createElement("div");
        this.controller = new NodeStateController();
        this.controller.onNodeClick = (node, state, e) => this.clickNode(node, e);
        this.controller.onNodeContextMenu = (node, state, e) => this.contextMenuNode(node, e);

        this.exprViewer = new ExprViewer(new Umform.ExprNodeUI(this.expr, this.controller), 1000, 500);
        this.element.appendChild(this.exprViewer.element);

        this.rulesDiv = document.createElement("div");
        this.element.appendChild(this.rulesDiv);
    
        this.rulesButtons = new Map();
        for (let rule of this.rules) {
            const btn = document.createElement("button");
            btn.textContent = rule.title;

            btn.addEventListener("click", () => this.clickRule(rule));

            this.rulesDiv.appendChild(btn);
            this.rulesButtons.set(rule, btn);
        }

        this.moreButtonsDiv = document.createElement("div");
        this.element.appendChild(this.moreButtonsDiv);

        this.exportButton = document.createElement("button");
        this.exportButton.textContent = "Export";
        this.exportButton.addEventListener("click", () => {
            alert(Umform.ExprNode.stringify(this.expr));
        });
        this.moreButtonsDiv.appendChild(this.exportButton);

        this.importButton = document.createElement("button");
        this.importButton.textContent = "Import";
        this.importButton.addEventListener("click", () => {
            let t = prompt("Gib den Ausdruck ein:",Umform.ExprNode.stringify(this.expr));
            if (t === null) return;
            try {
                const newExpr = Umform.ExprNode.parse(t);
                this.setExpr(newExpr);
            } catch (e) {
                alert("Ungültiger Ausdruck: " + e.message);
            }
        });
        this.moreButtonsDiv.appendChild(this.importButton);

        this.selectedRule = null;
        this.selectedRuleRootNode = null;
        this.selectOrderIndex = 0;
        this.currentMatches = null;

        this.autoApplyWhenClear = true;

        this.runAutoRules();
        this.updateVisual();

        this.taskSelect = document.createElement("select");
        EXAMPLE_TASKS.forEach((taskObj, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = taskObj.taskPreview;
            this.taskSelect.appendChild(option);
        });
        this.taskSelect.addEventListener("change", (e) => {
            const idx = parseInt(e.target.value, 10);
            const task = EXAMPLE_TASKS[idx];
            if (!task) return;

            const expr = Umform.ExprNode.parse(task.task);
            this.setExpr(expr);
        });
        this.moreButtonsDiv.appendChild(this.taskSelect);

        this.contextMenue = new PyramidContextMenu(70);
    }

    setExpr(newExpr,  noUpdate = false) {
        this.expr = newExpr;
        this.controller.reset();
        this.exprViewer.setExprNodeUI(new Umform.ExprNodeUI(this.expr, this.controller));
        this.selectedRule = null;
        this.selectedRuleRootNode = null;
        if (!noUpdate) {
            this.runAutoRules();
            this.updateVisual();
        }
    }

    runAutoRules(noUpdate = false) {
        for (let rule of this.autoRules) {
            while (true) {
                let targetNode = this.expr.findAll(n => rule.matches(n))[0];
                if (!targetNode) break;
                let replaced = rule.apply(targetNode, 0);
                this.setExpr(this.expr.cloneReplace(targetNode, replaced), true);
            }
        }
        if (!noUpdate) {
            this.updateVisual();
        }
    }

    clickNode(node, e) {
        let nextAction = this.getNextAction();

        if (nextAction === "selectRootNode" || nextAction === "selectRuleOrRootNode") {
            this.selectedRuleRootNode = node;
        } else if (nextAction === "selectRule") {
            this.selectedRuleRootNode = this.selectedRuleRootNode !== node ? node : null;
        } else if (nextAction === "selectNextNode") {
            let selectableNodes = this.prepareSelectNextNode();
            if (selectableNodes.has(node)) {
                this.currentMatches = matchAll(this.selectedRule.selectOrder[this.selectOrderIndex], node, this.currentMatches);
                this.currentMatches = this.selectedRule.calcMatchsWithUniqueSolutions(this.currentMatches);
                this.selectOrderIndex++;
            }
        }
        if (this.autoApplyWhenClear && this.getNextAction() === "applyRule") {
            this.applySelectedRule();
        }
        this.updateVisual();
    }

    clickRule(rule, e) {
        let nextAction = this.getNextAction();

        if (nextAction === "selectRule" || nextAction === "selectRuleOrRootNode") {
            this.selectedRule = rule;
            this.selectOrderIndex = 0;
            this.currentMatches = null;
            let matchingNodes = this.expr.findAll(n => rule.matches(n));
            if (matchingNodes.length === 1) {
                this.selectedRuleRootNode = matchingNodes[0];
            }
        } else if (nextAction === "applyRule") {
            this.applySelectedRule();
        } else if (this.selectedRule === rule) {
            this.selectedRule = null;
        }
        if (this.autoApplyWhenClear && this.getNextAction() === "applyRule") {
            this.applySelectedRule();
        }
        this.updateVisual();
    }

    contextMenuNode(node, e) {
        let nextAction = this.getNextAction();

        if (nextAction === "selectRuleOrRootNode" || nextAction === "selectRule") {
            this.selectedRuleRootNode = node;
            this.buildContextMenueNode(node);
            this.contextMenue.show(e.clientX,e.clientY);
        }

        this.updateVisual();
    }

    applySelectedRule() {
        let replaced = this.selectedRule.replace(this.currentMatches[0], new Map());
        this.setExpr(this.expr.cloneReplace(this.selectedRuleRootNode, replaced));
        this.selectedRule = null;
        this.selectedRuleRootNode = null;
    }

    getNextAction() {
        if (this.selectedRule === null) {
            if (this.selectedRuleRootNode === null) {
                return "selectRuleOrRootNode";
            } else {
                return "selectRule";
            }
        } else {
            if (this.selectedRuleRootNode === null) {
                return "selectRootNode";
            } else {
                this.prepareSelectNextNode();
                if (this.selectedRule.getMatchesWithUniqueSolutions(this.selectedRuleRootNode, this.currentMatches).length >= 2) {
                    if (this.selectOrderIndex >= this.selectedRule.selectOrder.length) return "applyRule";// erstbeste ausführen
                    return "selectNextNode";
                } else {
                    return "applyRule";
                }
            }
        }
    }

    updateVisual() {
        let nextAction = this.getNextAction();
        console.log(nextAction);

        if (nextAction === "selectRuleOrRootNode") {
            for (let n of this.expr.getAllNodes()) {
                this.controller.setSelectable(n, true);
                this.controller.setHighlighted(n, false, "blue", "rgba(255, 225, 0, 0.29)", "rgb(162, 146, 0)");
            }
            for (let rule of this.rules) {
                const btn = this.rulesButtons.get(rule);
                btn.style.backgroundColor = "white";
                btn.disabled = this.expr.findAll(n => rule.matches(n)).length === 0;
                btn.style.display = btn.disabled ? "none" : "";
            }
        } else if (nextAction === "selectRule") {
            for (let n of this.expr.getAllNodes()) {
                this.controller.setSelectable(n, true);
                this.controller.setHighlighted(n, this.selectedRuleRootNode === n, "transparent", "rgba(255, 225, 0, 0.29)", "rgb(162, 146, 0)");
            }
            for (let rule of this.rules) {
                const btn = this.rulesButtons.get(rule);
                btn.style.backgroundColor = "white";
                btn.disabled = !rule.matches(this.selectedRuleRootNode);
                btn.style.display = btn.disabled ? "none" : "";
            }
        } else if (nextAction === "selectRootNode") {
            for (let n of this.expr.getAllNodes()) {
                this.controller.setSelectable(n, this.selectedRule.matches(n));
            }
            for (let rule of this.rules) {
                const btn = this.rulesButtons.get(rule);
                btn.style.backgroundColor = this.selectedRule == rule ? "yellow" : "white";
                btn.disabled = this.expr.findAll(n => rule.matches(n)).length === 0;
                btn.style.display = btn.disabled ? "none" : "";
            }
        } else if (nextAction === "selectNextNode") {
            let selectableNodes = this.prepareSelectNextNode();
            console.log(selectableNodes);
            for (let n of this.expr.getAllNodes()) {
                this.controller.setSelectable(n, selectableNodes.has(n));
                this.controller.setHighlighted(n, this.selectedRuleRootNode === n, "transparent", "rgba(255, 225, 0, 0.29)", "rgb(162, 146, 0)");
            }
            for (let rule of this.rules) {
                const btn = this.rulesButtons.get(rule);
                btn.style.backgroundColor = this.selectedRule == rule ? "yellow" : "white";
                btn.disabled = this.selectedRule !== rule;
                btn.style.display = btn.disabled ? "none" : "";
            }
        } else if (nextAction === "applyRule") {
            for (let n of this.expr.getAllNodes()) {
                this.controller.setSelectable(n, false);
                this.controller.setHighlighted(n, this.selectedRuleRootNode === n, "transparent", "rgba(229, 255, 0, 0.77)", "rgb(0, 0, 0)");
            }
            for (let rule of this.rules) {
                const btn = this.rulesButtons.get(rule);
                btn.style.backgroundColor = this.selectedRule == rule ? "green" : "white";
                btn.disabled = this.selectedRule !== rule;
                btn.style.display = btn.disabled ? "none" : "";
            }
        }
    }

    prepareSelectNextNode() {
        if (this.currentMatches === null) {
            this.currentMatches = this.selectedRule.getMatches(this.selectedRuleRootNode);
            this.selectOrderIndex = 0;
        }
        while (this.selectOrderIndex < this.selectedRule.selectOrder.length) {
            let selectableNodes = this.selectedRule.getSelectableNodes(this.selectedRuleRootNode, this.currentMatches, this.selectOrderIndex);
            if (selectableNodes.size >= 2) return selectableNodes;
            this.selectOrderIndex++;
        }
        return new Set();
    }

    buildContextMenueNode() {
        this.contextMenue.clear();
        let i = 0;
        for (let rule of this.rules) {
            if (rule.matches(this.selectedRuleRootNode)) {
                let icon = Umform.Icons.iconFromRule(rule);
                icon.title = rule.title;
                this.contextMenue.addItem(icon,(e)=>this.clickRule(rule,e),"bottom",i++);
            }
        }
    }


}


class ContextMenu {
    constructor() {
        this.container = document.createElement("div");

        this.container.style.position = "fixed";
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = 10000;
        this.container.style.display = "none";

        document.body.appendChild(this.container);

        this.items = [];
    }

    clear() {
        this.items = [];
        this.container.innerHTML = "";
    }

    addItem(content,onClick,x,y,width="",height="") {
        const btn = document.createElement("div");
        //btn.style.backgroundColor = "white";
        //btn.style.outline = "1px solid black";
        btn.style.position = "absolute";
        btn.style.pointerEvents = "auto";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = `${width}px`;
        btn.style.height = `${height}px`;
        btn.style.overflow = "hidden";
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.hide();
            onClick();
        });
        btn.appendChild(content);
        this.items.push(btn);
        this.container.appendChild(btn);
    }

    show(x, y) {
        this.container.style.left = x + "px";
        this.container.style.top = y + "px";

        this.container.style.display = "block";

        setTimeout(() => {
            window.addEventListener("click", this._outsideHandler);
        });
    }

    hide() {
        this.container.style.display = "none";
        window.removeEventListener("click", this._outsideHandler);
    }

    _outsideHandler = () => this.hide();
}


class PyramidContextMenu extends ContextMenu {
    constructor(gridSize, gap) {
        super();
        this.gridSize = gridSize;
        this.gap = gap ?? this.gridSize*0.1;
    }

    addItem(content, onClick, side, index) {
        let row = Math.floor(Math.sqrt(index));
        let column = (index - row**2) - row;
        let xPyramid = column*this.gridSize - 0.5*this.gridSize;
        let yPyramid = row*this.gridSize + this.gridSize;
        let x,y;
        switch (side) {
            case "top":
                x = xPyramid + 0.5*this.gap;
                y = -yPyramid - this.gridSize + 0.5*this.gap;
                break;
            case "bottom":
                x = -xPyramid - this.gridSize + 0.5*this.gap;
                y = yPyramid + 0.5*this.gap;
                break;
            case "left":
                x = -yPyramid - this.gridSize + 0.5*this.gap;
                y = -xPyramid - this.gridSize + 0.5*this.gap;
                break;
            case "right":
                x = yPyramid + 0.5*this.gap;
                y = xPyramid + 0.5*this.gap;
                break;
            case "center":
                x = -this.gridSize/2 + 0.5*this.gap;
                y = -this.gridSize/2 + 0.5*this.gap;
                break;
        }
        super.addItem(content,onClick,x,y,this.gridSize-this.gap, this.gridSize-this.gap);
    }

}