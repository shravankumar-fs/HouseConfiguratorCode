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
    return (
      (another.xMin > this.xMin &&
        another.xMax < this.xMax &&
        another.yMin > this.yMin &&
        another.yMax < this.yMax &&
        another.zMin < this.zMin &&
        another.zMax > this.zMax) ||
      (another.zMin > this.xMin &&
        another.zMax < this.xMax &&
        another.yMin > this.yMin &&
        another.yMax < this.yMax &&
        another.xMin < this.xMin &&
        another.xMax > this.xMax)
    );
  }
}
