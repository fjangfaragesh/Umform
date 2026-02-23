Umform.Workspace = class {
    constructor({expr, rules, autoRules = []}) {
        this.expr = expr;
        this.rules = rules;
        this.autoRules = autoRules;

        this.element = document.createElement("div");
        this.controller = new Umform.NodeStateController();
        this.controller.onNodeClick = (node, state, e) => this.clickNode(node, e);
        this.controller.onNodeContextMenu = (node, state, e) => this.contextMenuNode(node, e);

        this.exprViewerPreview = new Umform.ExprViewer(new Umform.ExprNodeUI(p('id{"preview"}'), new Umform.NodeStateController()), 1000, 200);
        this.element.appendChild(this.exprViewerPreview.element);

        this.exprViewer = new Umform.ExprViewer(new Umform.ExprNodeUI(this.expr, this.controller), 1000, 500);
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

        this.contextMenue = new Umform.PyramidContextMenu(70);

        // strg+c, strg+v
        this.onKeyDown = this.onKeyDown.bind(this);
        document.addEventListener("keydown", this.onKeyDown);

        this.newNodeUI = new Umform.NewNodeUI((newNode)=>this.onPaste(newNode));
        this.element.appendChild(this.newNodeUI.element);
    }

    onKeyDown(e) {
        if (e.ctrlKey && e.key === "c") {
            this.onInputCopyToClipboard();
            e.preventDefault();
        }
    
        if (e.ctrlKey && e.key === "v") {
            this.onInputPasteFromClipboard();
            e.preventDefault();
        }
    }

    onInputCopyToClipboard() {
        if (!this.selectedRuleRootNode) return;

        const payload = {
            type: "umform.exprnode",
            version: 1,
            data: Umform.ExprNode.stringify(this.selectedRuleRootNode)
        }

        const json = JSON.stringify(payload);
            
        //async:
        navigator.clipboard.write([
            new ClipboardItem({
                "text/plain": new Blob([json], { type: "text/plain" })
            })
        ]);
    }

    onInputPasteFromClipboard() {
        navigator.clipboard.readText().then((text)=>{
            try {
                const parsed = JSON.parse(text);
                const parsedNode = Umform.ExprNode.parse(parsed.data);
                if (parsed.type === "umform.exprnode") {
                    this.onPaste(parsedNode);
                }
            } catch (e) {
                console.log("error pasting:",e);
            }
        });
    }

    onPaste(exprNode) {
        if (this.selectedRuleRootNode === null) return;
        if (this.selectedRuleRootNode.type === "_") {
            let condition = (n)=>{
                if (n === this.selectedRuleRootNode) return true;
                if (n.type !== "_") return false;
                if (this.selectedRuleRootNode.data === null) return false;
                if (n.data === null) return false;
                if (this.selectedRuleRootNode.data.linkId === null) return false;
                return this.selectedRuleRootNode.data.linkId === n.data.linkId;
            }
            this.setExpr(this.expr.cloneReplaceConditional(condition,exprNode));
        }
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
        this.newNodeUI.hide();
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
        if (node.type === "_") {
            this.newNodeUI.show();
        } else {
            this.newNodeUI.hide();
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

    updateRulePreview() {
        if (this.selectedRule === null) {
            this.exprViewerPreview.setExprNodeUI(new Umform.ExprNodeUI(p('id{"preview"}'), new Umform.NodeStateController()));
            return;
        }

        if (this.selectedRootNode === null) {
            console.log("TODO");
            return;
        }

        let possibilitys = [];
        for (let binding of this.selectedRule.getMatchesWithUniqueSolutions(this.selectedRuleRootNode,this.currentMatches)) {
            let bef = applyReplacement(binding,this.selectedRule.displayBefore);
            let aft = applyReplacement(binding,this.selectedRule.displayAfter);
            possibilitys.push({type:"__replacement_arrow__", children:[bef,aft]});
        }
        console.log(possibilitys);

        let previewExpr = new Umform.ExprNode({type:"__vertical__", children: possibilitys});
        this.exprViewerPreview.setExprNodeUI(new Umform.ExprNodeUI(previewExpr, new Umform.NodeStateController()));
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
        this.updateRulePreview();
    }

    prepareSelectNextNode() {
        if (this.currentMatches === null) {
            this.currentMatches = this.selectedRule.getMatches(this.selectedRuleRootNode);
            console.log(this.currentMatches);
            this.selectOrderIndex = 0;
        }
        while (this.selectOrderIndex < this.selectedRule.selectOrder.length) {
            let selectableNodes = this.selectedRule.getSelectableNodes(this.selectedRuleRootNode, this.currentMatches, this.selectOrderIndex);
            console.log("selectableNodes",selectableNodes)
            if (selectableNodes.size >= 2) return selectableNodes;
            this.selectOrderIndex++;
        }
        return new Set();
    }

    buildContextMenueNode() {
        this.contextMenue.clear();

        const observeTags = ["shorten","reorder","reshape","expand","definition","definition_reversed"];
        
        const rulesOrder = new Map();
        for (let tag of observeTags) rulesOrder.set(tag,[]);
        rulesOrder.set("else",[]);

        let up = [];// shorten, reorder, reshape
        let down = [];// expand, definition, definition reverses

        let i = 0;
        outer: for (let rule of this.rules) {
            if (rule.matches(this.selectedRuleRootNode)) {
                for (let tag of observeTags) {
                    if (rule.tags.has(tag)) {
                        rulesOrder.get(tag).push(rule);
                        continue outer;
                    }
                }
                rulesOrder.get("else").push(rule);
            }
        }

        let indexCounters = new Map([["top",0],["bottom",0],["left",0],["right",0]]);

        let showRule = (rule, side) => {
            let index = indexCounters.get(side);
            let icon = rule.createIcon();
            icon.title = rule.title;
            this.contextMenue.addItem(icon,{onclick:(e)=>this.clickRule(rule,e),onmouseover:(e)=>console.log(e)},side,index);
            indexCounters.set(side,index+1);
        }


        for (let rule of rulesOrder.get("shorten")) showRule(rule,"top");
        for (let rule of rulesOrder.get("reorder")) showRule(rule,"top");
        for (let rule of rulesOrder.get("reshape")) showRule(rule,"top");
        for (let rule of rulesOrder.get("definition_reversed")) showRule(rule,"bottom");
        for (let rule of rulesOrder.get("definition")) showRule(rule,"bottom");
        for (let rule of rulesOrder.get("expand")) showRule(rule,"bottom");
        for (let rule of rulesOrder.get("else")) showRule(rule,"bottom");

        this.contextMenue.addItem(Umform.Icons.createTextIcon2Lines("CLE","AR"), {onclick:(e)=>{
            this.setExpr(this.expr.cloneReplace(this.selectedRuleRootNode, p("_")));
        },onmouseover:(e)=>console.log(e)},"right",0);

        this.contextMenue.addItem(Umform.Icons.createTextIcon2Lines("CALC","1+2"), {onclick:(e)=>{
            this.setExpr(this.expr.cloneReplace(this.selectedRuleRootNode, Umform.calc(this.selectedRuleRootNode)));
        },onmouseover:(e)=>console.log(e)},"left",0);
    }

    destroy() {
        document.removeEventListener(this.onKeyDown);
    }

}

Umform.NewNodeUI = class {
    constructor(onNewNodeCallback) {
        this.onNewNodeCallback = onNewNodeCallback;
        this.element = document.createElement("div");

        const hiddenTypes = new Set(["__capture__","__map__","__replacement_arrow__","__vertical__","__horizontal__","_"]);

        // node type select
        this.nodeTypeSelectButtonsDiv = document.createElement("div");
        for (let type of Umform.TYPE_REGISTRY.values()) {
            if (hiddenTypes.has(type.getName())) continue;
            let btn = document.createElement("button");
            btn.title = type.getTitle()
            btn.appendChild(new Umform.ExprNodeUI(type.createBlanc()).element);
            btn.addEventListener("click", () => {
                this.onTypeSelect(type);
            });
            this.nodeTypeSelectButtonsDiv.appendChild(btn);
        }
        this.element.appendChild(this.nodeTypeSelectButtonsDiv);

        this.idSelectUI = new Umform.NewNodeUI.IdSelectUI(onNewNodeCallback);
        this.element.appendChild(this.idSelectUI.element);
        
        this.numberSelectUI = new Umform.NewNodeUI.NumberSelectUI(onNewNodeCallback);
        this.element.appendChild(this.numberSelectUI.element);

        this.hide();
    }

    show() {
        this.element.style.display = "";
        this.nodeTypeSelectButtonsDiv.style.display = "";
        this.idSelectUI.hide();
        this.numberSelectUI.hide();
    }

    hide() {
        this.element.style.display = "none";
    }

    onTypeSelect(type) {
        switch (type.getName()) {
            case "id":
                this.nodeTypeSelectButtonsDiv.style.display = "none";
                this.idSelectUI.show();
                break;
            case "number":
                this.nodeTypeSelectButtonsDiv.style.display = "none";
                this.numberSelectUI.show();
                break;
                break;
            default:
                this.onNewNodeCallback(type.createBlanc(),null);
        }
    }
}

Umform.NewNodeUI.IdSelectUI = class {
    constructor(onNewNodeCallback) {
        this.onNewNodeCallback = onNewNodeCallback;
        this.element = document.createElement("div");

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.value = "";
        this.input.placeholder = "input name here ...";
        this.input.style.fontSize = "30px";
        this.element.appendChild(this.input);

        this.input.onkeydown = (e) => {
            if (e.key === "Enter") {
                if (this.input.value === "") return;
                this.onNewNodeCallback(Umform.TYPE_REGISTRY.get("id").createBlanc({name:this.input.value}));
            }
        }
        this.input.addEventListener("focusout",(e) => {
            if (this.input.value === "") return;
            this.onNewNodeCallback(Umform.TYPE_REGISTRY.get("id").createBlanc({name:this.input.value}));
        });
    }

    show() {
        this.element.style.display = "";
        this.input.focus();
    }

    hide() {
        this.element.style.display = "none";
    }
}

Umform.NewNodeUI.NumberSelectUI = class {
    constructor(onNewNodeCallback) {
        this.onNewNodeCallback = onNewNodeCallback;
        this.element = document.createElement("div");

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.value = "";
        this.input.placeholder = "input number here ...";
        this.input.style.fontSize = "30px";
        this.element.appendChild(this.input);

        this.input.onkeydown = (e) => {
            if (e.key === "Enter") {
                let value = this.input.value*1.0;
                if (isNaN(value)) return;
                this.onNewNodeCallback(Umform.TYPE_REGISTRY.get("number").createBlanc({value:value}));
            }
        }
        this.input.addEventListener("focusout",(e) => {
            let value = this.input.value*1.0;
            if (isNaN(value)) return;
            this.onNewNodeCallback(Umform.TYPE_REGISTRY.get("number").createBlanc({value:value}));
        });
    }

    show() {
        this.element.style.display = "";
        this.input.focus();
    }

    hide() {
        this.element.style.display = "none";
    }
}