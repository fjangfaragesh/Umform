
Umform.NOperationTypeDefinition = class extends Umform.TypeDefinition {
    constructor() {
        super();
    }
    createBox(exprNodeUI, node, parentPrec) {
        const boxes = [];
        const symbols = [];

        node.children.forEach((c, i) => {
            if (i > 0) {
                let symbolbox = new OperatorBox(this.getOpSymbol());
                boxes.push(symbolbox);
                symbols.push(symbolbox);
            }
            // Kind bekommt aktuelle Präzedenz
            boxes.push(exprNodeUI.nodeToBox(c, parentPrec));
        });

        return {box:new HBox(boxes, 0), nodeContentElements:symbols};
    }
    getOpSymbol() {
        throw new Error("implement me");
    }
}

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "id";
    }
    getTitle() {
        return "Identifier";
    }

    getPrecedence() {
        return 100;
    }
    createBox(exprNodeUI, node, parentPrec) {
        const textbox = new TextBox(String(node.data));
        return {box:textbox, nodeContentElements:[textbox]}
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "_";
    }
    getTitle() {
        return "Empty Slot";
    }

    getPrecedence() {
        return 100;
    }
    createBox(exprNodeUI, node, parentPrec) {
        const rectBox = new RectBox(20, 20);
        
        return {box:rectBox, nodeContentElements:[rectBox]}
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "__capture__";
    }
    getTitle() {
        return "Capture (Pattern Variable)";
    }
    getPrecedence() {
        return 100;
    }
    createBox(exprNodeUI, node, parentPrec) {
        const textbox = new TextBox("<" + String(node.data.name) + (node.data.variadic ? "..." : "") + ">");
        return {box:textbox, nodeContentElements:[textbox]}
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "__map__";
    }
    getTitle() {
        return "Map (Pattern Replacement)";
    }
    getPrecedence() {
        return 100;
    }
    createBox(exprNodeUI, node, parentPrec) {
        const textbox1 = new TextBox("map:(");
        const captureV = exprNodeUI.nodeToBox(node.children[0], parentPrec);
        const textbox2 = new TextBox(",");
        const captureI = exprNodeUI.nodeToBox(node.children[1], parentPrec);
        const textbox3 = new TextBox("-=>");
        const expr = exprNodeUI.nodeToBox(node.children[2], parentPrec);
        const textbox4 = new TextBox(")");
        
        return {box:new HBox([textbox1, captureV, textbox2, captureI, textbox3, expr, textbox4]), nodeContentElements:[textbox1, textbox2, textbox3, textbox4]}
    }
}());



