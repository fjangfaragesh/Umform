Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "number";
    }
    getPrecedence() {
        return 100;
    }
    createBlanc(options) {
        let value = 42;
        if (options) {
            if (options.value !== null) {
                value = options.value;
            }
        }
        return new Umform.ExprNode({type: this.getName(), data: value});
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
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, nodePrec) {
        const minusbox = new TextBox("−")
        const box = new HBox([
                        minusbox,
                        exprNodeUI.nodeToBox(node.children[0], nodePrec)
                    ], 2);

        return {box:box, nodeContentElements:[minusbox]}
    }
    calc(data, childrenCalc) {
        if (childrenCalc[0].type === "neg") return childrenCalc[0].children[0];
        return super.calc(data, childrenCalc);
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
    calc(data, childrenCalc) {
        let numSum = 0;
        let childrenNotCalculable = [];
        for (let c of childrenCalc) {
            if (c.type === "number") {
                numSum += c.data;
                continue;
            }
            if (c.type === "neg") {
                if (c.children[0].type == "number") {
                    numSum -= c.children[0].data;
                }
                continue;
            }
            childrenNotCalculable.push(c);
        }
        
        let numResultNode = new Umform.ExprNode({type:"number",data:Math.abs(numSum)});
        if (numSum < 0) numResultNode = new Umform.ExprNode({type: "neg", children:[numResultNode]});

        console.log(numSum, numResultNode, childrenNotCalculable);

        if (childrenNotCalculable.length === 0) {
            return numResultNode;
        }

        if (numSum === 0) {
            return new Umform.ExprNode({type: this.getName(), data: structuredClone(data), children: childrenNotCalculable});
        }

        return new Umform.ExprNode({
            type: this.getName(),
            data: structuredClone(data),
            children: [numResultNode, ...childrenNotCalculable]
        });
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
    calc(data, childrenCalc) {
        let numProduct = 1;
        let childrenNotCalculable = [];
        for (let c of childrenCalc) {
            if (c.type === "number") {
                numProduct *= c.data;
                continue;
            }
            if (c.type === "neg") {
                if (c.children[0].type == "number") {
                    numProduct *= -c.children[0].data;
                }
                continue;
            }
            childrenNotCalculable.push(c);
        }
        
        let numResultNode = new Umform.ExprNode({type:"number",data: Math.abs(numProduct)});
        if (numProduct < 0) numResultNode = new Umform.ExprNode({type: "neg", children:[numResultNode]});

        if (childrenNotCalculable.length === 0) {
            return numResultNode;
        }

        if (numSum === 1) {
            return new Umform.ExprNode({type: this.getName(), data: structuredClone(data), children: childrenNotCalculable});
        }

        return new Umform.ExprNode({
            type: this.getName(),
            data: structuredClone(data),
            children: [numResultNode, ...childrenNotCalculable]
        });
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "power";
    }
    getPrecedence() {
        return 83;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, nodePrec) {
        const box = new SuperScriptBox(
            exprNodeUI.nodeToBox(node.children[0], nodePrec),
            exprNodeUI.nodeToBox(node.children[1], nodePrec)
        );
        return {box:box, nodeContentElements:[]};
    }
    calc(data, childrenCalc) {
        let numBase = null;
        let numExp = null;

        if (childrenCalc[0].type === "number") {
            numBase = childrenCalc[0].data;
        }
        if (childrenCalc[0].type === "neg") {
            if (childrenCalc[0].children[0].type === "number") {
                numBase = -childrenCalc[0].children[0].data;
            }
        }

        if (childrenCalc[1].type === "number") {
            numExp = childrenCalc[1].data;
        }
        if (childrenCalc[1].type === "neg") {
            if (childrenCalc[1].children[0].type === "number") {
                numExp = -childrenCalc[1].children[0].data;
            }
        }

        // x^0 = 1
        if (numExp === 0) {
            return new Umform.ExprNode({type:"number",data: 1});
        }

        // x^1 = x
        if (numExp === 1) {
            return childrenCalc[0];
        }

        // 1^x = 1
        if (numBase === 1) {
            return new Umform.ExprNode({type:"number",data: 1});
        }

        // (-x)^(2k) = x^(2k)
        if (numBase === null && numExp !== null && (numExp % 2 + 2) % 2 === 0 && childrenCalc[0].type === "neg") {
            return new Umform.ExprNode({type:this.getName(), data:structuredClone(data), children:[childrenCalc[0].children[0], childrenCalc[1]]});
        }

        // not calculatable
        if (numBase === null || numExp === null) {
           return super.calc(data,childrenCalc);
        }

        let numResult = null;// only for sign
        let numResultNode = null;
        if (numExp < 0) {
            numResult = numBase**(-numExp);
            let numerator = new Umform.ExprNode({type:"number",data: 1});
            let divisor = new Umform.ExprNode({type:"number",data: Math.abs(numResult)});
            numResultNode = new Umform.ExprNode({type:"fraction", children:[numerator,divisor]});
        } else {
            numResult = numBase**numExp;
            numResultNode = new Umform.ExprNode({type:"number",data: Math.abs(numResult)});
        }
        if (numResult < 0) numResultNode = new Umform.ExprNode({type: "neg", children:[numResultNode]});   
        return numResultNode;
    }
}());

Umform.registerType(new class extends Umform.TypeDefinition {
    getName() {
        return "fraction";
    }
    getPrecedence() {
        return 82;
    }
    createBlanc() {
        return new Umform.ExprNode({type: this.getName(), children: [new Umform.ExprNode({type:"_"}),new Umform.ExprNode({type:"_"})]});
    }
    createBox(exprNodeUI, node, nodePrec) {
        const box = new FractionBox(
                        exprNodeUI.nodeToBox(node.children[0], 0),
                        exprNodeUI.nodeToBox(node.children[1], 0)
                    );// notePrec=0
        return {box:box, nodeContentElements:[box]};
    }
    calc(data, childrenCalc) {
        let numNumerator = null;
        let numDivisor = null;

        if (childrenCalc[0].type === "number") {
            numNumerator = childrenCalc[0].data;
        }
        if (childrenCalc[0].type === "neg") {
            if (childrenCalc[0].children[0].type === "number") {
                numNumerator = -childrenCalc[0].children[0].data;
            }
        }

        if (childrenCalc[1].type === "number") {
            numDivisor = childrenCalc[1].data;
        }
        if (childrenCalc[1].type === "neg") {
            if (childrenCalc[1].children[0].type === "number") {
                numDivisor = -childrenCalc[1].children[0].data;
            }
        }

        // x/0 is not defined, return x/0
        if (numDivisor === 0) {
            return super.calc(data,childrenCalc);
        }

        // x/1 = x
        if (numDivisor === 1) {
            return childrenCalc[0];
        }

        if (numNumerator === null || numDivisor === null) {
            // (-a)/(-b) = a/b
            if (childrenCalc[0].type === "neg" && childrenCalc[1].type === "neg") {
                return new Umform.ExprNode({
                    type:this.getName(),
                    data:structuredClone(data),
                    children:[childrenCalc[0].children[0], childrenCalc[1].children[0]]
                });
            }
            // (-a)/b = -(a/b)
            if (childrenCalc[0].type === "neg") {
                let frct = new Umform.ExprNode({
                    type:this.getName(),
                    data:structuredClone(data),
                    children:[childrenCalc[0].children[0], childrenCalc[1]]
                });
                return new Umform.ExprNode({type: "neg",children:[frct]});
            }
            // a/(-b) = -(a/b)
            if (childrenCalc[1].type === "neg") {
                let frct = new Umform.ExprNode({
                    type:this.getName(),
                    data:structuredClone(data),
                    children:[childrenCalc[0], childrenCalc[1].children[0]]
                });
                return new Umform.ExprNode({type: "neg",children:[frct]});
            }
            // else
            return new Umform.ExprNode({
                type:this.getName(),
                data:structuredClone(data),
                children:[childrenCalc[0], childrenCalc[1]]
            }); 
        }

        
        let absNumNumerator = Math.abs(numNumerator);
        let absNumDivisor = Math.abs(numDivisor);

        // Kürzen; TODO: schneller machen mit Primfaktorzerlegung (?)

        if (absNumNumerator > 1000000) {
            return new Umform.ExprNode({
                type:this.getName(),
                data:structuredClone(data),
                children:[childrenCalc[0], childrenCalc[1]]
            });
        }
        let i = 2;
        while (i <= absNumNumerator) {
            if (absNumNumerator % i == 0 && absNumDivisor % i == 0) {
                absNumNumerator = absNumNumerator / i;
                absNumDivisor = absNumDivisor / i;
            } else {
                i++;
            }
        }

        let numResultNode = null;
        if (absNumDivisor === 1) {
            numResultNode = new Umform.ExprNode({type:"number", data:absNumNumerator});
        } else {
            let numNumerator = new Umform.ExprNode({type:"number", data:absNumNumerator});
            let numDivisor = new Umform.ExprNode({type:"number", data:absNumDivisor});
            numResultNode = new Umform.ExprNode({
                type:this.getName(),
                data:structuredClone(data),
                children:[numNumerator, numDivisor]
            });
        }
       
        if (numNumerator/numDivisor < 0) {
            numResultNode = new Umform.ExprNode({type: "neg", children:[numResultNode]});  
        }

        return numResultNode;
    }
}());