import './module/module/shim'

import Apple from './module/Apple.js'
import Snake from './module/Snake.js'
import Game from './module/Game.js'
import Input from './module/Input.js'
import {
    width,
    height
} from './module/constants'

const main = params => {
    const canvas = document.querySelector('#canvas')
    const {
        random
    } = Math

    const context = canvas.getContext('2d')
    const backingStores = ['webkitBackingStorePixelRatio', 'mozBackingStorePixelRatio', 'msBackingStorePixelRatio', 'oBackingStorePixelRatio', 'backingStorePixelRatio']
    const deviceRatio = window.devicePixelRatio

    const backingRatio = backingStores.reduce(function(prev, curr) {
        return (Object.prototype.hasOwnProperty.call(context, curr) ? context[curr] : 1)
    })

    const ratio = deviceRatio / backingRatio
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    const game = class extends Game {
        constructor(params) {
            super(params)
            this['apple'] = this
                .addEntity(new Apple({
                    radius: 10,
                    color: 'rgba(67, 77, 67, 1)'
                }))

            const snake = this
                .addEntity(new Snake({
                    radius: 10
                }))
            const input = new Input({
                snake
            })
        }

        update(elapsed, delta) {
            this.entities.map(entity => {
                if (entity instanceof Snake)
                    for (const block of entity.trail) {
                        const {
                            apple
                        } = this
                        if (apple.collides(block)) {
                            apple.reset()

                            if (entity.trail.indexOf(block) === 0) {
                                entity.length++
                                this.score++
                            }
                        }
                    }
            })

            super.update(elapsed, delta)
        }
    }

    window.game = new game({
        context
    })
}

window.onload = () => main()