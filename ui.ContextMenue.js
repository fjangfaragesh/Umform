


Umform.ContextMenu = class {
    constructor() {
        this.container = document.createElement("div");

        this.container.style.position = "fixed";
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = 10000;
        this.container.style.display = "none";

        document.body.appendChild(this.container);

        this.items = [];
    }

    clear() {
        this.items = [];
        this.container.innerHTML = "";
    }

    addItem(content,{onclick=null, onmouseover=null, onmouseleave=null, oncontextmenu=null},x,y,width="",height="") {
        const btn = document.createElement("div");
        //btn.style.backgroundColor = "white";
        //btn.style.outline = "1px solid black";
        btn.style.position = "absolute";
        btn.style.pointerEvents = "auto";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = `${width}px`;
        btn.style.height = `${height}px`;
        btn.style.overflow = "hidden";
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (onclick) {
                let keepOpen = onclick(e);
                if (!keepOpen) this.hide();
            } else {
                this.hide();
            }
        });
        if (onmouseover) {
                btn.addEventListener("mouseover", (e) => {
                onmouseover(e);
            });
        }
        if (onmouseleave) {
                btn.addEventListener("mouseleave", (e) => {
                onmouseleave(e);
            });
        }
        if (oncontextmenu) {
                btn.addEventListener("contextmenu", (e) => {
                oncontextmenu(e);
            });
        }
        btn.appendChild(content);
        this.items.push(btn);
        this.container.appendChild(btn);
    }

    show(x, y) {
        this.container.style.left = x + "px";
        this.container.style.top = y + "px";

        this.container.style.display = "block";

        setTimeout(() => {
            window.addEventListener("click", this._outsideHandler);
        });
    }

    hide() {
        this.container.style.display = "none";
        window.removeEventListener("click", this._outsideHandler);
    }

    _outsideHandler = () => this.hide();
}


Umform.PyramidContextMenu = class extends Umform.ContextMenu {
    constructor(gridSize, gap) {
        super();
        this.gridSize = gridSize;
        this.gap = gap ?? this.gridSize*0.1;
    }

    addItem(content, {onclick=null, onmouseover=null, onmouseleave=null, oncontextmenu=null}, side, index) {
        let row = Math.floor(Math.sqrt(index));
        let column = (index - row**2) - row;
        let xPyramid = column*this.gridSize - 0.5*this.gridSize;
        let yPyramid = row*this.gridSize + this.gridSize;
        let x,y;
        switch (side) {
            case "top":
                x = xPyramid + 0.5*this.gap;
                y = -yPyramid - this.gridSize + 0.5*this.gap;
                break;
            case "bottom":
                x = -xPyramid - this.gridSize + 0.5*this.gap;
                y = yPyramid + 0.5*this.gap;
                break;
            case "left":
                x = -yPyramid - this.gridSize + 0.5*this.gap;
                y = -xPyramid - this.gridSize + 0.5*this.gap;
                break;
            case "right":
                x = yPyramid + 0.5*this.gap;
                y = xPyramid + 0.5*this.gap;
                break;
            case "center":
                x = -this.gridSize/2 + 0.5*this.gap;
                y = -this.gridSize/2 + 0.5*this.gap;
                break;
        }
        super.addItem(content,{onclick, onmouseover, onmouseleave, oncontextmenu},x,y,this.gridSize-this.gap, this.gridSize-this.gap);
    }

}