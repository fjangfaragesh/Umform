Umform.WorkSpaceUI = class {
    constructor(workSpace) {
        this.workSpace = workSpace;

        this.element = document.createElement("div");

        this.exprViewer = new Umform.ExprViewer(new Umform.ExprNodeUI(p('id{"loading..."}'),this.workSpace), 1000, 500);
        this.element.appendChild(this.exprViewer.element);

        this.sidePanel = new Umform.WorkSpaceUISidePanel(this);
        this.element.appendChild(this.sidePanel.element);

        this.topPanel = new Umform.WorkSpaceUITopPanel(this);
        this.element.appendChild(this.topPanel.element);

        this.exprEditorUIs = new Map();
        this.activeExprEditorName = "main";


        this.contextMenue = new Umform.PyramidContextMenu(70);

        // strg+c, strg+v
        this.onKeyDown = this.onKeyDown.bind(this);
        document.addEventListener("keydown", this.onKeyDown);

        this.workSpace.onExprChange = (exprSheetName, expr)=>{
            let exprEditorUI = this.exprEditorUIs.get(exprSheetName);
            if (exprEditorUI == null) {
                exprEditorUI = new Umform.ExprEditorUI(this, exprSheetName, (exprNodeUI)=>{
                    if (exprSheetName === this.activeExprEditorName) {
                        this.exprViewer.setExprNodeUI(exprNodeUI);
                    }
                });
                this.exprEditorUIs.set(exprSheetName, exprEditorUI);
            }
            exprEditorUI.exprChange(expr);
            sessionStorage.setItem("Umform.WorkSpace",JSON.stringify(this.workSpace.export()))
        };

        this.workSpace.onExprSheetListChange = (sheetNames)=>{
            this.topPanel.rebuildExprSheetSelect(sheetNames);
            sessionStorage.setItem("Umform.WorkSpace",JSON.stringify(this.workSpace.export()))
        }

        this.setActiveExprSheetName(this.activeExprEditorName);
        
        //this.updateVisual();
    }

    setActiveExprSheetName(name) {
        this.activeExprEditorName = name;
        this.workSpace.onExprChange(name,this.workSpace.getExprSheet(name).expr);
    }

    getActiveExprEditorUI() {
        return this.exprEditorUIs.get(this.activeExprEditorName);
    }

    setSize(width, height) {
        this.exprViewer.setSize(width, height);
    }

    onKeyDown(e) {
        console.log(e);

        if (e.ctrlKey && e.key === "c") {
            this.onInputCopyToClipboard();
            e.preventDefault();
        }
    
        if (e.ctrlKey && e.key === "v") {
            this.onInputPasteFromClipboard();
            e.preventDefault();
        }

        if (e.ctrlKey && !e.shiftKey && e.key === "z") {
            this.getActiveExprEditorUI().historyBack();
            e.preventDefault();
        }

        if (e.ctrlKey && e.shiftKey && e.key === "z" || e.ctrlKey && e.key === "y") {
            this.getActiveExprEditorUI().historyForward();
            e.preventDefault();
        }
    }

    onInputCopyToClipboard() {
        if (!this.getActiveExprEditorUI().selectedTargetNode) return;

        const payload = {
            type: "umform.exprnode",
            version: 1,
            data: Umform.ExprNode.stringify(this.getActiveExprEditorUI().selectedTargetNode)
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
        this.getActiveExprEditorUI().onPaste(exprNode);
    }

    requestCreateNewNode(exprSheetName) {
        this.sidePanel.showNewNodeUI();
    }


    destroy() {
        document.removeEventListener(this.onKeyDown);
    }
}

Umform.ExprEditorUI = class {
    constructor(workSpaceUI, exprSheetName, onNewExprNodeUICallback) {
        this.workSpaceUI = workSpaceUI;
        this.exprSheetName = exprSheetName;
        this.onNewExprNodeUICallback = onNewExprNodeUICallback;

        this.selectedRule = null;
        this.selectedTargetNode = null;
        this.selectOrderIndex = 0;
        this.currentMatches = null;

        this.autoApplyWhenClear = true;

        this.controller = new Umform.NodeStateController();
        this.controller.onNodeClick = (node, state, e) => this.clickNode(node, e);
        this.controller.onNodeContextMenu = (node, state, e) => this.contextMenuNode(node, e);

        this.exprChange(this.getExpr());
    }

    getExprSheet() {
        return this.workSpaceUI.workSpace.getExprSheet(this.exprSheetName);
    }

    getExpr() {
        return this.getExprSheet().expr;
    }

    onPaste(exprNode) {
        if (this.selectedTargetNode === null) return;
        if (this.selectedTargetNode.type === "_") {
            let condition = (n)=>{
                if (n === this.selectedTargetNode) return true;
                if (n.type !== "_") return false;
                if (this.selectedTargetNode.data === null) return false;
                if (n.data === null) return false;
                if (this.selectedTargetNode.data.linkId === null) return false;
                return this.selectedTargetNode.data.linkId === n.data.linkId;
            }
            this.setExpr(this.getExpr().cloneReplaceConditional(condition,exprNode));
            this.runAutoRules();
        }
    }

    setExpr(newExpr) {
        this.getExprSheet().setExpr(newExpr);
    }

    historyBack() {
        this.getExprSheet().historyBack();
    }

    historyForward() {
        this.getExprSheet().historyForward();
    }

    runAutoRules() {
        this.getExprSheet().runAutoRules();
    }

    clickNode(node, e) {
        let nextAction = this.getNextAction();

        if (nextAction === "selectRootNode" || nextAction === "selectRuleOrRootNode") {
            this.selectedTargetNode = node;
        } else if (nextAction === "selectRule") {
            this.selectedTargetNode = this.selectedTargetNode !== node ? node : null;
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
            this.workSpaceUI.requestCreateNewNode(this.exprSheetName);
        }
        this.updateVisual();
    }

    clickRule(rule, e) {
        let nextAction = this.getNextAction();

        if (nextAction === "selectRule" || nextAction === "selectRuleOrRootNode") {
            this.selectedRule = rule;
            this.selectOrderIndex = 0;
            this.currentMatches = null;
            let matchingNodes = this.getExpr().findAll(n => rule.matches(n));
            if (matchingNodes.length === 1) {
                this.selectedTargetNode = matchingNodes[0];
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
            this.selectedTargetNode = node;
            this.buildContextMenueNode(node);
            this.workSpaceUI.contextMenue.show(e.clientX,e.clientY);
        }

        this.updateVisual();
    }

    applySelectedRule() {
        this.getExprSheet().applyRule(this.selectedRule, this.selectedTargetNode, this.currentMatches[0], new Map())
        this.runAutoRules();
        this.selectedRule = null;
        this.selectedTargetNode = null;
    }

    getNextAction() {
        if (this.selectedRule === null) {
            if (this.selectedTargetNode === null) {
                return "selectRuleOrRootNode";
            } else {
                return "selectRule";
            }
        } else {
            if (this.selectedTargetNode === null) {
                return "selectRootNode";
            } else {
                this.prepareSelectNextNode();
                if (this.selectedRule.getMatchesWithUniqueSolutions(this.selectedTargetNode, this.currentMatches).length >= 2) {
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
            for (let n of this.getExpr().getAllNodes()) {
                this.controller.setSelectable(n, true);
                this.controller.setHighlighted(n, false, "blue", "rgba(255, 225, 0, 0.29)", "rgb(162, 146, 0)");
            }
        } else if (nextAction === "selectRule") {
            for (let n of this.getExpr().getAllNodes()) {
                this.controller.setSelectable(n, true);
                this.controller.setHighlighted(n, this.selectedTargetNode === n, "transparent", "rgba(255, 225, 0, 0.29)", "rgb(162, 146, 0)");
            }
        } else if (nextAction === "selectRootNode") {
            for (let n of this.getExpr().getAllNodes()) {
                this.controller.setSelectable(n, this.selectedRule.matches(n));
            }
        } else if (nextAction === "selectNextNode") {
            let selectableNodes = this.prepareSelectNextNode();
            for (let n of this.getExpr().getAllNodes()) {
                this.controller.setSelectable(n, selectableNodes.has(n));
                this.controller.setHighlighted(n, this.selectedTargetNode === n, "transparent", "rgba(255, 225, 0, 0.29)", "rgb(162, 146, 0)");
            }
        } else if (nextAction === "applyRule") {
            for (let n of this.getExpr().getAllNodes()) {
                this.controller.setSelectable(n, false);
                this.controller.setHighlighted(n, this.selectedTargetNode === n, "transparent", "rgba(229, 255, 0, 0.77)", "rgb(0, 0, 0)");
            }
        }
    }

    prepareSelectNextNode() {
        if (this.currentMatches === null) {
            this.currentMatches = this.selectedRule.getMatches(this.selectedTargetNode);
            console.log(this.currentMatches);
            this.selectOrderIndex = 0;
        }
        while (this.selectOrderIndex < this.selectedRule.selectOrder.length) {
            let selectableNodes = this.selectedRule.getSelectableNodes(this.selectedTargetNode, this.currentMatches, this.selectOrderIndex);
            console.log("selectableNodes",selectableNodes)
            if (selectableNodes.size >= 2) return selectableNodes;
            this.selectOrderIndex++;
        }
        return new Set();
    }

    buildContextMenueNode() {
        this.workSpaceUI.contextMenue.clear();

        const observeTags = ["shorten","reorder","reshape","expand","definition","definition_reversed"];
        
        const rulesOrder = new Map();
        for (let tag of observeTags) rulesOrder.set(tag,[]);
        rulesOrder.set("else",[]);

        let up = [];// shorten, reorder, reshape
        let down = [];// expand, definition, definition reverses

        let i = 0;
        outer: for (let rule of this.workSpaceUI.workSpace.rules) {
            if (rule.matches(this.selectedTargetNode)) {
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
            this.workSpaceUI.contextMenue.addItem(icon,{onclick:(e)=>this.clickRule(rule,e),onmouseover:(e)=>console.log(e)},side,index);
            indexCounters.set(side,index+1);
        }


        for (let rule of rulesOrder.get("shorten")) showRule(rule,"top");
        for (let rule of rulesOrder.get("reorder")) showRule(rule,"top");
        for (let rule of rulesOrder.get("reshape")) showRule(rule,"top");
        for (let rule of rulesOrder.get("definition_reversed")) showRule(rule,"bottom");
        for (let rule of rulesOrder.get("definition")) showRule(rule,"bottom");
        for (let rule of rulesOrder.get("expand")) showRule(rule,"bottom");
        for (let rule of rulesOrder.get("else")) showRule(rule,"bottom");

        this.workSpaceUI.contextMenue.addItem(Umform.Icons.createTextIcon2Lines("CLE","AR"), {onclick:(e)=>{
            this.setExpr(this.getExpr().cloneReplace(this.selectedTargetNode, p("_")));
        },onmouseover:(e)=>console.log(e)},"right",0);

        this.workSpaceUI.contextMenue.addItem(Umform.Icons.createTextIcon2Lines("CALC","1+2"), {onclick:(e)=>{
            this.setExpr(this.getExpr().cloneReplace(this.selectedTargetNode, Umform.calc(this.selectedTargetNode),this.autoRules));
            this.runAutoRules();
        },onmouseover:(e)=>console.log(e)},"left",0);
    }

    exprChange(expr) {
        this.controller.reset();

        this.exprNodeUI = new Umform.ExprNodeUI(expr, this.workSpaceUI.workSpace, this.controller);
        this.onNewExprNodeUICallback(this.exprNodeUI);

        this.updateVisual();
    }
}

Umform.WorkSpaceUISidePanel = class {
    constructor(workSpaceUI) {
        this.workSpaceUI = workSpaceUI;

        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.right = "10px";
        this.element.style.top = "10px";
        this.element.style.width = "25%";
        this.element.style.height = "75%";
        this.element.style.outline = "2px solid black";
        this.element.style.backgroundColor = "rgba(255,255,255,0.9)";
        this.element.style.borderRadius = "30px";
        this.element.style.padding = "30px";
//        this.element.style.overflow = "hidden";

        this.tabView = new Umform.TabView();
        this.element.appendChild(this.tabView.element);

        
        this.newNodeUI = new Umform.NewNodeUI((newNode)=>this.workSpaceUI.onPaste(newNode), this.workSpaceUI.workSpace);
        this.tabView.addTab({
            id: "newNode",
            iconElement: document.createTextNode("+"),
            contentElement: this.newNodeUI.element
        });

        this.tabView.addTab({
            id: "ids",
            iconElement: document.createTextNode("ID"),
            contentElement: document.createTextNode("TODO Identifyer")
        });

        this.tabView.addTab({
            id: "rules",
            iconElement: document.createTextNode("R"),
            contentElement: document.createTextNode("TODO Rules")
        });

        this.tabView.addTab({
            id: "autoRules",
            iconElement: document.createTextNode("AR"),
            contentElement: document.createTextNode("TODO Auto Rules")
        });

        this.tabView.addTab({
            id: "assumptions",
            iconElement: document.createTextNode("ASS"),
            contentElement: document.createTextNode("TODO Assumptions")
        });

        this.tabView.addTab({
            id: "importExport",
            iconElement: document.createTextNode("ImEx"),
            contentElement: document.createTextNode("TODO Import Export")
        });

        this.tabView.addTab({
            id: "formulaSheets",
            iconElement: document.createTextNode("FS"),
            contentElement: document.createTextNode("TODO Formula Sheets")
        });
    }

    showNewNodeUI() {
        this.tabView.openTab("newNode")
        this.newNodeUI.show();
    }
    hideNewNodeUI() {
        this.tabView.openTab(null)
        this.newNodeUI.hide();
    }
}

Umform.WorkSpaceUITopPanel = class {
    constructor(workSpaceUI) {
        this.workSpaceUI = workSpaceUI;

        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.left = "10px";
        this.element.style.top = "10px";
        //this.element.style.width = "200px";
        //this.element.style.height = "30px";
        this.element.style.outline = "2px solid black";
        this.element.style.backgroundColor = "rgba(255,255,255,0.9)";
        this.element.style.borderRadius = "30px";
        this.element.style.padding = "10px";

        this.exprSheetSelect = document.createElement("select");
        this.exprSheetSelect.addEventListener("change", (e) => {
            this.workSpaceUI.setActiveExprSheetName(e.target.value);
        });
        this.element.appendChild(this.exprSheetSelect);

        this.rebuildExprSheetSelect(Array.from(this.workSpaceUI.workSpace.exprSheets.keys()));
    }

    rebuildExprSheetSelect(sheetNames) {
        this.exprSheetSelect.innerHTML = "";
        for (let sheetName of sheetNames) {
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(sheetName));
            option.value = sheetName;
            this.exprSheetSelect.appendChild(option);
        }
    }

}

Umform.TabView = class {
    constructor() {
        this.element = document.createElement("div");
//        this.element.style.overflow = "hidden";

        this.tabSelect = document.createElement("div");
        this.element.appendChild(this.tabSelect);

        this.tabContentContainer = document.createElement("div");
        //this.tabContentContainer.style.overflowY = "scroll";
        this.element.appendChild(this.tabContentContainer);

        this.tabs = new Map();
        this.currentTabId = null;
    }

    addTab({id, iconElement, contentElement, onOpen=null, onClose=null}) {
        let btn = document.createElement("button");
        btn.style.fontSize = "30px";
        btn.appendChild(iconElement);

        btn.onclick = ()=>{
            this.openTab(id);
        }

        this.tabSelect.appendChild(btn);

        this.tabs.set(id, {button:btn, contentElement:contentElement, onOpen, onClose});
    }

    openTab(id) {
        let oldTab = this.tabs.get(this.currentTabId);
        if (oldTab !== null && oldTab !== undefined) {
            if (oldTab.onClose) {
                oldTab.onClose();
            }
        }

        this.tabContentContainer.innerHTML = "";

        let tab = this.tabs.get(id);
        if (tab === null || tab === undefined) return;

        this.tabContentContainer.appendChild(tab.contentElement);
        if (tab.onOpen) tab.onOpen();
    }

}


Umform.NewNodeUI = class {
    constructor(onNewNodeCallback, workSpace) {
        this.onNewNodeCallback = onNewNodeCallback;
        this.workSpace = workSpace;

        this.element = document.createElement("div");

        const listedInCategorys = new Set();
        for (let category of Umform.NewNodeUI.CATEGORYS) {
            for (let typeName of category.types) {
                listedInCategorys.add(typeName);
            }
        }

        const notListedInCategorys = [];
        for (let type of Umform.TYPE_REGISTRY.values()) {
            if (Umform.NewNodeUI.HIDDEN_TYPES.has(type.getName())) continue;
            if (listedInCategorys.has(type.getName())) continue;
            notListedInCategorys.push(type.getName());
        }

        let categorys = Umform.NewNodeUI.CATEGORYS.slice();
        if (notListedInCategorys.length !== 0) {
            categorys.push({"name":"other","types":notListedInCategorys});
        }

        for (let category of categorys) {
            this.createCategory(category);
        }

        // remove me...
        this.nodeTypeSelectButtonsDiv = document.createElement("div");

        this.hide();
    }

    createCategory(category) {
        let detailsElement = document.createElement("details");
        detailsElement.open = true;
        this.element.appendChild(detailsElement);

        let summaryElement = document.createElement("summary");
        summaryElement.appendChild(document.createTextNode(category.name));
        detailsElement.appendChild(summaryElement);

        if (category.custom) {
            this.createCategoryContentCustom(category, detailsElement);
            return;
        }

        for (let typeName of category.types) {
            if (Umform.NewNodeUI.HIDDEN_TYPES.has(typeName)) continue;
            let type = Umform.getTypeDefinition(typeName);
            if (type === null) continue;

            let btn = document.createElement("button");
            btn.title = type.getTitle()
            btn.appendChild(new Umform.ExprNodeUI(type.createBlanc()).element, this.workSpace);
            btn.addEventListener("click", () => {
                this.onTypeSelect(type);
            });
            detailsElement.appendChild(btn);
        }
    }

    createCategoryContentCustom(category, container) {
        if (category.name === "identifyer") {
            this.createCategoryContentIdentifyer(container);
        }
        if (category.name === "numbers") {
            this.createCategoryContentNumbers(container);
        }
    }

    createCategoryContentIdentifyer(container) {
        let idCats = this.workSpace.identifierManager.getCategorys();
        let i = 0;
        for (let idCat of idCats) {
            if (i !== 0) container.appendChild(document.createElement("br"));
            container.appendChild(document.createTextNode(idCat));
            container.appendChild(document.createElement("br"));
            let ids = this.workSpace.identifierManager.getAllInCategory(idCat);
            for (let idDesc of ids) {
                let btn = document.createElement("button");
                btn.title = idDesc.name;
                btn.appendChild(document.createTextNode(idDesc.shortSymbol));
                btn.addEventListener("click", () => {
                    this.onNewNodeCallback(new Umform.ExprNode({type:"id",data:idDesc.name}));
                });
                container.appendChild(btn);
            }
            i++;
        }
    }

    createCategoryContentNumbers(container) {
        for (let n of [0,1,2,3,4,5,6,7,8,9,10]) {
            let btn = document.createElement("button");
            btn.title = n;
            btn.appendChild(document.createTextNode(n));
            btn.addEventListener("click", () => {
                this.onNewNodeCallback(new Umform.ExprNode({type:"number",data:n}));
            });
            container.appendChild(btn);
        }
        container.appendChild(document.createElement("br"));
        let numberSelectUI = new Umform.NewNodeUI.NumberSelectUI(this.onNewNodeCallback);
        container.appendChild(numberSelectUI.element);
    }


    show() {
        this.element.style.display = "";
    }

    hide() {
        this.element.style.display = "none";
    }

    onTypeSelect(type) {
        switch (type.getName()) {
            case "id":
                break;
            case "number":
                break;
            default:
                let f = function(n) {
                    if (n.type === "_") {
                        return new Umform.ExprNode({type:"_",data:{linkId:Umform.getUniqueId()}});// link blancs
                    }
                    return null;
                }
                this.onNewNodeCallback(type.createBlanc().cloneReplaceByFunction(f),null);
        }
    }
}

Umform.NewNodeUI.CATEGORYS = [
    {"name":"identifyer","types":["id"],"custom":true},
    {"name":"numbers","types":["number"],"custom":true},
    {"name":"logical","types":["not","and","or","implication","equivalence"]},
    {"name":"numerical","types":["neg","sum","product","fraction","power"]}
];

Umform.NewNodeUI.HIDDEN_TYPES = new Set(["__capture__","__map__","__replacement_arrow__","__vertical__","__horizontal__","_"]);

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