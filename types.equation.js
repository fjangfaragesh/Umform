Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "equals";
    }
    getPrecedence() {
        return 70;
    }
    createBox(exprNodeUI, node, nodePrec) {
        const equalsbox = new TextBox(" = ");
        const box = new HBox([
                        exprNodeUI.nodeToBox(node.children[0], nodePrec),
                        equalsbox,
                        exprNodeUI.nodeToBox(node.children[1], nodePrec)
                    ]);
        return {box:box, nodeContentElements:[equalsbox]};
    }
}());