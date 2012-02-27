
CanvasRenderingContext2D.prototype.dashedLineFinished = function (context, fromX, fromY, toX, toY, pattern) {
    context.beginPath();
    context.dashedLine(fromX, fromY, toX, toY, pattern);
    context.stroke();
};

CanvasRenderingContext2D.prototype.dashedLine = function (fromX, fromY, toX, toY, pattern) {

    function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16); }
    function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16); }
    function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16); }
    function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h; }

    var id1 = this.createImageData(1, 1);
    var ds = id1.data;
    ds[0] = hexToR(this.strokeStyle);
    ds[1] = hexToG(this.strokeStyle);
    ds[2] = hexToB(this.strokeStyle);
    ds[3] = 255;

    var lt = function (a, b) { return a <= b; };
    var gt = function (a, b) { return a >= b; };
    var capmin = function (a, b) { return Math.min(a, b); };
    var capmax = function (a, b) { return Math.max(a, b); };

    var checkX = { thereYet: gt, cap: capmin };
    var checkY = { thereYet: gt, cap: capmin };

    if (fromY - toY > 0) {
        checkY.thereYet = lt;
        checkY.cap = capmax;
    }
    if (fromX - toX > 0) {
        checkX.thereYet = lt;
        checkX.cap = capmax;
    }

    this.moveTo(fromX, fromY);
    var offsetX = fromX;
    var offsetY = fromY;
    var idx = 0, dash = true;
    while (!(checkX.thereYet(offsetX, toX) && checkY.thereYet(offsetY, toY))) {
        var ang = Math.atan2(toY - fromY, toX - fromX);
        var len = pattern[idx];

        offsetX = checkX.cap(toX, offsetX + (Math.cos(ang) * len));
        offsetY = checkY.cap(toY, offsetY + (Math.sin(ang) * len));

        if (dash) this.putImageData(id1, offsetX, offsetY);

        idx = (idx + 1) % pattern.length;
        dash = !dash;
    }
};