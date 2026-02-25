
// ohne operanten "type"
// mit operanten "type(operant1, operant2, ...)"
// zusätzlich mit zusatzdaten "type{data}(operant1, operant2, ...)", wobei data ein json ist
// beispiel: sum(number{1},number{2},neg(number{3})) -> 1 + 2 + -(3) -> 1 + 2 - 3
// beispiel: product(var{"a"},var{"namespace1.b"},var{"const.math.e"}) -> a * b * e (wobei mit e die konstante e gemeint ist)
// beispiel: matproduct(var{"A"},var{"B"}) -> A*B, wobei mit * das nicht kommutative Produkt von Matritzen gemeint ist
// beispiel: op{"sum"} -> meint die Summenoperation, aber als Operant (für Gruppen oder Mengen wichtig, wo Opertionen auch teil sein können)
// beispiel: set.explicit(number{1},var{"A"},op{"matproduct"}) -> Die Menge {1,A,*}, wobei * das Produkt zweier Matritzen ist
// beispiel: equals(var{"a"} = var{"b"}) --> Die gleichung a = b
// captures: <a>, sum(<a>,<b>), sum(<a>...), <a>id{"x"}, <a>...id<"x">, <a>sum(<b>...), NICHT erlaubt: <a>...sum(<b>)
Umform.ExprNode.parse = function (str) {
    let i = 0;

    function skipWs() {
        while (i < str.length && /\s/.test(str[i])) i++;
    }

    function peek() {
        skipWs();
        return str[i];
    }

    function consume(char) {
        skipWs();
        if (str[i] !== char) {
            throw new Error("Erwartet '" + char + "' bei Position " + i);
        }
        i++;
    }

    function parseIdentifier() {
        skipWs();
        let start = i;
        while (i < str.length && /[a-zA-Z0-9_.]/.test(str[i])) i++;
        if (start === i) {
            throw new Error("Identifier erwartet bei Position " + i);
        }
        return str.slice(start, i);
    }

    function parseData() {
        skipWs();
        if (peek() !== "{") return null;

        let start = i;
        let depth = 0;
        let inString = false;
        let escape = false;

        while (i < str.length) {
            const ch = str[i];

            if (inString) {
                if (escape) {
                    escape = false;
                } else if (ch === "\\") {
                    escape = true;
                } else if (ch === '"') {
                    inString = false;
                }
            } else {
                if (ch === '"') {
                    inString = true;
                } else if (ch === "{") {
                    depth++;
                } else if (ch === "}") {
                    depth--;
                    if (depth === 0) {
                        i++;
                        break;
                    }
                }
            }

            i++;
        }

        if (depth !== 0) {
            throw new Error("Unbalanced braces in JSON data");
        }

        const raw = str.slice(start + 1, i - 1).trim();

        // Spezialfall: Wildcard
        if (raw === "*") {
            return Umform.ANY;
        }

        return JSON.parse(raw);
    }

    function parseChildren() {
        skipWs();
        if (peek() !== "(") return [];

        consume("(");
        const children = [];

        while (true) {
            skipWs();
            if (peek() === ")") {
                consume(")");
                break;
            }

            children.push(parseExpression());

            skipWs();
            if (peek() === ",") {
                consume(",");
                continue;
            }
            if (peek() === ")") {
                consume(")");
                break;
            }
        }

        return children;
    }

    function parseExpression() {
        skipWs();

        if (peek() === "<") {
            return parseCapture();
        }

        const type = parseIdentifier();
        const data = parseData();
        const children = parseChildren();

        return new Umform.ExprNode({
            type,
            data,
            children
        });
    }

    function parseCapture() {
        consume("<");
        const name = parseIdentifier();
        consume(">");

        skipWs();

        let variadic = false;
        if (str.slice(i, i + 3) === "...") {
            i += 3;
            variadic = true;
            skipWs();
        }

        // Optionaler Filter
        let filterNode = null;

        const next = peek();
        if (next && next !== "," && next !== ")" ) {
            // alles was jetzt kommt ist ein normales Expression → Filter
            filterNode = parseExpression();
        }

        return new Umform.ExprNode({
            type: "__capture__",
            data: { name, variadic },
            children: filterNode ? [filterNode] : []
        });
    }

    const result = parseExpression();
    skipWs();

    if (i !== str.length) {
        throw new Error("Unerwarteter Rest bei Position " + i);
    }

    return result;
};

function p(x) {
    return Umform.ExprNode.parse(x);
}

Umform.ExprNode.stringify = function(node) {
    if (!node) return "";

    let str;
    if (node.type === "__capture__") {
        str = "<" + node.data.name + ">";
        if (node.variadic) str += "...";
        if (node.children.length >= 1) str += Umform.ExprNode.stringify(node.children[0]);
        return str;
    }

    str = node.type;

    // Daten als JSON, falls vorhanden
    if (node.data === Umform.ANY) {
        str += "{*}";
    } else if (node.data !== null) {
        str += "{" + JSON.stringify(node.data) + "}";
    }

    // Kinder rekursiv
    if (node.children && node.children.length > 0) {
        str += "(" + node.children.map(c => Umform.ExprNode.stringify(c)).join(",") + ")";
    }

    return str;
};