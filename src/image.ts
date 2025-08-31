export default class MyImage {
  width: number;
  height: number;
  data: Uint8Array;
  constructor(
    width: number,
    height: number,
    data = new Uint8Array(width * height * 4)
  ) {
    this.width = width;
    this.height = height;
    this.data = data;
  }
}