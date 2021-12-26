import * as THREE from 'three'
import { Event, MeshBasicMaterial, MeshToonMaterial, PointLight, Vector2, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { House } from './House'

const scene = new THREE.Scene()
scene.background = new THREE.TextureLoader().load('models/sky.jpg')
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 50, 200)
let light = new THREE.PointLight(0xffffff, 1, 1000)
light.position.set(0, 40, 100)

light.castShadow = true
scene.add(light)
light.shadow.bias = -0.001
light.shadow.mapSize.width = 512
light.shadow.mapSize.height = 512
light.shadow.camera.near = 0.1
light.shadow.camera.far = 1000
let light2 = new THREE.PointLight(0xffffcf, 2, 50)
light2.position.y = -30
scene.add(light2)

let light3 = new THREE.PointLight(0xffffcf, 2, 50)
light3.position.set(-52, 10, 0)
scene.add(light3)
let light4 = new THREE.PointLight(0xffffcf, 2, 50)
light4.position.set(52, 10, 0)
scene.add(light4)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

let house = new House(scene)
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}
controls.minPolarAngle = Math.PI / 10
controls.maxPolarAngle = Math.PI / 2
controls.maxDistance = 400
controls.minDistance = -200
controls.enableDamping = true
controls.dampingFactor = 0.01
controls.enablePan = false
controls.screenSpacePanning = false

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}
animate()

document.querySelector('canvas')?.addEventListener('click', changeColor)
let floors = ['models/tile1.jpg', 'models/tile2.jpg', 'models/wood1.jpg']
let walls = ['models/wall1.jpg', 'models/wall2.jpg', 'models/wall3.jpg']
const raycaster = new THREE.Raycaster()
function changeColor(event: Event) {
    event.preventDefault()
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    }
    raycaster.setFromCamera(mouse, camera)
    const intersects: THREE.Intersection[] = raycaster.intersectObjects(house.getHouse().children)

    if (intersects.length > 0) {
        let item = intersects[0]
        if (item.object.name == 'Floor2' || item.object.name == 'Floor1') {
            colorPopUp(item, floors)
        }
        if (item.object.name == 'wall') {
            colorPopUp(item, walls)
        }
    }
}

function colorPopUp(item: THREE.Intersection, textures: string[]) {
    if (document.getElementById('modal')) {
        document.getElementById('modal')?.remove()
    }
    let modal = document.createElement('div')
    modal.classList.add('modal')
    modal.id = 'modal'
    modal.innerHTML = `
    <h2>Pick Image Texture</h2>
    <div class="imgs">
    </div>
    <div class="buttons">
        <button class="choose">Choose</button>
        <button class="cancel">Cancel</button>
    </div>
    
    `

    document.body.appendChild(modal)
    textures.forEach((img) => {
        let item = document.createElement('img')
        item.src = img
        document.querySelector('.imgs')?.appendChild(item)
    })

    let allItems = document.querySelectorAll('.imgs img')
    let selected: any
    allItems.forEach((item) => {
        item.addEventListener('click', () => {
            allItems.forEach((i) => i.classList.remove('active'))
            item.classList.toggle('active')
            if (item.classList.contains('active')) selected = item
        })
    })
    let choose = document.querySelector('.choose')
    let cancel = document.querySelector('.cancel')

    choose?.addEventListener('click', () => {
        let imgString = (selected as HTMLImageElement).attributes[0].nodeValue as string
        ;((item.object as THREE.Mesh).material as MeshToonMaterial).map =
            new THREE.TextureLoader().load(imgString)
        modal.remove()
        selected = undefined
    })
    cancel?.addEventListener('click', () => {
        modal.remove()
    })
}
