Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "number";
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
        return "neg";
    }
    getPrecedence() {
        return 90;
    }
    createBox(exprNodeUI, node, nodePrec) {
        const minusbox = new TextBox("−")
        const box = new HBox([
                        minusbox,
                        exprNodeUI.nodeToBox(node.children[0], nodePrec)
                    ], 2);

        return {box:box, nodeContentElements:[minusbox]}
    }
}());

Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "sum";
    }
    getPrecedence() {
        return 80;
    }
    getOpSymbol() {
        return "+";
    }
}());

Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "product";
    }
    getPrecedence() {
        return 81;
    }
    getOpSymbol() {
        return "·";
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "power";
    }
    getPrecedence() {
        return 83;
    }
    createBox(exprNodeUI, node, nodePrec) {
        const box = new SuperScriptBox(
            exprNodeUI.nodeToBox(node.children[0], nodePrec),
            exprNodeUI.nodeToBox(node.children[1], nodePrec)
        );
        return {box:box, nodeContentElements:[]};
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "fraction";
    }
    getPrecedence() {
        return 82;
    }
    createBox(exprNodeUI, node, nodePrec) {
        const box = new FractionBox(
                        exprNodeUI.nodeToBox(node.children[0], 0),
                        exprNodeUI.nodeToBox(node.children[1], 0)
                    );// notePrec=0
        return {box:box, nodeContentElements:[box]};
    }
}());