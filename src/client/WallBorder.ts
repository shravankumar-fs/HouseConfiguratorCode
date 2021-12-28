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

    return (
      (another.xMin > this.xMin &&
        another.xMax < this.xMax &&
        another.yMin > this.yMin &&
        another.yMax < this.yMax &&
        another.zMin < this.zMin &&
        another.zMax > this.zMax &&
        w2 > w1 &&
        h2 > h1 &&
        d2 < d1) ||
      (another.zMin > this.zMin &&
        another.zMax < this.zMax &&
        another.yMin > this.yMin &&
        another.yMax < this.yMax &&
        another.xMin < this.xMin &&
        another.xMax > this.xMax &&
        w2 < w1 &&
        h2 > h1 &&
        d2 > d1)
    );
  }
}
