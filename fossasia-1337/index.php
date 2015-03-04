<html>
<head>
<title>Minhaz's game</title>
<script src="js/jquery.js"></script><script src="js/jquery-ui.js"></script>
<body style="margin:0px;padding:0px;height: 100%;overflow: hidden;text-align: center;padding-top:10px">
<h2>The Best Game</h2>
<canvas id="myCanvas" width="600" height="500" style="border: 1px solid black;margin-left: 0%"></canvas>
<br>
<iframe src="inner.html" style=""></iframe>
<script>
    var canvas = document.getElementById('myCanvas'); 
    var ctx = canvas.getContext("2d");
    var v = 15;
    var dv = 0.01;
    var BASE_AT_Y = 250;

    

    // ------------------------------------------------------------
    // the player
    // ------------------------------------------------------------
    var _player = function() {
    	this.x = 10;
        this.y = 0;
    	this.height = 20;
    	this.width = 10;
        this.color = '#333';
    	this.gravity = -3;
        this.vel = 0;
        this.is_on_jump = false;
        this.motion = true;
        this.legs_height = 20;
    	this.Plot();

        this.start_vel = 15;

        this.count = 0;
        this.countMax = 5;

        this.headRadius = 5;
    }
    _player.prototype.Plot = function() {
    	ctx.beginPath();
    	ctx.moveTo(this.x, BASE_AT_Y);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, BASE_AT_Y - this.height - this.y - this.legs_height, this.width, this.height);
        ctx.moveTo(this.x + this.width / 2, BASE_AT_Y - this.height - this.y - this.legs_height - this.headRadius);
        ctx.arc(this.x + this.width / 2, BASE_AT_Y - this.height - this.y - this.legs_height - this.headRadius, this.headRadius, 2 * 3.1417, 0);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 4;

        if (this.motion) {
            if (this.count == this.countMax) {
                this.count = 0;
                this.motion = false;
            } else this.count++;

            ctx.moveTo(this.x + this.width / 2, BASE_AT_Y  - this.y - this.legs_height);
            ctx.lineTo(this.x + this.width / 2 + 5, BASE_AT_Y - this.y - this.legs_height / 2);
            ctx.lineTo(this.x + this.width / 2 + 3, BASE_AT_Y - this.y);

            ctx.moveTo(this.x + this.width / 2, BASE_AT_Y - this.y - this.legs_height);
            ctx.lineTo(this.x + this.width / 2 - 2, BASE_AT_Y - this.y - this.legs_height / 2);
            ctx.lineTo(this.x + this.width / 2 - 10, BASE_AT_Y - this.y - 5);
        } else {
            if (this.count == this.countMax) {
                this.count = 0;
                this.motion = true;
            } else this.count++;

            ctx.moveTo(this.x + this.width / 2, BASE_AT_Y - this.y - this.legs_height);
            ctx.lineTo(this.x + this.width / 2 + 1, BASE_AT_Y - this.y - this.legs_height / 2);
            ctx.lineTo(this.x + this.width / 2 - 3, BASE_AT_Y - this.y);

            ctx.moveTo(this.x + this.width / 2, BASE_AT_Y - this.y - this.legs_height);
            ctx.lineTo(this.x + this.width / 2 + 10, BASE_AT_Y - this.y - this.legs_height / 2);
            ctx.lineTo(this.x + this.width / 2 + 7, BASE_AT_Y - this.y - 4);
        }

    	ctx.stroke();
        ctx.lineWidth = 1;
    }

    _player.prototype.setVelocity = function(fps) {
        this.vel += this.gravity * (fps / 100);
    }
    _player.prototype.setYCoord = function(dt) {
        this.y += this.vel * (dt / 50);
    }
    
    _player.prototype.registerJump = function(fps) {
        this.is_on_jump = true;
        this.vel = this.start_vel;
        this.Jump(fps);
    }

    _player.prototype.Jump = function(fps) {
        this.setYCoord(fps);
        this.setVelocity(fps);
        if (this.y < 0) {
            this.y = 0;
            this.is_on_jump = false;
        } else {
            var $this = this;
            setTimeout(function() {
                $this.Jump(fps);
            }, fps);
        }
    }

    // ------------------------------------------------------------
    // the obstacles
    // ------------------------------------------------------------
    var obstacles = function(d) {
        this.width = 6;
        this.color = 'rgba(10, 171, 10, 0.74)';
        this.x = canvas.width + d;
        this.height = Math.round(Math.random() * 500) % 50;

        if (this.height < 3) this.height = 15;
    }
    obstacles.prototype.Plot = function() {
        ctx.beginPath();
        ctx.moveTo(this.x, BASE_AT_Y);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, BASE_AT_Y - this.height, this.width, this.height);
        ctx.stroke();
    }
    obstacles.prototype.move = function(fps) {
        this.x -= v * (fps / 200);
        if (this.x < 0) {
            delete this;
            return false;
        }
        return true;
    }

    // ------------------------------------------------------------
    // the cloud
    // ------------------------------------------------------------
    var cloud = function(d) {
        this.width = 30;
        this.color = 'rgba(19, 146, 176, 0.59)';
        this.x = canvas.width + d;
        this.height = Math.round(Math.random() * 500) % 20;
        this.y = this.height + d;
        this.base_height_diff = 150;
        if (this.height < 3) this.height = 10;
    }
    cloud.prototype.Plot = function() {
        ctx.beginPath();
        ctx.moveTo(this.x, BASE_AT_Y);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, BASE_AT_Y - this.base_height_diff - this.height - this.y, this.width, this.height);
        ctx.stroke();
    }
    cloud.prototype.move = function(fps) {
        this.x -= v * (fps / 500);
        if (this.x < -1 * this.width) {
            delete this;
            return false;
        }
        return true;
    }

    // ------------------------------------------------------------
    // the dirt
    // ------------------------------------------------------------
    var dirt = function(d) {
        this.width = Math.round(Math.random() * 500) % 7;
        this.width = (this.width < 3) ? 3 : this.width;

        this.color = 'brown';
        this.x = canvas.width + (d * 5);
        this.height = -1;
        this.y = -1 * (this.height + d);
        this.base_height_diff = -30;
    }
    dirt.prototype.Plot = function() {
        ctx.beginPath();
        ctx.moveTo(this.x, BASE_AT_Y);
        ctx.strokeStyle = this.color;
        ctx.rect(this.x, BASE_AT_Y - this.base_height_diff - this.height - this.y, this.width, this.height);
        ctx.stroke();
    }
    dirt.prototype.move = function(fps) {
        this.x -= v * (fps / 200);
        if (this.x < -1 * this.width) {
            delete this;
            return false;
        }
        return true;
    }

    var frame = function() {
        var $this = this;
        this.score = 0;

        this.timestamp = 0;
        this.fps = 40;
        this.obj = new _player();
        // Register jump listener for this player
        document.onkeypress = function(e) {
            if ($this.obj.is_on_jump) return;
            if (e.which == 32)
                $this.obj.registerJump($this.fps);
        };

        this.obstacleQueue = [];
        for(i = 0; i < 100; i++) this.obstacleQueue[i] = -1;
        this.lastObstaclesPrinted = 0;
        this.time_between_obstacles = 3000;

        this.cloudQueue = [];
        for(i = 0; i < 100; i++) this.cloudQueue[i] = -1;
        this.lastCloudPrinted = 0;
        this.time_between_cloud = 4000;

        this.dirtQueue = [];
        for(i = 0; i < 100; i++) this.dirtQueue[i] = -1;
        this.lastDirtPrinted = 0;
        this.time_between_dirt = 1500;

        this.next();

        this.stop = false;
    }

    frame.prototype.Plot = function() {
        // Plot the base line
        ctx.beginPath();
        // Ground
        ctx.fillStyle = 'rgba(131, 103, 103, 0.34)';
        ctx.fillRect(0, BASE_AT_Y, canvas.width, canvas.height - BASE_AT_Y);
        ctx.stroke();

        // Sky
        ctx.fillStyle = 'rgba(164, 219, 239, 0.62)';
        ctx.fillRect(0, 0, canvas.width, BASE_AT_Y);
        ctx.stroke();

        ctx.moveTo(0, BASE_AT_Y);
        ctx.strokeStyle = '#333';
        ctx.lineTo(canvas.width, BASE_AT_Y);
        ctx.stroke();

        // Plot the player first
        this.obj.Plot();

        //Plot the obstacle
        for(j = 0; j < this.obstacleQueue.length; j++) {
            if (this.obstacleQueue[j] != -1) {
                if (!this.obstacleQueue[j].move(this.fps)) this.obstacleQueue[j] = -1;
                else {
                    this.obstacleQueue[j].Plot();
                }
            }
        }

        for(j = 0; j < this.cloudQueue.length; j++) {
            if (this.cloudQueue[j] != -1) {
                if (!this.cloudQueue[j].move(this.fps)) this.cloudQueue[j] = -1;
                else {
                    this.cloudQueue[j].Plot();
                }
            }
        }

        for(j = 0; j < this.dirtQueue.length; j++) {
            if (this.dirtQueue[j] != -1) {
                if (!this.dirtQueue[j].move(this.fps)) this.dirtQueue[j] = -1;
                else {
                    this.dirtQueue[j].Plot();
                }
            }
        }

        this.printScore();
        if (this.checkCollision()) {
            this.stop = true;
        }
    }

    frame.prototype.Clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    frame.prototype.printScore = function() {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.font="16px Georgia";
        ctx.fillText("score: " +Math.round(this.score),canvas.width -120,20);
    }

    frame.prototype.next = function() {
        if (this.stop) {
            return true;
        }
        v += dv;
        this.timestamp += this.fps;
        this.score = this.timestamp / 1000;
        var $this = this;

        // Check if this is a perfect time to print an obstacle
        if (this.timestamp > this.lastObstaclesPrinted + this.time_between_obstacles) {
            var count = Math.round(Math.random() * 1000) % 4;
            for(i = 0; i < count; i++) {
                var t = new obstacles(i*10);
                for(j = 0; j < this.obstacleQueue.length; j++) {
                    if (this.obstacleQueue[j] == -1) {
                        this.obstacleQueue[j] = t;
                        break;
                    }
                }
            }
            this.lastObstaclesPrinted = this.timestamp;
        }

        // Check if this is a perfect time to print a cloud
        if (this.timestamp > this.lastCloudPrinted + this.time_between_cloud) {
            var count = Math.round(Math.random() * 1000) % 3;
            if (count < 1) count = 1;
            for(i = 0; i < count; i++) {
                var t = new cloud(i*10);
                for(j = 0; j < this.cloudQueue.length; j++) {
                    if (this.cloudQueue[j] == -1) {
                        this.cloudQueue[j] = t;
                        break;
                    }
                }
            }
            this.lastCloudPrinted = this.timestamp;
        }

        // Check if this is a perfect time to print dirt
        if (this.timestamp > this.lastDirtPrinted + this.time_between_dirt) {
            var count = Math.round(Math.random() * 10000) % 4;
            if (count < 1) count = 1;
            for(i = 0; i < count; i++) {
                var t = new dirt(i*10);
                for(j = 0; j < this.dirtQueue.length; j++) {
                    if (this.dirtQueue[j] == -1) {
                        this.dirtQueue[j] = t;
                        break;
                    }
                }
            }
            this.lastDirtPrinted = this.timestamp;
        }
        setTimeout(function() {
            $this.Clear();
            $this.Plot();
            $this.next();
        }, this.fps);
    }

    // true means collision
    frame.prototype.checkCollision = function() {
        var plyr = this.obj;
        for(j = 0; j < this.obstacleQueue.length; j++) {
            if (this.obstacleQueue[j] != -1) {
                var obj = this.obstacleQueue[j];

                var obx = obj.x;
                var otx = obj.x + obj.width;
                var oby = BASE_AT_Y;

                var pbx = plyr.x;
                var pby = BASE_AT_Y - plyr.y;
                var ptx = plyr.width;

                // Check intersection
                if (ptx > obx && ptx < otx && pby < obj.height) return true;
                if (pbx > obx && pbx < otx && pby < obj.height) return true;
            }
        }
    }

    new frame();

    
</script>
    
</body>
</head>
</html>