import * as THREE from "three";
import { MeshToonMaterial, TextureLoader } from "three";
import { WallBorder } from "./WallBorder";

export class House {
  house: THREE.Group;
  walls: THREE.Mesh<THREE.BoxGeometry, THREE.MeshToonMaterial>[] = [];
  wallBorders: WallBorder[] = [];
  constructor(private scene: THREE.Scene) {
    this.house = new THREE.Group();
    this.initGround();
    this.initHouse();
    this.scene.add(this.house);
  }

  getHouse() {
    return this.house;
  }

  initGround() {
    let texture = new TextureLoader().load("models/grass.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(500, 500);
    let mat = new THREE.MeshToonMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    let geo = new THREE.PlaneGeometry(10000, 10000);
    let item = new THREE.Mesh(geo, mat);
    item.rotation.x += Math.PI / 2;
    item.position.set(0, -35, 0);
    item.receiveShadow = true;
    this.house.add(item);

    let surT = new TextureLoader().load("models/sky.jpg");
    let m = new THREE.MeshToonMaterial({
      map: surT,
      side: THREE.DoubleSide,
    });
    let g = new THREE.SphereGeometry(5000, 1000, 1000);
    let i = new THREE.Mesh(g, m);
    i.position.set(0, 104, 0);
    this.house.add(i);
  }

  initHouse() {
    this.initCeiling();
    this.initFloor();
    this.initWalls();
  }

  initFloor() {
    let mat = new THREE.MeshToonMaterial({
      map: new TextureLoader().load("models/wood1.jpg"),
      depthTest: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    let geo = new THREE.BoxGeometry(150, 1, 150);
    let item = new THREE.Mesh(geo, mat);
    item.position.set(0, -30.6, 0);
    item.receiveShadow = true;
    item.name = "Floor1";
    this.house.add(item);
    let mat1 = new THREE.MeshToonMaterial({
      map: new TextureLoader().load("models/wood1.jpg"),
      depthTest: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    let geo1 = new THREE.PlaneGeometry(200, 200);
    let item1 = new THREE.Mesh(geo1, mat1);
    item1.position.set(0, 30.6, 0);
    item1.rotation.x -= Math.PI / 2;
    item1.name = "Floor1";
    item1.castShadow = true;
    item1.receiveShadow = true;
    this.house.add(item1);

    let mat0 = new THREE.MeshToonMaterial({
      map: new TextureLoader().load("models/sand.jpg"),
      color: 0xefef00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
      depthTest: true,
      depthWrite: true,
    });
    let geo0 = new THREE.BoxGeometry(400, 0.5, 400);
    let item0 = new THREE.Mesh(geo0, mat0);
    item0.position.set(0, -30.991, 40);
    item0.receiveShadow = true;
    item0.name = "Floor";
    this.house.add(item0);

    let mat2 = new THREE.MeshToonMaterial({
      map: new TextureLoader().load("models/wood1.jpg"),
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });
    let geo2 = new THREE.BoxGeometry(150, 1, 100);
    let item2 = new THREE.Mesh(geo2, mat2);
    item2.position.set(0, -30.6, 125);
    item2.receiveShadow = true;
    item2.name = "Floor2";
    this.house.add(item2);
    this.addGrass(new THREE.Vector3(-200, -40, 240));
    this.addGrass(new THREE.Vector3(200, -40, 240));
    this.addGrass(new THREE.Vector3(-200, -40, -160));
    this.addGrass(new THREE.Vector3(200, -40, -160));

    for (let i = 0; i < 5; i++) {
      this.addGrass(new THREE.Vector3(80 + i, -40 + i * 2, 175 - i * 20));
      this.addGrass(new THREE.Vector3(-80 - i, -40 + i * 2, 175 - i * 20));
    }

    this.addGateWall(new THREE.Vector3(-200, -15, 42));
    this.addGateWall(new THREE.Vector3(200, -15, 42));
    this.addGateWall(new THREE.Vector3(0, -15, -158), Math.PI / 2);
  }
  addGateWall(
    pos: THREE.Vector3,
    yRot?: number,
    w?: number,
    h?: number,
    d?: number,
    transparent?: boolean
  ) {
    let text = new TextureLoader().load("models/wood.jpg");
    text.wrapS = THREE.RepeatWrapping;
    text.wrapT = THREE.RepeatWrapping;
    text.repeat.set(5, 1);
    let m = new THREE.MeshToonMaterial({
      color: transparent ? 0x00efef : undefined,
      map: !transparent ? text : undefined,
      transparent: transparent,
      opacity: transparent ? 0.1 : 1,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });
    let g = new THREE.BoxGeometry(4, 30, 400);
    if (w && h && d) {
      g = new THREE.BoxGeometry(w, h, d);
    }
    let i = new THREE.Mesh(g, m);
    i.receiveShadow = true;
    i.castShadow = true;
    this.house.add(i);
    if (yRot) i.rotation.y += Math.PI / 2;
    i.position.set(pos.x, pos.y, pos.z);
  }
  initCeiling() {
    let texture = new TextureLoader().load("models/roof.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    let mat = new THREE.MeshToonMaterial({
      map: texture,
      color: 0x937313,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });
    let geo = new THREE.ConeGeometry(120, 70, 4, 1, true);
    let roof = new THREE.Mesh(geo, mat);
    roof.position.set(0, 120, 0);
    roof.rotation.y += Math.PI / 4;
    roof.castShadow = true;
    this.house.add(roof);
  }
  initWalls() {
    this.house.add(
      this.getWallItem(new THREE.Vector3(-75, 0, 0), 1, 60, 150, "wallLeft")
    );
    this.house.add(
      this.getWallItem(new THREE.Vector3(75, 0, 0), 1, 60, 150, "wallRight")
    );
    this.house.add(
      this.getWallItem(new THREE.Vector3(0, 0, -75), 150, 60, 1, "wallBack")
    );
    this.house.add(
      this.getWallItem(new THREE.Vector3(0, 0, 75), 150, 60, 1, "wallFront")
    );

    this.house.add(this.getWallItem(new THREE.Vector3(-75, 60, 0), 1, 60, 150));
    this.house.add(this.getWallItem(new THREE.Vector3(75, 60, 0), 1, 60, 150));
    this.house.add(this.getWallItem(new THREE.Vector3(0, 60, -75), 150, 60, 1));
    this.house.add(this.getWallItem(new THREE.Vector3(0, 60, 75), 150, 60, 1));

    this.addGateWall(new THREE.Vector3(-100, 40, 0), 0, 1, 20, 200, true);
    this.addGateWall(new THREE.Vector3(100, 40, 0), 0, 1, 20, 200, true);
    this.addGateWall(new THREE.Vector3(0, 40, -100), 0, 200, 20, 1, true);
    this.addGateWall(new THREE.Vector3(0, 40, 100), 0, 200, 20, 1, true);

    // let g = new THREE.BoxGeometry(30, 40, 2.5);
    // let m = new THREE.MeshToonMaterial({
    //   map: new THREE.TextureLoader().load("models/door3.jpg"),
    // });
    // let door = new THREE.Mesh(g, m);
    // door.position.set(0, -10, 75);
    // door.name = "door";
    // this.house.add(door);
  }
  getWindow(pos: THREE.Vector3) {
    let mat = new THREE.MeshBasicMaterial({
      color: 0x3f3f3f,
      map: new THREE.TextureLoader().load("models/window.jpg"),
    });

    let geo = new THREE.BoxGeometry(2, 15, 30);

    let window = new THREE.Mesh(geo, mat);
    window.position.set(pos.x, pos.y, pos.z);
    window.castShadow = true;
    return window;
  }
  getDoor() {
    let texture = new TextureLoader().load("models/door.jpg");
    // texture.wrapS = THREE.RepeatWrapping
    // texture.wrapT = THREE.RepeatWrapping
    // texture.repeat.set(10, 10)
    let mat = new THREE.MeshToonMaterial({
      map: texture,
      color: 0x937313,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });

    let geo = new THREE.BoxGeometry(30, 40, 2);

    let door = new THREE.Mesh(geo, mat);
    door.position.set(0, -10, 50);
    door.castShadow = true;
    return door;
  }

  getWallItem(
    pos: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    name?: string
  ) {
    let texture = new TextureLoader().load("models/wall1.jpg");
    // texture.wrapS = THREE.RepeatWrapping
    // texture.wrapT = THREE.RepeatWrapping
    // texture.repeat.set(2, 2)
    let mat = new THREE.MeshToonMaterial({
      map: texture,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });

    let geo = new THREE.BoxGeometry(width, height, depth);
    let wall = new THREE.Mesh(geo, mat);
    wall.name = "wall";
    if (name) {
      wall.name = name;
    }
    wall.position.set(pos.x, pos.y, pos.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.walls.push(wall);
    this.wallBorders.push(new WallBorder(wall));
    return wall;
  }

  addGrass(pos: THREE.Vector3) {
    const geometry = new THREE.TorusKnotGeometry(10, 3, 64, 8, 17, 2);
    const material = new THREE.MeshToonMaterial({
      color: 0x2fef00,
      map: new THREE.TextureLoader().load("models/grass.jpg"),
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    torusKnot.castShadow = true;
    torusKnot.position.set(pos.x, pos.y, pos.z);
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    this.house.add(torusKnot);
  }
}
