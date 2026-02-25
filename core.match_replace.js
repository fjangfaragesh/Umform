function matchAll(pattern, expr, initialBindings = new Set([new Map()])) {
    function matchNode(pn, en, bindings) {
        if (pn.type === "__capture__") {
            
            if (pn.data.variadic) {
                throw new Error("Variadic capture not allowed here (must be in children)");
            }

            let allowedBindings = new Set();

            for (let b of bindings) {
                if (b.has(pn.data.name)) {
                    if (b.get(pn.data.name).equals(en)) {
                        allowedBindings.add(b);
                    }
                } else {
                    let bNew = new Map(b);
                    bNew.set(pn.data.name, en); // capture belegen
                    allowedBindings.add(bNew);
                }
            }
            if (pn.children.length === 0) {
                return allowedBindings;// no filter
            } else {
                return matchNode(pn.children[0],en,allowedBindings);// capture with filter
            }
        }

        if (pn.type !== en.type) {
            return new Set(); // unterschiedliche Typen können nicht gematcht werden
        }
        
        if (JSON.stringify(pn.data) !== JSON.stringify(en.data) && pn.data !== Umform.ANY) {
            return new Set(); // knoten mit unterschiedlichen Daten sind verschieden
        }

        return matchChildren(pn.children, en.children, bindings);
    }

    function matchChildren(pChildren, eChildren, bindings) {
        function matchChildrenStep(pIndex, eIndex, currentBindings) {
            if (pIndex === pChildren.length && eIndex === eChildren.length) {
                return currentBindings;
            }

            if (pIndex === pChildren.length) {
                return new Set(); // zu wenige Kinder im Pattern
            }

            let pChild = pChildren[pIndex];
            if (pChild.type === "__capture__" && pChild.data.variadic) {
                let newBindings = new Set();
                for (let b of currentBindings) {
                    if (b.has(pChild.data.name)) {
                        let boundNodes = b.get(pChild.data.name);
                        if (equalsNodes(boundNodes, eChildren.slice(eIndex,eIndex+boundNodes.length))) {
                            newBindings = newBindings.union(matchChildrenStep(pIndex + 1, eIndex + boundNodes.length, new Set([b])));
                        }
                    } else {
                        for (let len = 0; len <= eChildren.length - eIndex; len++) {
                            let bNew = new Map(b);
                            bNew.set(pChild.data.name, eChildren.slice(eIndex,eIndex+len));
                            newBindings = newBindings.union(matchChildrenStep(pIndex + 1, eIndex + len, new Set([bNew])));
                        }
                    }
                }
                return newBindings;
            }
            
            if (eIndex === eChildren.length) {
                return new Set(); // zu wenige Kinder im Ausdruck
            }

            let newBindings = matchNode(pChild, eChildren[eIndex], currentBindings);
            if (newBindings.size === 0) {
                return newBindings; // aktuelles Kind passt nicht, daher kein Match
            }
            return matchChildrenStep(pIndex + 1, eIndex + 1, newBindings);
        }
        return matchChildrenStep(0, 0, bindings);
    }

    function equalsNodes(nodes1, nodes2) {
        if (nodes1.length !== nodes2.length) return false;
        for (let i = 0; i < nodes1.length; i++) {
            if (!nodes1[i].equals(nodes2[i])) return false;
        }
        return true;
    }
    return Array.from(matchNode(pattern, expr, new Set(initialBindings)));
}



function applyReplacement(binding, replacementPattern) {
    function replaceNode(currentBinding, node) {
        if (node.type === "__capture__") {
            if (currentBinding.has(node.data.name)) {
                if (node.data.variadic) {
                    throw new Error("Variadic capture not allowed here (must be in children)");
                }
                return currentBinding.get(node.data.name).clone();
            }
        }

        let result = new Umform.ExprNode({
            type: node.type,
            data: Umform.cloneData(node.data),
            children: replaceChildren(currentBinding, node.children)
        });

        /*
        if (result.type === "__calc__") {
            return Umform.calc(result)
        }
        */

        if (result.type === "__replace__") {
            return result.children[2].cloneReplaceConditional((n)=>n.equals(result.children[0]),result.children[1]);
        }

        return result;
    }

    function replaceChildren(currentBinding, children) {
        let childrenReplaced = [];
        for (let child of children) {
            if (child.type === "__capture__" && child.data.variadic) {
                if (currentBinding.has(child.data.name)) {
                    if (!(currentBinding.get(child.data.name) instanceof Array)) throw new Error("Variadic Capture " + child.data.name + " was not bound to an Array!");
                    childrenReplaced.push(...currentBinding.get(child.data.name).map(n => n.clone()));
                    continue;
                }
            }

            if (child.type === "__map__") {
                let captureV = child.children[0];
                let captureI = child.children[1];
                let expr = child.children[2];
                if (currentBinding.has(captureV.data.name)) {
                    let boundNodes = currentBinding.get(captureV.data.name);
                    let innerBinding = new Map(currentBinding);
                    for (let n of boundNodes) {
                        innerBinding.set(captureI.data.name, n);
                        childrenReplaced.push(replaceNode(innerBinding, expr));
                    }
                    continue;
                }
            }

            childrenReplaced.push(replaceNode(currentBinding, child));
        }
        return childrenReplaced;
    }

    return replaceNode(binding,replacementPattern);
}
