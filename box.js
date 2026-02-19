class Box {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.depth = 0;
    }

    layout(ctx) {
        // überschreiben
    }

    render(svg, x, baselineY) {
        // überschreiben
    }

    scale(factor) {
        const box = new ScaledBox(this, factor);
        return box;
    }

    setColor(color) {
        
    }

}

class TextBox extends Box {
    constructor(text, fontSize = 16, fontFamily = "serif") {
        super();
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;

        this.color = "black";
        this.textElement = null;
    }

    layout(ctx) {
        ctx.save();
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        const m = ctx.measureText(this.text);

        this.width = m.width;
        this.height = m.actualBoundingBoxAscent;
        this.depth = m.actualBoundingBoxDescent;

        ctx.restore();
    }

    render(svg, x, baselineY) {
        this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.textElement.setAttribute("x", x);
        this.textElement.setAttribute("y", baselineY);
        this.textElement.setAttribute("font-size", this.fontSize);
        this.textElement.setAttribute("font-family", this.fontFamily);
        this.textElement.setAttribute("dominant-baseline", "alphabetic");
        this.textElement.setAttribute("fill", this.color);
        this.textElement.textContent = this.text;

        svg.appendChild(this.textElement);
    }

    setColor(color) {
        this.color = color;
        if (this.textElement) {
            this.textElement.setAttribute("fill", color);
        }
    }
}

class HBox extends Box {
    constructor(children = [], spacing = 0) {
        super();
        this.children = children;
        this.spacing = spacing;
    }

    layout(ctx) {
        this.width = 0;
        this.height = 0;
        this.depth = 0;

        for (const child of this.children) {
            child.layout(ctx);

            this.width += child.width;
            this.height = Math.max(this.height, child.height);
            this.depth = Math.max(this.depth, child.depth);
        }

        if (this.children.length > 1) {
            this.width += this.spacing * (this.children.length - 1);
        }
    }

    render(svg, x, baselineY) {
        let offsetX = x;

        for (const child of this.children) {
            child.render(svg, offsetX, baselineY);
            offsetX += child.width + this.spacing;
        }
    }
}

class VBox extends Box {
    constructor(children = [], spacing = 2) {
        super();
        this.children = children;
        this.spacing = spacing;
    }

    layout(ctx) {
        this.width = 0;
        this.height = 0;
        this.depth = 0;

        let totalHeight = 0;

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.layout(ctx);

            this.width = Math.max(this.width, child.width);

            if (i === 0) {
                this.height = child.height;
                totalHeight = child.height + child.depth;
            } else {
                totalHeight += this.spacing + child.height + child.depth;
            }
        }

        this.depth = totalHeight - this.height;
    }

    render(svg, x, baselineY) {
        let currentY = baselineY;

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];

            if (i === 0) {
                child.render(svg, x, currentY);
                currentY += child.depth + this.spacing;
            } else {
                currentY += child.height;
                child.render(svg, x, currentY);
                currentY += child.depth + this.spacing;
            }
        }
    }
}

class RectBox extends Box {
    constructor(width, height, options = {}) {
        super();
        this.width = width;
        this.height = height*3/4;
        this.depth = height / 4; // Rechteck liegt komplett oberhalb der Baseline

        this.rectHeight = height;

        this.fill = options.fill || "none";
        this.stroke = options.stroke || "black";
        this.strokeWidth = options.strokeWidth || 1;

        this.rectElement = null;
    }

    layout(ctx) {
        // feste Maße – nichts zu berechnen
    }

    render(svg, x, baselineY) {

        const y = baselineY - this.height;

        this.rectElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );

        this.rectElement.setAttribute("x", x);
        this.rectElement.setAttribute("y", y);
        this.rectElement.setAttribute("width", this.width);
        this.rectElement.setAttribute("height", this.rectHeight);
        this.rectElement.setAttribute("fill", this.fill);
        this.rectElement.setAttribute("stroke", this.stroke);
        this.rectElement.setAttribute("stroke-width", this.strokeWidth);

        svg.appendChild(this.rectElement);
    }

    setColor(color) {
        this.stroke = color;
        if (this.rectElement) {
            this.rectElement.setAttribute("stroke", color);
        }
    }

    setFill(color) {
        this.fill = color;
        if (this.rectElement) {
            this.rectElement.setAttribute("fill", color);
        }
    }
}

class SuperScriptBox extends Box {
    constructor(base, script, scriptScale = 0.7) {
        super();
        this.base = base;
        this.script = script.scale(scriptScale);
    }

    layout(ctx) {
        this.base.layout(ctx);
        this.script.layout(ctx);

        // Besserer Shift
        this.shiftUp = Math.max(
            this.base.height * 0.8,
            this.base.height + this.script.height * 0.3
        );

        this.width = this.base.width + this.script.width;

        this.height = Math.max(
            this.base.height,
            this.shiftUp + this.script.height
        );

        this.depth = Math.max(this.base.depth, this.script.depth);
    }

    render(svg, x, baselineY) {
        this.base.render(svg, x, baselineY);

        const scriptX = x + this.base.width;
        const scriptY = baselineY - this.shiftUp;

        this.script.render(svg, scriptX, scriptY);
    }
}

class FractionBox extends Box {
    constructor(numerator, denominator, gap = 4, rule = 1) {
        super();
        this.numerator = numerator;
        this.denominator = denominator;
        this.gap = gap;
        this.rule = rule;

        this.lineElement = null;
        this.color = "black";
    }

    layout(ctx) {
        this.numerator.layout(ctx);
        this.denominator.layout(ctx);

        this.width = Math.max(
            this.numerator.width,
            this.denominator.width
        ) + 4;

        this.height =
            this.numerator.height +
            this.numerator.depth +
            this.gap +
            this.rule;

        this.depth =
            this.denominator.height +
            this.denominator.depth +
            this.gap;
    }

    render(svg, x, baselineY) {
        const centerX = x + this.width / 2;

        const numX = centerX - this.numerator.width / 2;
        const numY = baselineY - this.gap - this.rule;

        this.numerator.render(svg, numX, numY);

        this.lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.lineElement.setAttribute("x1", x);
        this.lineElement.setAttribute("x2", x + this.width);
        this.lineElement.setAttribute("y1", baselineY);
        this.lineElement.setAttribute("y2", baselineY);
        this.lineElement.setAttribute("stroke", this.color);
        this.lineElement.setAttribute("stroke-width", this.rule);
        svg.appendChild(this.lineElement);

        const denX = centerX - this.denominator.width / 2;
        const denY = baselineY + this.gap + this.denominator.height;

        this.denominator.render(svg, denX, denY);
    }
    
    setColor(color) {
        this.color = color;
        if (this.lineElement) {
            this.lineElement.setAttribute("stroke", color);
        }
    }
}

class ScaledBox extends Box {
    constructor(inner, scale) {
        super();
        this.inner = inner;
        this.scaleFactor = scale;
    }

    layout(ctx) {
        this.inner.layout(ctx);

        this.width = this.inner.width * this.scaleFactor;
        this.height = this.inner.height * this.scaleFactor;
        this.depth = this.inner.depth * this.scaleFactor;
    }

    render(svg, x, baselineY) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform",
            `translate(${x},${baselineY}) scale(${this.scaleFactor})`
        );

        this.inner.render(group, 0, 0);
        svg.appendChild(group);
    }
}

class OperatorBox extends Box {
    constructor(symbol, fontSize = 16, spacing = 6) {
        super();
        this.symbol = symbol;
        this.fontSize = fontSize;
        this.spacing = spacing;
        this.textBox = new TextBox(symbol, fontSize);
    }

    layout(ctx) {
        this.textBox.layout(ctx);

        this.width = this.textBox.width + this.spacing * 2;
        this.height = this.textBox.height;
        this.depth = this.textBox.depth;
    }

    render(svg, x, baselineY) {
        this.textBox.render(svg, x + this.spacing, baselineY);
    }

    setColor(color) {
        this.textBox.setColor(color);
    }
}

class ParenthesisBox extends Box {
    constructor(inner) {
        super();
        this.inner = inner;
        this.left = new TextBox("(");
        this.right = new TextBox(")");
    }

    layout(ctx) {
        this.inner.layout(ctx);
        this.left.layout(ctx);
        this.right.layout(ctx);

        this.width = this.left.width + this.inner.width + this.right.width;
        this.height = Math.max(this.left.height, this.inner.height, this.right.height);
        this.depth = Math.max(this.left.depth, this.inner.depth, this.right.depth);
    }

    render(svg, x, baselineY) {
        this.left.render(svg, x, baselineY);
        this.inner.render(svg, x + this.left.width, baselineY);
        this.right.render(svg, x + this.left.width + this.inner.width, baselineY);
    }

    setColor(color) {
        this.left.setColor(color);
        this.right.setColor(color);
    }
}





class InteractiveBox extends Box {

    constructor(inner, node, controller, nodeContentElements, colors = {}) {
        super();
        this.inner = inner;
        this.node = node;
        this.controller = controller;
        this.nodeContentElements = nodeContentElements;
        this.childrenElements = [];

        this.colors = Object.assign({
            defaultStroke: "transparent",
            defaultBG: "transparent",
            defaultFG: "rgb(197, 197, 197)",
            selectableStroke: "transparent",
            selectableBG: "transparent",
            selectableFG: "rgb(0, 0, 0)",
            selectedStroke: "rgb(195, 255, 200)",
            selectedBG: "rgba(0, 255, 21, 0.08)",
            selectedFG: "rgb(0, 220, 29)",
            hoverStroke: "transparent",
            hoverBG: "rgba(84, 5, 255, 0.04)",
            hoverFG: "rgb(0, 26, 255)",
            highlightedStroke: "rgb(251, 255, 0)",
            highlightedBG: "rgb(253, 255, 205)",
            highlightedFG: "rgb(255, 136, 0)"
        }, colors);

        this.hovered = false;

        this.controller.register(node, this);
    }

    layout(ctx) {
        this.inner.layout(ctx);
        this.width = this.inner.width;
        this.height = this.inner.height;
        this.depth = this.inner.depth;
    }

    render(svg, x, baselineY) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("pointer-events", "none");

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", baselineY - this.height);
        rect.setAttribute("width", this.width);
        rect.setAttribute("height", this.height + this.depth);
        rect.setAttribute("rx", 3);
        rect.setAttribute("ry", 3);
        rect.setAttribute("fill", "transparent");
        rect.setAttribute("stroke", "none");
        rect.setAttribute("pointer-events", "all");
        rect.style.cursor = "pointer";

        rect.addEventListener("mouseenter", () => {
            this.hovered = true;
            this.updateVisual();
        });

        rect.addEventListener("mouseleave", () => {
            this.hovered = false;
            this.updateVisual();
        });

        rect.addEventListener("click", (e) => {
            e.stopPropagation();
            this.controller.click(this.node);
        });

        svg.appendChild(rect);
        this.inner.render(group, x, baselineY);
        svg.appendChild(group);

        this._rect = rect;
        this.updateVisual();
    }

    setColor(color) {
        this.colors.defaultFG = color;
        this.updateVisual();
    }

 // -------- Farben dynamisch setzen --------
    setSelectedColor(stroke, bg, fg) {
        this.colors.selectedStroke = stroke ?? this.colors.selectedStroke;
        this.colors.selectedBG = bg ?? this.colors.selectedBG;
        this.colors.selectedFG = fg ?? this.colors.selectedFG;
        this.updateVisual();
    }

    setHoverColor(stroke, bg, fg) {
        this.colors.hoverStroke = stroke ?? this.colors.hoverStroke;
        this.colors.hoverBG = bg ?? this.colors.hoverBG;
        this.colors.hoverFG = fg ?? this.colors.hoverFG;
        this.updateVisual();
    }

    setHighlightedColor(stroke, bg, fg) {
        this.colors.highlightedStroke = stroke ?? this.colors.highlightedStroke;
        this.colors.highlightedBG = bg ?? this.colors.highlightedBG;
        this.colors.highlightedFG = fg ?? this.colors.highlightedFG;
        this.updateVisual();
    }

    setSelectableColor(stroke, bg, fg) {
        this.colors.selectableStroke = stroke ?? this.colors.selectableStroke;
        this.colors.selectableBG = bg ?? this.colors.selectableBG;
        this.colors.selectableFG = fg ?? this.colors.selectableFG;
        this.updateVisual();
    }

    updateVisual() {
        const state = this.controller.getState(this.node);
        if (!state) return;

        let stroke = this.colors.defaultStroke;
        let bg = this.colors.defaultBG;
        let fg = this.colors.defaultFG;

        if (state.selected) {
            stroke = this.colors.selectedStroke;
            bg = this.colors.selectedBG;
            fg = this.colors.selectedFG;
        } else if (state.highlighted) {
            stroke = this.colors.highlightedStroke;
            bg = this.colors.highlightedBG;
            fg = this.colors.highlightedFG;
        } else if (this.hovered && state.selectable) {
            stroke = this.colors.hoverStroke;
            bg = this.colors.hoverBG;
            fg = this.colors.hoverFG;
        } else if (state.selectable) {
            stroke = this.colors.selectableStroke;
            bg = this.colors.selectableBG;
            fg = this.colors.selectableFG;
        }

        this._rect.setAttribute("stroke", stroke);
        this._rect.setAttribute("fill", bg);
        this._rect.setAttribute("stroke-width", (state.selected || state.highlighted) ? 2 : 1);

        for (const elem of this.nodeContentElements) {
            elem.setColor(fg);
        }
    }
}