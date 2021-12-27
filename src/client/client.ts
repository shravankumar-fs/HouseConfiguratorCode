import * as THREE from "three";
import { Event, MeshBasicMaterial, MeshToonMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { DragControls } from "three/examples/jsm/controls/DragControls";
import { House } from "./House";
import { WallBorder } from "./WallBorder";
import { CSG } from "./CSGMesh";

const scene = new THREE.Scene();
scene.background = new THREE.TextureLoader().load("models/sky.jpg");
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 50, 200);
let selectedMapped: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>;
let light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(0, 80, 200);

light.castShadow = true;
scene.add(light);
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 1000;

let light2 = new THREE.PointLight(0xffffcf, 2, 100);
light2.position.y = 0;
scene.add(light2);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
let draggable: THREE.Mesh[] = [];
let house = new House(scene);
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
controls.minPolarAngle = Math.PI / 2.8;
controls.maxPolarAngle = Math.PI / 2.2;
controls.maxDistance = 400;
controls.minDistance = -200;
controls.enableDamping = false;
controls.dampingFactor = 0.01;
controls.enablePan = false;
controls.screenSpacePanning = false;

function animate() {
  requestAnimationFrame(animate);

  //   manageWindow();
  controls.update();

  render();
}

function render() {
  renderer.render(scene, camera);
}
animate();

document.querySelector("canvas")?.addEventListener("click", changeColor);
let floors = ["models/tile1.jpg", "models/tile2.jpg", "models/wood1.jpg"];
let walls = ["models/wall1.jpg", "models/wall2.jpg", "models/wall3.jpg"];
let doors = ["models/door1.jpg", "models/door2.jpg", "models/door3.jpg"];
let wins = ["models/window1.jpg", "models/window2.jpg", "models/window3.jpg"];
const raycaster = new THREE.Raycaster();
function changeColor(event: Event) {
  event.preventDefault();
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };
  raycaster.setFromCamera(mouse, camera);
  const intersects: THREE.Intersection[] = raycaster.intersectObjects(
    house.getHouse().children
  );

  if (intersects.length > 0) {
    let item = intersects[0];
    if (item.object.name == "Floor2" || item.object.name == "Floor1") {
      colorPopUp(item, floors);
    } else if (item.object.name == "wall") {
      colorPopUp(item, walls, true);
    } else if (item.object.name == "door") {
      rotateAndColorPop(item, doors);
    } else if (item.object.name == "window") {
      rotateAndColorPop(item, wins);
    }
  }
}
let listWindows: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>[] = [];
function colorPopUp(
  item: THREE.Intersection,
  textures: string[],
  wall?: boolean
) {
  if (document.getElementById("modal")) {
    document.getElementById("modal")?.remove();
  }
  let modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "modal";
  modal.innerHTML = `
    <h2>Pick Image Texture</h2>
    <div class="imgs">
    </div>
    <div class="buttons">
        <button class="choose">Choose</button>
        <button class="cancel">Cancel</button>
    </div>
    
    <h2>Add Elements? </h2>
    <div class="addbuttons buttons">
        <button class="addDoor add" id="adddoor">Door</button>
        <button class="addWndw add" id="addwindow">Window</button>
    </div>
    `;

  document.body.appendChild(modal);
  textures.forEach((img) => {
    let item = document.createElement("img");
    item.src = img;
    document.querySelector(".imgs")?.appendChild(item);
  });

  let allItems = document.querySelectorAll(".imgs img");
  let selected: any;
  allItems.forEach((item) => {
    item.addEventListener("click", () => {
      allItems.forEach((i) => i.classList.remove("active"));
      item.classList.toggle("active");
      if (item.classList.contains("active")) selected = item;
    });
  });
  let choose = document.querySelector(".choose");
  let cancel = document.querySelector(".cancel");

  choose?.addEventListener("click", () => {
    let imgString = (selected as HTMLImageElement).attributes[0]
      .nodeValue as string;
    ((item.object as THREE.Mesh).material as MeshToonMaterial).map =
      new THREE.TextureLoader().load(imgString);
    modal.remove();
    selected = undefined;
  });
  cancel?.addEventListener("click", () => {
    modal.remove();
  });

  let addDoor = document.querySelector(".addDoor");
  let addWinow = document.querySelector(".addWndw");
  addDoor?.addEventListener("click", (event) => {
    modal.remove();

    modal = document.createElement("div");
    modal.classList.add("modal");
    modal.id = "modal";
    modal.innerHTML = `
    <h2>Pick Door Texture</h2>
    <div class="imgs">
    </div>
    <div class="buttons">
        <button class="choose">Choose</button>
        <button class="cancel">Cancel</button>
    </div>
    `;
    document.body.appendChild(modal);
    doors.forEach((img) => {
      let item = document.createElement("img");
      item.src = img;
      document.querySelector(".imgs")?.appendChild(item);
    });
    let choose = document.querySelector(".choose");
    let cancel = document.querySelector(".cancel");
    let allItems = document.querySelectorAll(".imgs img");
    let doorSelected: any;
    allItems.forEach((item) => {
      item.addEventListener("click", () => {
        allItems.forEach((i) => i.classList.remove("active"));
        item.classList.toggle("active");
        if (item.classList.contains("active")) doorSelected = item;
      });
    });
    choose?.addEventListener("click", () => {
      if (doorSelected) {
        let imgString = (doorSelected as HTMLImageElement).attributes[0]
          .nodeValue as string;
        let g = new THREE.BoxGeometry(30, 40, 2.5);
        let m = new MeshBasicMaterial({
          map: new THREE.TextureLoader().load(imgString),
        });
        let door = new THREE.Mesh(g, m);

        door.name = "door";
        house.getHouse().add(door);
        modal.remove();
        doorSelected = undefined;
      }
    });
    cancel?.addEventListener("click", () => {
      modal.remove();
    });
  });

  addWinow?.addEventListener("click", (event) => {
    modal.remove();

    modal = document.createElement("div");
    modal.classList.add("modal");
    modal.id = "modal";
    modal.innerHTML = `
    <h2>Pick Window Texture</h2>
    <div class="imgs">
    </div>
    <div class="buttons">
        <button class="choose">Choose</button>
        <button class="cancel">Cancel</button>
    </div>
    
    `;
    document.body.appendChild(modal);
    wins.forEach((img) => {
      let item = document.createElement("img");
      item.src = img;
      document.querySelector(".imgs")?.appendChild(item);
    });
    let choose = document.querySelector(".choose");
    let cancel = document.querySelector(".cancel");
    let allItems = document.querySelectorAll(".imgs img");
    let windowSelected: any;
    allItems.forEach((item) => {
      item.addEventListener("click", () => {
        allItems.forEach((i) => i.classList.remove("active"));
        item.classList.toggle("active");
        if (item.classList.contains("active")) windowSelected = item;
      });
    });
    choose?.addEventListener("click", () => {
      if (windowSelected) {
        let imgString = (windowSelected as HTMLImageElement).attributes[0]
          .nodeValue as string;
        let g = new THREE.BoxGeometry(30, 20, 2.5);
        let m = new MeshToonMaterial({
          map: new THREE.TextureLoader().load(imgString),
          transparent: true,
          opacity: 0.9,
        });
        let window = new THREE.Mesh(g, m);
        listWindows.push(window);
        window.name = "window";
        window.position.set(0, 0, 50);
        house.getHouse().add(window);
        modal.remove();
        windowSelected = undefined;
      }
    });
    cancel?.addEventListener("click", () => {
      modal.remove();
    });
  });
}

const dControls = new DragControls(draggable, camera, renderer.domElement);
dControls.addEventListener("dragstart", function (event) {
  controls.enabled = false;
});
dControls.addEventListener("dragend", function (event) {
  controls.enabled = true;
});

function rotateAndColorPop(item: THREE.Intersection, materials: string[]) {
  if (document.getElementById("modal")) {
    document.getElementById("modal")?.remove();
  }
  let modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "modal";
  modal.innerHTML = `
        <h2>Pick ${item.object.name} Texture</h2>
        <div class="imgs">
        </div>
        <div class="buttons">
            <button class="choose">Choose</button>
            <button class="cancel">Cancel</button>
        </div>
        <div class="seperator"></div>
        <h2>Manage Positions</h2>
        <div class="buttons">
            <button class="rotate">Rotate</button>
            <button class="drag">Drag</button>
            <button class="fix">Save</button>
            <button class="delete">Delete</button>
        </div>
        `;

  document.body.appendChild(modal);
  materials.forEach((img) => {
    let item = document.createElement("img");
    item.src = img;
    document.querySelector(".imgs")?.appendChild(item);
  });

  let allItems = document.querySelectorAll(".imgs img");
  let selected: any;
  allItems.forEach((item) => {
    item.addEventListener("click", () => {
      allItems.forEach((i) => i.classList.remove("active"));
      item.classList.toggle("active");
      if (item.classList.contains("active")) selected = item;
    });
  });

  let rotate = document.querySelector(".rotate");
  let drag = document.querySelector(".drag");
  let fix = document.querySelector(".fix");
  let del = document.querySelector(".delete");
  rotate?.addEventListener("click", () => {
    (item.object as THREE.Mesh).rotation.y += Math.PI / 2;
  });
  drag?.addEventListener("click", () => {
    if (item.object.name == "window") {
      selectedMapped = listWindows.filter(
        (win) => win.id === item.object.id
      )[0];
    }
    draggable.length = 0;
    draggable.push(
      item.object as THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>
    );
  });
  fix?.addEventListener("click", () => {
    draggable.pop();
    modal.remove();
  });
  del?.addEventListener("click", () => {
    draggable.pop();
    (item.object as THREE.Mesh).removeFromParent();
    modal.remove();
  });

  let choose = document.querySelector(".choose");
  let cancel = document.querySelector(".cancel");

  choose?.addEventListener("click", () => {
    let imgString = (selected as HTMLImageElement).attributes[0]
      .nodeValue as string;
    ((item.object as THREE.Mesh).material as MeshToonMaterial).map =
      new THREE.TextureLoader().load(imgString);
    modal.remove();
    draggable.pop();
    selected = undefined;
  });
  cancel?.addEventListener("click", () => {
    modal.remove();
    draggable.pop();
  });
}
setTimeout(() => {
  console.log(house.wallBorders);
}, 1000);
let SUBFINAL: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>;
let count = 0;

function manageWindow() {
  if (selectedMapped) {
    let wbs = new WallBorder(selectedMapped);
    house.walls.forEach((wall, idx) => {
      if (house.wallBorders[idx].wallContainsObject(wbs)) {
        if (SUBFINAL) {
          house.getHouse().remove(SUBFINAL);
          SUBFINAL.visible = false;
          SUBFINAL = wall;
          console.log("1");
        }
        // const geometry = selectedMapped.geometry;
        // const material = selectedMapped.material;
        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.set(
        //   selectedMapped.position.x,
        //   selectedMapped.position.y,
        //   selectedMapped.position.z
        // );
        // house.getHouse().add(cube);

        const MESH1CSG = CSG.fromGeometry(wall.geometry.clone());
        const MESH2CSG = CSG.fromMesh(selectedMapped);
        const SUBSCTRACTCSG = MESH1CSG.subtract(MESH2CSG);
        SUBFINAL = CSG.toMesh(SUBSCTRACTCSG, new THREE.Matrix4()) as THREE.Mesh<
          THREE.BoxGeometry,
          THREE.MeshToonMaterial
        >;
        SUBFINAL.name = "wall";
        SUBFINAL.material = wall.material;
        house.getHouse().add(SUBFINAL);
        SUBFINAL.position.set(
          wall.position.x,
          wall.position.y,
          wall.position.z
        );
        // house.getHouse().remove(cube);
        SUBFINAL.visible = true;
        wall.visible = false;
      }
    });
  }
}
