Umform.ExprViewer = class {
    constructor(exprNodeUI, width = 600, height = 400) {
        this.exprNodeUI = exprNodeUI;

        this.width = width;
        this.height = height;

        // SVG Setup
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", width);
        this.svg.setAttribute("height", height);
        this.svg.style.border = "1px solid #aaa";
        this.svg.style.background = "#fff";
        this.svg.style.overflow = "hidden";

        // Container-G für transform (Zoom & Pan)
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.container);

        this.container.appendChild(exprNodeUI.element);

        // Zoom & Pan state
        this.scale = 5;
        this.offsetX = 0;
        this.offsetY = 100;

        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.offsetStart = { x: 0, y: 0 };

        this.updateTransform();
        this.attachEvents();
    }

    get element() {
        return this.svg;
    }

    setExprNodeUI(exprNodeUI) {
        this.exprNodeUI = exprNodeUI;
        this.container.innerHTML = "";
        this.container.appendChild(exprNodeUI.element);
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.svg.setAttribute("width", width);
        this.svg.setAttribute("height", height);
    }

    updateTransform() {
        this.container.setAttribute(
            "transform",
            `translate(${this.offsetX},${this.offsetY}) scale(${this.scale})`
        );
    }

    attachEvents() {
        // Zoom mit Mausrad
        this.svg.addEventListener("wheel", (e) => {
            e.preventDefault();

            const delta = -e.deltaY; // normales Mausrad
            const zoomFactor = 1.1;

            const rect = this.svg.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            let scaleFactor = delta > 0 ? zoomFactor : 1 / zoomFactor;

            // Zoom um Mauszeiger
            this.offsetX = cx - scaleFactor * (cx - this.offsetX);
            this.offsetY = cy - scaleFactor * (cy - this.offsetY);
            this.scale *= scaleFactor;

            this.updateTransform();
        });

        // Pan mit mittlerer Maustaste
        this.svg.addEventListener("mousedown", (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                this.isPanning = true;
                this.panStart = { x: e.clientX, y: e.clientY };
                this.offsetStart = { x: this.offsetX, y: this.offsetY };
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.panStart.x;
                const dy = e.clientY - this.panStart.y;

                this.offsetX = this.offsetStart.x + dx;
                this.offsetY = this.offsetStart.y + dy;
                this.updateTransform();
            }
        });

        window.addEventListener("mouseup", (e) => {
            this.isPanning = false;
        });
    }
}
