
Umform.NOperationTypeDefinition = class extends Umform.TypeDefinition {
    constructor() {
        super();
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        const boxes = [];
        const symbols = [];

        if (node.children.length === 0) {
            let textBox = new TextBox("(" + this.getOpSymbol() + ")");
            return {box:textBox, nodeContentElements:[textBox]};
        }

        if (node.children.length === 1) {
            const textbox1 = new TextBox("(" + this.getOpSymbol() + ")(")
            const childbox = exprNodeUI.nodeToBox(node.children[0], workSpace, 0);
            const textbox2 = new TextBox(")")
            const box = new HBox([textbox1,childbox,textbox2], 2);

            return {box:box, nodeContentElements:[textbox1,textbox2]}
        }

        node.children.forEach((c, i) => {
            if (i > 0) {
                let symbolbox = new OperatorBox(this.getOpSymbol());
                boxes.push(symbolbox);
                symbols.push(symbolbox);
            }
            // Kind bekommt aktuelle Präzedenz
            boxes.push(exprNodeUI.nodeToBox(c, workSpace, parentPrec));
        });

        return {box:new HBox(boxes, 0), nodeContentElements:symbols};
    }
    getOpSymbol() {
        throw new Error("implement me");
    }
    createBlanc() {
        console.log({
            type: this.getName(),
            children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]
        })
        return new Umform.ExprNode({
            type: this.getName(),
            children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]
        });
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
    createBlanc(options) {
        let name = "x";
        if (options) {
            if (options.name) {
                name = options.name;
            }
        }
        return new Umform.ExprNode({type: this.getName(),data: name});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        let name = node.data;
        let idDesc = workSpace.identifierManager.get(name);
        if (idDesc !== null && idDesc !== undefined) {
            name = idDesc.shortSymbol;
        }

        const textbox = new TextBox(String(name));
        return {box:textbox, nodeContentElements:[textbox]}
    }
}());

// data: null (unlinked) or {"linkId":...} linked
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
    createBlanc() {
        return new Umform.ExprNode({type: this.getName()});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
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
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(),data: {name:"x",variadic:false}});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        let str = "<" + String(node.data.name) + (node.data.variadic ? "..." : "") + ">";
        if (node.children.length !== 0) {
            const textbox1 = new TextBox(str + "(");
            const childbox = exprNodeUI.nodeToBox(node.children[0], workSpace, 0);
            console.log(node.children[0]);
            const textbox2 = new TextBox(")");
            return {box:new HBox([textbox1,childbox,textbox2], 0), nodeContentElements:[textbox1,textbox2]}
        } else {
            const textbox = new TextBox(str);
            return {box:textbox,  nodeContentElements:[textbox]};
        }
        
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
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        const textbox1 = new TextBox("map:(");
        const captureV = exprNodeUI.nodeToBox(node.children[0], workSpace, parentPrec);
        const textbox2 = new TextBox(",");
        const captureI = exprNodeUI.nodeToBox(node.children[1], workSpace, parentPrec);
        const textbox3 = new TextBox("-=>");
        const expr = exprNodeUI.nodeToBox(node.children[2], workSpace, parentPrec);
        const textbox4 = new TextBox(")");
        
        return {box:new HBox([textbox1, captureV, textbox2, captureI, textbox3, expr, textbox4]), nodeContentElements:[textbox1, textbox2, textbox3, textbox4]}
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "__replace__";
    }
    getTitle() {
        return "Replace (Pattern Replacement)";
    }
    getPrecedence() {
        return 100;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        const textbox1 = new TextBox("replace:(");
        const captureV = exprNodeUI.nodeToBox(node.children[0], workSpace, parentPrec);
        const textbox2 = new TextBox(",");
        const captureI = exprNodeUI.nodeToBox(node.children[1], workSpace, parentPrec);
        const textbox3 = new TextBox("-=>");
        const expr = exprNodeUI.nodeToBox(node.children[2], workSpace, parentPrec);
        const textbox4 = new TextBox(")");
        
        return {box:new HBox([textbox1, captureV, textbox2, captureI, textbox3, expr, textbox4]), nodeContentElements:[textbox1, textbox2, textbox3, textbox4]}
    }
}());

// calc(expression(...))
Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "__calc__";
    }
    getTitle() {
        return "Calculation Node";
    }
    getPrecedence() {
        return 100;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        const textbox1 = new TextBox("calc:(");
        const content = exprNodeUI.nodeToBox(node.children[0], workSpace, 0);
        const textbox2 = new TextBox(")");
        
        return {box:new HBox([textbox1, content, textbox2]), nodeContentElements:[textbox1, textbox2]}
    }
}());

/*
Umform.registerRule(new Umform.Rule({
    name: "calc.apply",
    title: "Apply Calc Auto",
    matchPattern: p('__calc__(<x>)'),
    replacementPattern: p('__calc__(<x>)'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: true,
    createIconFunction: (colors) => Umform.Icons.createTextIcon2Lines('AUTO','CALC',colors),
    tags:["make_valid"]
}));*/

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "extraBrackets";
    }
    getTitle() {
        return "Extra Brackets";
    }
    getPrecedence() {
        return 100;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        const content = exprNodeUI.nodeToBox(node.children[0], workSpace, 0);
        const pBox = new ParenthesisBox(content,{strokeWidth:3.0,stringOpen:"❪",stringClose:"❫"});
        return {box:pBox, nodeContentElements:[pBox]}
    }
}());

Umform.registerRule(new Umform.Rule({
    name: "extraBrackets.create",
    title: "Create Extra Brackets",
    matchPattern: p('<x>'),
    replacementPattern: p('extraBrackets(<x>)'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("❪ ❫",40,colors),
    tags:["protect"]
}));

Umform.registerRule(new Umform.Rule({
    name: "extraBrackets.remove",
    title: "Remove Extra Brackets",
    matchPattern: p('extraBrackets(<x>)'),
    replacementPattern: p('<x>'),
    matchCaptures: ["x"],
    freeCaptures: [],
    selectOrder: [],
    isAutoRule: false,
    createIconFunction: (colors) => Umform.Icons.createTextIcon("x❪ ❫x",40,colors),
    tags:["reshape"]
}));

// no function, only for UI x⇛y
Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "__replacement_arrow__";
    }
    getTitle() {
        return "Replacement Arrow (no function, only for User Interface)";
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    getPrecedence() {
        return 11;
    }
    getOpSymbol() {
        return "\u00A0\u00A0⇛\u00A0\u00A0";
    }
}());

// no function, only for UI
Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "__vertical__";
    }
    getTitle() {
        return "Vertical Alignment (no function, only for User Interface)";
    }
    getPrecedence() {
        return 10;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        return {box:new VBox(Array.from(node.children,(c, i) => exprNodeUI.nodeToBox(c, workSpace, 0)),10), nodeContentElements:[]}
    }
}());

// no function, only for UI
Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "__horizontal__";
    }
    getTitle() {
        return "Horizontal Alignment (no function, only for User Interface)";
    }
    getPrecedence() {
        return 10;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        return {box:new HBox(Array.from(node.children,(c, i) => exprNodeUI.nodeToBox(c, workSpace, 0)),4), nodeContentElements:[]}
    }
}());