export class WallBorder {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  vec: THREE.Vector3;
  constructor(public wall: THREE.Mesh<THREE.BoxGeometry, THREE.Material>) {
    let w = wall.geometry.parameters.width;
    let h = wall.geometry.parameters.height;
    let d = wall.geometry.parameters.depth;
    this.vec = wall.position;
    this.xMin = this.vec.x - w / 2;
    this.xMax = this.vec.x + w / 2;
    this.yMin = this.vec.y - h / 2;
    this.yMax = this.vec.y + h / 2;
    this.zMin = this.vec.z - d / 2;
    this.zMax = this.vec.z + d / 2;
  }

  public wallContainsObject(another: WallBorder): boolean {
    let w1 = another.xMax - another.xMin;
    let h1 = another.yMax - another.yMin;
    let d1 = another.zMax - another.zMin;

    let w2 = this.xMax - this.xMin;
    let h2 = this.yMax - this.yMin;
    let d2 = this.zMax - this.zMin;

    let left =
      another.xMin > this.xMin &&
      another.xMax < this.xMax &&
      another.yMin > this.yMin &&
      another.yMax < this.yMax &&
      another.zMin < this.zMin &&
      another.zMax > this.zMax;
    let right =
      another.xMin < this.xMin &&
      another.xMax > this.xMax &&
      another.yMin > this.yMin &&
      another.yMax < this.yMax &&
      another.zMin > this.zMin &&
      another.zMax < this.zMax;

    if (w1 > d1) {
      return left;
    }
    if (w1 < d1) {
      return right;
    }
    return false;
  }

  public wallBoundsObject(another: WallBorder): string {
    let w1 = another.xMax - another.xMin;
    let d1 = another.zMax - another.zMin;

    let left =
      another.xMin > this.xMin &&
      another.xMax < this.xMax &&
      another.yMin > this.yMin - 10 &&
      another.yMax < this.yMax + 10 &&
      another.zMin > this.zMin - 50 &&
      another.zMax < this.zMax + 50;
    let right =
      another.xMin > this.xMin - 50 &&
      another.xMax < this.xMax + 50 &&
      another.yMin > this.yMin - 10 &&
      another.yMax < this.yMax + 10 &&
      another.zMin > this.zMin &&
      another.zMax < this.zMax;

    if (w1 > d1 && left) {
      return "z";
    }
    if (w1 < d1 && right) {
      return "x";
    }
    return "";
  }
}
