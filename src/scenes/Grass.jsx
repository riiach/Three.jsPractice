import { Hill1, Hill2, Hill3 } from './Sprites.jsx'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { smoothProgress, introMotion } from './sceneTiming.js'

const hills = [
    { Component: Hill1, x: 0, width: 1.65, aspect: 1921 / 819, peak: 152 / 819, top: 0.27, z: 0.28, start: 1, end: 2.9 },
    { Component: Hill2, x: -0.24, width: 1.42, aspect: 1914 / 822, peak: 86 / 822, top: 0.16, z: 0, start: 1.06, end: 2.96 },
    { Component: Hill3, x: 0.1, width: 1.65, aspect: 1920 / 819, peak: 114 / 819, top: 0.08, z: -0.3, start: 1.12, end: 3.02 },
]

export default function Scene1GrassGoesdown({ clock }) {
    const hostRef = useRef(null)
    const elRefs = useRef([]) // 각 언덕 DOM 요소를 담을 배열 레퍼런스

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        // 1. Three.js 필수 객체 초기화
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, 1, 1, 10000)
        const renderer = new CSS3DRenderer()

        renderer.domElement.className = 'absolute inset-0'
        host.appendChild(renderer.domElement)

        // 2. DOM 요소를 CSS3DObject로 변환하여 씬에 추가
        const objects = elRefs.current.map(el => {
            const obj = new CSS3DObject(el)
            scene.add(obj)
            return obj
        })

        // 3. 렌더링에 필요한 상태값들을 하나의 객체로 관리
        const ctx = {
            elapsed: clock.time,
            width: host.clientWidth,
            height: host.clientHeight,
            distance: 1
        }

        const sizeOf = (hill) => {
            const h = Math.max(ctx.width * hill.width / hill.aspect, ctx.height * (1 - hill.top) / (1 - hill.peak))
            return { width: h * hill.aspect, height: h }
        }

        const render = () => {
            objects.forEach((object, index) => {
                const hill = hills[index]
                const size = sizeOf(hill)
                const depth = 1 - hill.z
                const movement = smoothProgress(ctx.elapsed, hill.start, hill.end - hill.start)
                const motion = introMotion(ctx.elapsed)

                const offsetX = -ctx.width * (0.38 * motion.pan + 0.12 * movement)
                const offsetY = ctx.height * (1 - hill.top + 0.15) * movement
                const initialY = ctx.height * (0.5 - hill.top) - size.height * (0.5 - hill.peak)

                object.position.set(
                    (ctx.width * hill.x + offsetX) * depth,
                    (initialY - offsetY) * depth,
                    ctx.distance * hill.z,
                )
                object.rotation.z = THREE.MathUtils.degToRad(-2 * movement)
                object.visible = movement < 1
            })
            renderer.render(scene, camera)
        }

        const resize = () => {
            ctx.width = host.clientWidth
            ctx.height = host.clientHeight
            if (!ctx.width || !ctx.height) return

            renderer.setSize(ctx.width, ctx.height)
            camera.aspect = ctx.width / ctx.height
            camera.updateProjectionMatrix()

            ctx.distance = ctx.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
            camera.position.set(0, 0, ctx.distance)

            objects.forEach((object, index) => {
                const hill = hills[index]
                const size = sizeOf(hill)
                object.element.style.width = `${size.width * (1 - hill.z)}px`
                object.element.style.height = `${size.height * (1 - hill.z)}px`
            })
            render()
        }

        // 4. 이벤트 리스너 및 구독 설정
        const observer = new ResizeObserver(resize)
        observer.observe(host)
        resize()

        const unsubscribe = clock.subscribe(time => {
            ctx.elapsed = time
            render()
        })

        // 5. 깔끔해진 클린업 (리액트가 DOM을 지우므로 수동 제거 최소화)
        return () => {
            unsubscribe()
            observer.disconnect()
        }
    }, [clock])

    return (
        <div ref={hostRef} className="pointer-events-none absolute inset-0 z-5 overflow-hidden" aria-label="Three hills moving down and left">
            {hills.map(({ Component }, index) => (
                <div
                    key={index}
                    ref={el => (elRefs.current[index] = el)}
                    className="absolute" // Three.js 관리를 위해 기본 절대좌표 부여
                >
                    <Component />
                </div>
            ))}
        </div>
    )
}
