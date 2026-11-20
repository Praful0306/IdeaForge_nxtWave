import fs from "fs";
import path from "path";

// 1x1 valid JPEG byte buffer
const jpegBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

const target = path.resolve(process.cwd(), "test-assets", "pothole.jpg");
fs.writeFileSync(target, Buffer.from(jpegBase64, "base64"));
console.log(`Generated sample test asset at ${target}`);
