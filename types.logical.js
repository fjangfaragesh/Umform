// Konstanten: true, false

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "not";
    }
    getPrecedence() {
        return 90;
    }
    createBox(exprNodeUI, node, nodePrec) {
        const minusbox = new TextBox("~")
        const box = new HBox([
                        minusbox,
                        exprNodeUI.nodeToBox(node.children[0], nodePrec)
                    ], 2);

        return {box:box, nodeContentElements:[minusbox]}
    }
}());

Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "and";
    }
    getPrecedence() {
        return 52;
    }
    getOpSymbol() {
        return "∧";
    }
}());

Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "or";
    }
    getPrecedence() {
        return 51;
    }
    getOpSymbol() {
        return "\u00A0∨\u00A0";
    }
}());

Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "implication";
    }
    getPrecedence() {
        return 50;
    }
    getOpSymbol() {
        return "\u00A0\u00A0→\u00A0\u00A0";
    }
}());

Umform.registerType(new class extends Umform.NOperationTypeDefinition {
    getName() {
        return "equivalence";
    }
    getPrecedence() {
        return 50;
    }
    getOpSymbol() {
        return "\u00A0\u00A0↔\u00A0\u00A0";
    }
}());