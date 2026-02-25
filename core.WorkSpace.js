Umform.WorkSpace = class {
    constructor() {
        this.exprSheets = new Map();

        this.assumptions = [];
        
        this.identifierManager = new Umform.IdentifierManager();

        this.rules = Array.from(Umform.RULES.values());
        this.autoRules = Array.from(Umform.AUTO_RULES.values());

//        this.formulaBook = [];

        this.onExprChange = null;
        this.onExprSheetListChange = null;
        this.onAssumptionsChange = null;
    }

    newExprSheet(name, expr) {
        this.exprSheets.set(name, new Umform.WorkSpace.ExprSheet(this, name, expr,(newExpr)=>{
            if (this.onExprChange) {
                this.onExprChange(name,newExpr);
            }
        }));
        if (this.onExprSheetListChange) {
            this.onExprSheetListChange(Array.from(this.exprSheets.keys()));
        }
    }

    getExprSheet(name) {
        return this.exprSheets.get(name);
    }

    addAssumption(expr) {
        this.assumptions.push(expr);
        if (this.onAssumptionsChange) {
            this.onAssumptionsChange(this.assumptions);
        }
    }

    export() {
        let d = {
            exprSheets: Array.from(this.exprSheets.values().map((es)=>es.export()))
        };
        return d;
    }

    import(d) {
        if (!d) return;
        if (d.exprSheets) {
            for (let esd of d.exprSheets) {
                if (!this.getExprSheet(esd.name)) {
                    this.newExprSheet(esd.name, p(esd.expr));
                } else {
                    esd.setExpr(p(esd.expr));
                }
                let es = this.getExprSheet(esd.name);
                es.exprHistory = esd.exprHistory.map((x)=>p(x));
                es.exprHistoryPointer = esd.exprHistoryPointer;
            }
        }
    }
}

Umform.WorkSpace.ExprSheet = class {
    constructor(workSpace, name, expr, onExprChange=null) {
        this.workSpace = workSpace;
        this.name = name;
        this.expr = expr ?? p("_");
        this.exprHistory = [this.expr];
        this.exprHistoryPointer = 0;
        this.onExprChange = onExprChange;
    }

    setExpr(newExpr, noHistoryUpdate = false) {
        let changedExact = this.expr !== newExpr; 
        let changed = !this.expr.equals(newExpr);
        if (!noHistoryUpdate && changed) {
            this.historyAdd(newExpr);
        }
        this.expr = newExpr;
        
        if (changedExact && this.onExprChange) {
            this.onExprChange(newExpr);
        }
    }

    historyAdd(newExpr) {
        if (this.exprHistoryPointer + 1 < this.exprHistory.length) {
            this.exprHistory.splice(this.exprHistoryPointer+1);
        }
        this.exprHistory.push(newExpr);
        this.exprHistoryPointer = this.exprHistory.length-1;
    }

    historyBack() {
        if (this.exprHistoryPointer <= 0) return;
        this.exprHistoryPointer--;
        this.setExpr(this.exprHistory[this.exprHistoryPointer],true);
    }

    historyForward() {
        if (this.exprHistoryPointer+1 >= this.exprHistory.length) return;
        this.exprHistoryPointer++;
        this.setExpr(this.exprHistory[this.exprHistoryPointer],true);
    }

    applyRule(rule, targetNode, binding, freeCaptureValues=new Map()) {
        console.log("applying Rule",rule.title + "(" + rule.name + ") on ", targetNode, " with binding ", binding, " and free capture values ", freeCaptureValues);
        let replaced = rule.replace(binding, freeCaptureValues);
        this.setExpr(this.expr.cloneReplace(targetNode, replaced));
        this.runAutoRules();
    }

    runAutoRules() {
        this.setExpr(Umform.runAutoRules(this.expr, this.workSpace.autoRules));
    }

    export() {
        return {
            name: this.name,
            expr: this.expr.stringify(),
            exprHistory: this.exprHistory.map((x)=>x.stringify()),
            exprHistoryPointer: this.exprHistoryPointer
        }
    }
}