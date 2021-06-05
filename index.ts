const w : number = window.innerWidth 
const h : number = window.innerHeight
const parts : number = 4  
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const sizeFactor : number = 6.9 
const eyeFactor : number = 15.9 
const delay : number = 20 
const colors : Array<string> = [
    "#f44336",
    "#673AB7",
    "#64DD17",
    "#FFD600",
    "#01579B"
]
const backColor : string = "#BDBDBD"

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n))
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static translateDraw(context : CanvasRenderingContext2D, x : number, y : number, cb : Function) {
        context.save()
        context.translate(x, y)
        cb(context)
        context.restore()
    }

    static drawSquareFaceBox(context : CanvasRenderingContext2D, scale : number) {
        const size : number = Math.min(w, h) / sizeFactor 
        const eyeR : number = Math.min(w, h) / eyeFactor 
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, parts)
        const sf4 : number = ScaleUtil.divideScale(sf, 3, parts)
        const color : string | CanvasGradient | CanvasPattern = context.fillStyle 
        DrawingUtil.translateDraw(context, w / 2, h / 2, (ctx : CanvasRenderingContext2D) => {
            DrawingUtil.translateDraw(ctx, -(w / 2 + size / 2) * (1 - sf1), 0, (ctx1 : CanvasRenderingContext2D) => {
                ctx1.fillStyle = color 
                ctx1.fillRect(-size / 2, -size / 2, size, size)
            })
            DrawingUtil.translateDraw(ctx, (w / 2 + size / 2) * (1 - sf2), size / 4, (ctx1 : CanvasRenderingContext2D) => {
                DrawingUtil.drawLine(ctx1, -size / 2, 0, size / 2, 0)
            })

            for (var j = 0; j < 2 ; j++) {
                DrawingUtil.drawCircle(ctx, (size / 4) * (1 - 2 * j) * sf4, -size / 4, eyeR * sf3)
            }
        })
    }
    
    static drawSFBLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        DrawingUtil.drawSquareFaceBox(context, scale)
    }
}

class Stage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {
    
    animated : boolean = false 
    interval : number 
    
    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}