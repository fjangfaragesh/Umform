// Konstanten: true, false

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "not";
    }
    getPrecedence() {
        return 90;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, nodePrec) {
        const box = new NotBox(exprNodeUI.nodeToBox(node.children[0], 0), 2);// nodePrec=0

        return {box:box, nodeContentElements:[box]}
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