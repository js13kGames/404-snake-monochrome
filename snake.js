import { requestAnimationFrame, cancelAnimationFrame } from 'request-animation-frame-polyfill';
import now from 'performance-now';

if (typeof window === 'undefined' && global) {
    global.window = {
        innerWidth: 320,
        innerHeight: 380,

        performance: {
            now
        },
        requestAnimationFrame,
        cancelAnimationFrame
    };
}

// Constants
// ----------
const {
    innerWidth,
    innerHeight
} = window;

const width = innerWidth;
const height = innerHeight;

// Apple

class Apple {
    constructor(params) {
        const {
            color,
            radius
        } = params;

        this['color'] = color;
        this['radius'] = radius;
        this['update'] = params => {

        };

        this['render'] = params => {
            const {
                context
            } = params;

            context.save();
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fill();
            context.closePath();
            context.restore();
        };

        this['reset']();
    }

    reset() {
        const radii = this.radius;
        const radius = (radii * 2);

        this.x = (Math.random() * (width - radius)) + radii;
        this.y = (Math.random() * (height - radius)) + radii;
    }

    collides(c) {
        const {
            radius
        } = this;
        const a = this.x - c.x;
        const b = this.y - c.y;
        const d = ((a * a) + (b * b));

        const radii = radius + c.radius;
        return radii * radii >= d
    }
}

// Snake

class Snake {
    constructor(params) {
        const {
            id,
            color,
            radius
        } = params;

        this['x'] = width / 2;
        this['y'] = height / 2;
        this['id'] = id;

        this['color'] = color;
        this['radius'] = radius;

        this['length'] = 10;
        this['trail'] = [];
        this['velocity'] = [0, 0];

        this['update'] = params => {
            const {
                length,
                radius,
                velocity
            } = this;

            const speed = 10;
            this.x += ((radius * velocity[0] * speed) / 60);
            this.y += ((radius * velocity[1] * speed) / 60);

            this.trail.unshift({
                x: this.x,
                y: this.y,
                radius
            });

            if (this.y > height - radius)
                this.y = radius;

            if (this.y < radius)
                this.y = height - radius;

            if (this.x > width - radius)
                this.x = radius;

            if (this.x < radius)
                this.x = width - radius;
        };

        this['render'] = params => {
            const {
                context
            } = params;

            this.trail = this.trail.splice(0, this.length);
            this.trail.forEach((cell, index) => {
                const opacity = ((index / this.length) - 1) * -1;
                const {
                    radius
                } = cell;

                context.save();
                context.beginPath();
                context.fillStyle = `rgba(67,77,67,${opacity})`;
                context.arc(cell.x, cell.y, ((radius + radius) / 2), 0, Math.PI * 2);
                context.fill();
                context.closePath();
                context.restore();
            });
        };
    }
}

// Game Loop Module
// This module contains the game loop, which handles
// updating the game state and re-rendering the canvas
// (using the updated state) at the configured tframe.
class Loop {
    constructor(scope, tframe = 60) {
        this['delta'] = (1000 / tframe),
            this['elapsed'] = 0;
        this['tframe'] = (1000 / tframe),
            this['nframe'] = tframe,
            this['before'] = window.performance.now();

        this['animate'] = params => {
            this.loop = window.requestAnimationFrame(this.animate);
            this.delta = Math.round(((1000 / (window.performance.now() - this.before) * 100) / 100));
            if (window.performance.now() < this.before + this.tframe) return
            this.before = window.performance.now();

            scope.update(this.elapsed, this.delta);
            scope.render(this.elapsed, this.delta);
            this.elapsed++;
        };

        this['loop'] = window.requestAnimationFrame(this.animate);
        this['stop'] = params => window.cancelAnimationFrame(this.loop);
    }
}

// Game
class Game {
    constructor(params) {
        this['score'] = 0;
        this['entities'] = [];
        this['context'] = params.context;
        this['loop'] = new Loop(this, 60);
    }

    render(elapsed, delta) {
        const context = this.context;
        context.fillStyle = "#acbeac";
        context.fillRect(0, 0,
            canvas.width,
            canvas.height
        );

        const {
            entities
        } = this;
        entities
            .map(entity => entity.render({
                context,
                elapsed,
                delta
            }));

        context.font = '1em digit';
        context.fillStyle = "#0f0f0f";
        context.fillText('score: ' + this.score, (16), (50));
    }


    update(elapsed, delta) {
        const {
            entities
        } = this;
        entities
            .map(entity => entity.update(elapsed, delta));

    }

    addEntity(entity) {
        const index = this.entities
            .push(entity);

        return entity
    }
}

// Input
// ------
class Input {
    constructor(params) {
        const {
            snake
        } = params;

        document.addEventListener("click", (point) => {
            const {
                pageX,
                pageY
            } = point;

            const i = {
                x: pageX,
                y: pageY
            };

            const ii = {
                x: snake.x,
                y: snake.y
            };

            const velocity = [0, 0];
            const dy = ii.y - i.y;
            const dx = ii.x - i.x;

            const ay = Math.abs(dy);
            const ax = Math.abs(dx);

            if (ay > ax) {
                velocity[1] = (dy > 0) ? (-1) : (1);
            } else {
                velocity[0] = (dx > 0) ? (-1) : (1);
            }

            snake.velocity = velocity;
        });
    }
}

const main = params => {
    const canvas = document.querySelector('#canvas');

    const context = canvas.getContext('2d');
    const backingStores = ['webkitBackingStorePixelRatio', 'mozBackingStorePixelRatio', 'msBackingStorePixelRatio', 'oBackingStorePixelRatio', 'backingStorePixelRatio'];
    const deviceRatio = window.devicePixelRatio;

    const backingRatio = backingStores.reduce(function(prev, curr) {
        return (Object.prototype.hasOwnProperty.call(context, curr) ? context[curr] : 1)
    });

    const ratio = deviceRatio / backingRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const game = class extends Game {
        constructor(params) {
            super(params);
            this['apple'] = this
                .addEntity(new Apple({
                    radius: 10,
                    color: 'rgba(67, 77, 67, 1)'
                }));

            const snake = this
                .addEntity(new Snake({
                    radius: 10
                }));
            const input = new Input({
                snake
            });
        }

        update(elapsed, delta) {
            this.entities.map(entity => {
                if (entity instanceof Snake)
                    for (const block of entity.trail) {
                        const {
                            apple
                        } = this;
                        if (apple.collides(block)) {
                            apple.reset();

                            if (entity.trail.indexOf(block) === 0) {
                                entity.length++;
                                this.score++;
                            }
                        }
                    }
            });

            super.update(elapsed, delta);
        }
    };

    window.game = new game({
        context
    });
};

window.onload = () => main();