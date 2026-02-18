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
}

class TextBox extends Box {
    constructor(text, fontSize = 16, fontFamily = "serif") {
        super();
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
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
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", baselineY);
        text.setAttribute("font-size", this.fontSize);
        text.setAttribute("font-family", this.fontFamily);
        text.setAttribute("dominant-baseline", "alphabetic");
        text.textContent = this.text;

        svg.appendChild(text);
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

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("x2", x + this.width);
        line.setAttribute("y1", baselineY);
        line.setAttribute("y2", baselineY);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", this.rule);
        svg.appendChild(line);

        const denX = centerX - this.denominator.width / 2;
        const denY = baselineY + this.gap + this.denominator.height;

        this.denominator.render(svg, denX, denY);
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
        const centerX = x + this.width / 2;

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", centerX);
        text.setAttribute("y", baselineY);
        text.setAttribute("font-size", this.fontSize);
        text.setAttribute("font-family", "serif");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "alphabetic");
        text.textContent = this.symbol;

        svg.appendChild(text);
    }
}

class ClickableBox extends Box {

    constructor(inner, node, controller, nodeContentElements, colors = {}) {
        super();
        this.inner = inner;
        this.node = node;
        this.controller = controller;
        //this.nodeContentElements = nodeContentElements;
        this.childrenElements = [];

        this.colors = Object.assign({
            selectedStroke: "red",
            selectedFill: "rgba(255,0,0,0.08)",
            hoverStroke: "rgba(0,0,0,0.4)",
            hoverFill: "rgba(0,0,0,0.04)",
            highlightedStroke: "orange",
            highlightedFill: "rgba(255,165,0,0.1)"
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
    }

 // -------- Farben dynamisch setzen --------
    setSelectedColor(stroke, fill) {
        this.colors.selectedStroke = stroke ?? this.colors.selectedStroke;
        this.colors.selectedFill = fill ?? this.colors.selectedFill;
        this.updateVisual();
    }

    setHoverColor(stroke, fill) {
        this.colors.hoverStroke = stroke ?? this.colors.hoverStroke;
        this.colors.hoverFill = fill ?? this.colors.hoverFill;
        this.updateVisual();
    }

    setHighlightedColor(stroke, fill) {
        this.colors.highlightedStroke = stroke ?? this.colors.highlightedStroke;
        this.colors.highlightedFill = fill ?? this.colors.highlightedFill;
        this.updateVisual();
    }

    updateVisual() {
        const state = this.controller.getState(this.node);
        if (!state) return;

        let stroke = "none";
        let fill = "transparent";

        if (state.selected) {
            stroke = this.colors.selectedStroke;
            fill = this.colors.selectedFill;
        } else if (state.highlighted) {
            stroke = this.colors.highlightedStroke;
            fill = this.colors.highlightedFill;
        } else if (this.hovered && state.selectable) {
            stroke = this.colors.hoverStroke;
            fill = this.colors.hoverFill;
        }

        this._rect.setAttribute("stroke", stroke);
        this._rect.setAttribute("fill", fill);
        this._rect.setAttribute("stroke-width", (state.selected || state.highlighted) ? 2 : 1);
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
}

