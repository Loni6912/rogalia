/* global fetch, m4, game, CELL_SIZE, Point, Image, Settings, T */

"use strict";

class WebglRenderer {
    constructor() {
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
        this._loaded = false;
        this.width = 64;
        this.height = 64;
        this.minimap = new Uint8Array(this.width * this.height * 4);
    }

    handleContextError(error) {
        game.popup.alert(T("GPU error occured. Falling back to a soft renderer."), () => {
            Settings.toggle("settings.graphics.gpuRender");
            game.reload();
        });
        game.sendError(`Webgl: ${error.message}`);
    }

    async load(data, width, height) {
        const {gl} = this;
        if (!gl) {
            this.handleContextError(new Error("Cannot get webgl context"));
            return;
        }
        const vs = await this.loadShader("map.vs");
        const fs = await this.loadShader(game.args["no-transitions"] ? "map-no-transitions.fs" : "map.fs");

        let program = null;
        try {
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vs);
            const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fs);

            program = this.createProgram(gl, vertexShader, fragmentShader);
        } catch(error) {
            this.handleContextError(error);
            return;
        }
        this.program = program;

        this.positionLocation = gl.getAttribLocation(program, "a_position");
        this.matrixLocation = gl.getUniformLocation(program, "u_matrix");
        this.textureLocation = gl.getUniformLocation(program, "u_texture");
        this.minimapLocation = gl.getUniformLocation(program, "u_minimap");
        this.locationLocation = gl.getUniformLocation(program, "u_location");

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]),
            gl.STATIC_DRAW
        );

        this.texture = await this.loadImageAndCreateTexture("assets/map/map.png");

        this.minimapTexture = gl.createTexture();
        this.updateMinimap(data, width, height);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        game.map.ready = true;
    }

    convertData(data, width, height) {
        let i = 0;
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x < width || y < height) {
                    const color = data[y * width + x];
                    this.minimap[i + 0] = game.map.colorMap[color];
                    this.minimap[i + 1] = game.map.textureMap[color];
                } else {
                    this.minimap[i + 0] = 0;
                    this.minimap[i + 1] = 0;
                }
                i += 4;
            }
        }
        return this.minimap;
    }

    async sync(data, width, height) {
        const {gl} = this;
        if (this._loaded) {
            this.updateMinimap(data, width, height);
        } else {
            this._loaded = true;
            this.load(data, width, height);
        }
    }

    updateMinimap(data, width, height) {
        const {gl} = this;
        gl.bindTexture(gl.TEXTURE_2D, this.minimapTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this.convertData(data, width, height)
        );
    }

    async loadImageAndCreateTexture(url) {
        const {gl} = this;
        return new Promise((resolve, reject) => {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            const img = new Image();
            img.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                resolve(tex);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    async loadShader(name, dir = "assets/shaders/") {
        return fetch(dir + name).then(res => res.text());
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info);
    }

    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            const success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }

        // old video cards may fail like
        // gl.getExtension('WEBGL_lose_context').loseContext();

        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(info);
    }

    updateMap() {}

    drawMap() {
        const {gl} = this;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
        const size = 2896.309375740099; //new Point(64*64).rotate(Math.PI/4);
        const loc = game.map.location;
        const p = loc.clone().toScreen();
        matrix = m4.translate(matrix, p.x - game.camera.x, p.y - game.camera.y, 0);
        matrix = m4.scale(matrix, size, size / 2, 1);
        matrix = m4.zRotate(matrix, Math.PI / 4);
        gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        const texWidth = 128;
        const texHeight = 128;
        var texMatrix = m4.translation(0 / texWidth, 0 / texHeight, 0);
        texMatrix = m4.scale(texMatrix, size / texWidth, size / texHeight, 1);
        gl.uniformMatrix4fv(this.textureMatrixLocation, false, texMatrix);

        gl.uniform2fv(this.locationLocation, [loc.x / CELL_SIZE, loc.y / CELL_SIZE]);

        gl.uniform1i(this.textureLocation, 0);
        gl.uniform1i(this.minimapLocation, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.minimapTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    static stub() {
        return {
            drawMap() {},
            resize() {},
            updateMap() {},
            sync() {},
        };
    }
}
