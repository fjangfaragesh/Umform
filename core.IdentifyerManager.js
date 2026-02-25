Umform.IdentifierManager = class {
    constructor() {
        this.descriptions = new Map();

        for (let ud of Umform.IdentifierManager.USER_DEFAULT) {
            this.add(new Umform.IdentifierDescription({
                name: "user." + ud,
                shortSymbol: ud,
                category: "user",
                description: "user variable " + ud
            }))
        }

        this.add(new Umform.IdentifierDescription({name: "false", shortSymbol: "𝟎",category: "logical", description: "Logical false"}));
        this.add(new Umform.IdentifierDescription({name: "true", shortSymbol: "𝟏",category: "logical", description: "Logical true"}));

        this.add(new Umform.IdentifierDescription({name: "math.constant.pi", shortSymbol: "π",category: "math.constants", description: "Pi"}));
        this.add(new Umform.IdentifierDescription({name: "math.constant.e", shortSymbol: "𝐞",category: "math.constants", description: "Eulerzahl"}));
        this.add(new Umform.IdentifierDescription({name: "math.constant.i", shortSymbol: "𝐢",category: "math.constants", description: "Imaginary Unit"}));

        for (let ud of Umform.IdentifierManager.DEFINITION_BOUND_VARIABLES_DEFAULT) {
            this.add(new Umform.IdentifierDescription({
                name: "bound." + ud[0],
                shortSymbol: ud[1],
                category: "bound",
                description: "definition bound variable "  + ud[1]
            }))
        }

    }

    add(idDescription) {
        this.descriptions.set(idDescription.name, idDescription);
    }

    get(name) {
        return this.descriptions.get(name);
    }
    
    getAll() {
        return Array.from(this.descriptions.values());
    }

    getAllInCategory(cat) {
        let all = this.getAll();
        let result = [];
        for (let d of all) {
            if (d.category === cat) {
                result.push(d);
            }
        }
        return result;
    }

    getCategorys() {
        let cats = new Set();
        let all = this.getAll();
        for (let d of all) {
            if (!cats.has(d.category)) {
                cats.add(d.category);
            }
        }
        return Array.from(cats);
    }
}

Umform.IdentifierManager.USER_DEFAULT = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
Umform.IdentifierManager.DEFINITION_BOUND_VARIABLES_DEFAULT = [["a","𝑎"],["b","𝑏"],["c","𝑐"],["d","𝑑"],["e","𝑒"],["f","𝑓"],["g","𝑔"],["h","ℎ"],["i","𝑖"],["j","𝑗"],["k","𝑘"],["l","𝑙"],["m","𝑚"],["n","𝑛"],["o","𝑜"],["p","𝑝"],["q","𝑞"],["r","𝑟"],["s","𝑠"],["t","𝑡"],["u","𝑢"],["v","𝑣"],["w","𝑤"],["x","𝑥"],["y","𝑦"],["z","𝑧"]];

Umform.IdentifierDescription = class {
    constructor({name, shortSymbol, category="other", descriptionText=""}) {
        this.name = name;
        this.shortSymbol = shortSymbol;
        this.category = category;
        this.description = descriptionText;
    }
}