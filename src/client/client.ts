import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { DragControls } from "three/examples/jsm/controls/DragControls";
import { House } from "./House";
import { WallBorder } from "./WallBorder";
import { CSG } from "./CSGMesh";

const prev = `
Click on wall/floor to change textures
<br />
Press Arrow up/down to go to first/second floor
`;
const scrollMsg = `Scroll inside home to see added element`;
const scene = new THREE.Scene();
scene.background = new THREE.TextureLoader().load("models/sky.jpg");
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 50, 200);
// camera.position.set(0, 10, 60);
let light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(0, 150, 200);

light.castShadow = true;
scene.add(light);
light.shadow.bias = -0.003;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500;
let light2 = new THREE.PointLight(0xffffcf, 2, 150);
light2.position.set(0, 0, 0);
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
let listWindows: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>[] = [];
let doorList: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>[] = [];

function animate() {
  requestAnimationFrame(animate);
  house.walls.forEach((wall, idx) => {
    let SUBFINAL: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial> =
      undefined as any as THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>;
    let wb = house.wallBorders[idx];
    let changed = false;
    listWindows.forEach((windowElmt) => {
      let wbs = new WallBorder(windowElmt);
      if (wb.wallBoundsObject(wbs) != "") {
        const MESH1CSG = CSG.fromGeometry(wall.geometry.clone());
        const MESH2CSG = CSG.fromGeometry(windowElmt.geometry);
        const SUBSCTRACTCSG = MESH1CSG.subtract(MESH2CSG);
        SUBFINAL = CSG.toMesh(SUBSCTRACTCSG, new THREE.Matrix4()) as THREE.Mesh<
          THREE.BoxGeometry,
          THREE.MeshToonMaterial
        >;
        SUBFINAL.name = "wall";
        SUBFINAL.material = wall.material;
        SUBFINAL.position.set(
          wall.position.x,
          wall.position.y,
          wall.position.z
        );
        SUBFINAL.visible = true;
        wall.visible = false;
        changed = true;
        let vec = wall.position.clone();
        windowElmt.position.set(vec.x, vec.y, vec.z);
      }
    });
    if (changed) {
      house.getHouse().add(SUBFINAL);
    } else {
      house.getHouse().remove(SUBFINAL);
      wall.visible = true;
    }
    doorList.forEach((door) => {
      let wbs = new WallBorder(door);
      if (wb.wallBoundsObject(wbs) === "z") {
        door.position.z = wall.position.z;
        door.position.y = wb.yMin + door.geometry.parameters.height / 2;
      } else if (wb.wallBoundsObject(wbs) === "x") {
        door.position.x = wall.position.x;
        door.position.y = wb.yMin + door.geometry.parameters.height / 2;
      }
    });
  });

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
function changeColor(event: THREE.Event) {
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
    if (item.object.name.startsWith("Floor")) {
      modifyFloorAndWall(item, floors);
    } else if (item.object.name.startsWith("wall")) {
      modifyFloorAndWall(item, walls, true);
    } else if (item.object.name == "door") {
      modifyWindowAndDoor(item, doors);
    } else if (item.object.name == "window") {
      modifyWindowAndDoor(item, wins);
    }
  }
}

function modifyFloorAndWall(
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
    ((item.object as THREE.Mesh).material as THREE.MeshToonMaterial).map =
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
        let m = new THREE.MeshToonMaterial({
          map: new THREE.TextureLoader().load(imgString),
        });
        let door = new THREE.Mesh(g, m);
        let text = document.querySelector(".info");
        if (text != null) {
          text.innerHTML = scrollMsg;
          setTimeout(() => {
            if (text != null) text.innerHTML = prev;
          }, 5000);
        }
        door.position.set(
          controls.target.x,
          controls.target.y,
          controls.target.z
        );

        draggable.push(door);
        dControls.activate();
        door.name = "door";
        house.getHouse().add(door);
        doorList.push(door);
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
        let g = new THREE.BoxGeometry(70, 50, 4.5);
        let m = new THREE.MeshToonMaterial({
          map: new THREE.TextureLoader().load(imgString),
          transparent: true,
          opacity: 0.3,
        });
        let winElement = new THREE.Mesh(g, m);
        let text = document.querySelector(".info");
        if (text != null) {
          text.innerHTML = scrollMsg;
          setTimeout(() => {
            if (text != null) text.innerHTML = prev;
          }, 5000);
        }
        winElement.name = "window";
        winElement.position.set(
          controls.target.x,
          controls.target.y,
          controls.target.z
        );
        house.getHouse().add(winElement);
        listWindows.push(winElement);
        draggable.push(winElement);
        dControls.activate();
        modal.remove();
        windowSelected = undefined;
      }
    });
    cancel?.addEventListener("click", () => {
      modal.remove();
    });
  });
}

let dControls = new DragControls(draggable, camera, renderer.domElement);
dControls.addEventListener("dragstart", function (event) {
  controls.enabled = false;
});
dControls.addEventListener("drag", function (event) {});
dControls.addEventListener("dragend", function (event) {
  controls.enabled = true;
});

function modifyWindowAndDoor(item: THREE.Intersection, materials: string[]) {
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
    if (item.object.name == "window") {
      rotateHouseElement(item, "window", listWindows);
    } else {
      rotateHouseElement(item, "door", doorList);
    }
    modal.remove();
  });
  drag?.addEventListener("click", () => {
    dControls.activate();
  });
  fix?.addEventListener("click", () => {
    dControls.deactivate();
    modal.remove();
  });
  del?.addEventListener("click", () => {
    dControls.deactivate();
    if (item.object.name == "window") {
      let ob = listWindows.filter((win) => win.id === item.object.id)[0];
      draggable.splice(draggable.indexOf(ob), 1);
      listWindows.splice(listWindows.indexOf(ob), 1);
      house.getHouse().remove(ob);
    } else if (item.object.name == "door") {
      let ob = doorList.filter((win) => win.id === item.object.id)[0];
      draggable.splice(draggable.indexOf(ob), 1);
      doorList.splice(doorList.indexOf(ob), 1);
      house.getHouse().remove(ob);
    }
    modal.remove();
  });

  let choose = document.querySelector(".choose");
  let cancel = document.querySelector(".cancel");

  choose?.addEventListener("click", () => {
    let imgString = (selected as HTMLImageElement).attributes[0]
      .nodeValue as string;
    ((item.object as THREE.Mesh).material as THREE.MeshToonMaterial).map =
      new THREE.TextureLoader().load(imgString);
    modal.remove();
    dControls.deactivate();
    selected = undefined;
  });
  cancel?.addEventListener("click", () => {
    modal.remove();
    dControls.deactivate();
  });
}

document.body.addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") {
    controls.target.set(0, 60, 0);
  } else if (e.key == "ArrowDown") {
    controls.target.set(0, 0, 0);
  }
  camera.lookAt(controls.target);
});

function rotateHouseElement(
  item: THREE.Intersection,
  name: string,
  elementList: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>[]
) {
  let ob = elementList.filter((door) => door.id === item.object.id)[0];
  let g = new THREE.BoxGeometry(
    ob.geometry.parameters.depth,
    ob.geometry.parameters.height,
    ob.geometry.parameters.width
  );

  let m = ob.material.clone();
  let vec = ob.position.clone();

  draggable.splice(draggable.indexOf(ob), 1);
  elementList.splice(elementList.indexOf(ob), 1);
  house.getHouse().remove(ob);

  let mat = new THREE.Mesh(g, m);
  mat.name = name;
  mat.position.set(vec.x, vec.y, vec.z);

  house.getHouse().add(mat);
  elementList.push(mat);
  draggable.push(mat);
  dControls.activate();
}
