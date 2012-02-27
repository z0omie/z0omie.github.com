function Graph(selector, config) {

    this.config = config;
    this.canvas = document.querySelector(selector);
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.context = this.canvas.getContext("2d");
};

Graph.prototype.initField = function (config) {

    this.minX = config.axisX.min;
    this.minY = config.axisY.min;
    this.maxX = config.axisX.max;
    this.maxY = config.axisY.max;
    this.config = config;
    this.data = config.data;
    this.absoluteLeft = 20;
    this.absoluteRight = this.canvas.width - this.absoluteLeft - 40;
    this.absoluteTop = 20;
    this.absoluteBottom = this.canvas.height - this.absoluteTop - 10;


    this.axisColor = "#ccc";
    // stretch grid to fit the canvas window, and invert the y scale so that that increments
    this.scaleX = (this.absoluteRight - this.absoluteLeft) / (this.maxX - this.minX);
    this.scaleY = (this.absoluteBottom - this.absoluteTop) / (this.maxY - this.minY);

    this.drawXAxis();
};

Graph.prototype.drawXAxis = function () {
    var context = this.context;
    context.beginPath();
    context.moveTo(this.absoluteLeft, this.absoluteBottom);
    context.lineTo(this.absoluteRight, this.absoluteBottom);
    context.strokeStyle = this.axisColor;
    context.lineWidth = 2;
    context.stroke();

    var xInterval = (this.absoluteRight - this.absoluteLeft) / (this.config.axisX.points.length - 1);
    var i = 0;
    context.font = "15px Calibri";
    context.textAlign = "center";
    context.fillStyle = "#999";
    context.strokeStyle = this.axisColor;
    context.lineWidth = 1;
    for (var n = this.absoluteLeft; n <= this.absoluteRight; n += xInterval) {
        //tick
        context.beginPath();
        context.moveTo(n, this.absoluteBottom - 2);
        context.lineTo(n, this.absoluteBottom + 3);

        context.stroke();

        //text
        context.fillText(this.config.axisX.points[i], n, this.absoluteBottom + 20);
        i++;
    }

    //right numbers
    var yInterval = (this.absoluteBottom - this.absoluteTop) / (this.config.axisY.points.length - 1);
    i = 0;
    context.lineWidth = 1;
    context.strokeStyle = "#9CE3FF";
    context.font = "15px Calibri";
    context.textAlign = "center";
    context.fillStyle = "#37B0E4";
    for (n = this.absoluteBottom - yInterval; n >= 0; n -= yInterval) {
        context.dashedLineFinished(context, this.absoluteLeft, n, this.absoluteRight, n, [1, 1]);
        context.fillText(this.config.axisY.points[i + 1], 5, n);
        i++;
    }

    context.font = "15px Calibri";
    context.textAlign = "center";
    context.fillStyle = "#999";
    for (n = 0; n < this.config.axisY.points2.length; n++) {
        context.fillText(this.config.axisY.points2[n].lbl, this.absoluteRight + 20, this.yToAbs(this.config.axisY.points2[n].val));
    }
};

Graph.prototype.drawGraph = function (points, color) {

    this.context.save();

    this.transformContext();

    this.context.beginPath();
    this.context.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        this.context.lineTo(points[i].x, points[i].y);
    }

    this.context.restore();

    var context = this.context;


    context.lineWidth = 2.3;
    context.strokeStyle = color;
    context.stroke();

    for (i = 0; i < points.length; i++) {
        var aX = this.xToAbs(points[i].x);
        var aY = this.yToAbs(points[i].y);

        //drawing circles
        context.beginPath();
        context.fillStyle = color;
        context.arc(aX, aY, 5.5, 0, Math.PI * 2, true);
        context.fill();

        context.beginPath();
        context.fillStyle = "#fff";
        context.arc(aX, aY, 3.3, 0, Math.PI * 2, true);
        context.fill();

        //drawing frames on the top of each point
        var boxW = 44;
        var boxH = 33;
        context.beginPath();
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowColor = color;
        context.shadowBlur = 2;

        var xStart = aX;
        var yStart = aY - 12;
        context.moveTo(xStart, yStart);
        xStart += 19;
        yStart -= 10;
        context.lineTo(xStart, yStart);
        xStart += 3;
        context.lineTo(xStart, yStart);
        yStart -= boxH;
        context.lineTo(xStart, yStart);
        xStart -= boxW;
        context.lineTo(xStart, yStart);
        yStart += boxH;
        context.lineTo(xStart, yStart);
        xStart += 3;
        context.lineTo(xStart, yStart);
        xStart += 19;
        yStart += 10;
        context.lineTo(xStart, yStart);


        context.lineWidth = 1;
        context.strokeStyle = color;
        context.stroke();

        context.shadowBlur = 0;
        //filling gradient
        var grd = context.createLinearGradient(aX, aY + 35, aX, aY - 40);
        grd.addColorStop(0, color);
        grd.addColorStop(1, "#FFFFFF");
        context.fillStyle = grd;
        context.fill();

        //text in frame
        context.font = "normal bold 13px Verdana";
        context.textAlign = "center";
        context.fillStyle = "#000000";
        var t = ("" + points[i].y).replace(".", ",");
        context.fillText(t, aX, aY - 38);
        context.font = "11px Verdana";
        context.textAlign = "right";
        context.fillText(points[i].percent, aX + 2, aY - 23);
        context.font = "9px Verdana";
        context.textAlign = "left";
        context.fillText("%", aX + 2, aY - 23);
        context.textAlign = "center";


        //falling line
        context.strokeStyle = "#B2B2B2";
        context.lineWidth = 1;
        context.dashedLineFinished(context, aX, this.absoluteBottom - 30, aX, aY + 10, [1, 1]);

        context.font = "11px Verdana";
        context.fillText(points[i].x, aX, this.absoluteBottom - 15);

        context.dashedLineFinished(context, aX, this.absoluteBottom - 10, aX, this.absoluteBottom, [1, 1]);
    }
};

Graph.prototype.yToAbs = function (y) {
    return -(y * this.scaleY) + this.absoluteBottom;
};

Graph.prototype.xToAbs = function (x) {
    return ((x - this.minX) * this.scaleX) + this.absoluteLeft;
};

Graph.prototype.drawData = function (id) {
    this.clearGraph();
    for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].id == id) {
            this.drawGraph(this.data[i].points, this.data[i].color);
            break;
        };
    }
};

Graph.prototype.clearGraph = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initField(this.config);
};

Graph.prototype.transformContext = function () {

    this.context.translate(this.absoluteLeft + ((-this.minX) * this.scaleX), this.absoluteBottom);

    this.context.scale(this.scaleX, -this.scaleY);
};