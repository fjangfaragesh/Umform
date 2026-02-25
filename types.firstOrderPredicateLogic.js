Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "forall";
    }
    getTitle() {
        return "Forall";
    }
    getPrecedence() {
        return 55;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, workSpace, parentPrec) {
        const textbox1 = new TextBox("∀");
        const captureV = exprNodeUI.nodeToBox(node.children[0], workSpace, parentPrec);
        const textbox2 = new TextBox(":");
        const captureE = exprNodeUI.nodeToBox(node.children[1], workSpace, parentPrec);
        
        return {box:new HBox([textbox1, captureV, textbox2, captureE]), nodeContentElements:[textbox1, textbox2]}
    }
}());