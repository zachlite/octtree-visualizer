import { mat4, vec3, quat } from "gl-matrix";
import REGL from "regl";
import ReglCamera from "regl-camera";

window.onload = () => {
  const regl = REGL();
  const camera = ReglCamera(regl);
  const Red = [1, 0, 0];
  const Green = [0, 1, 0];
  const Blue = [0, 0, 1];
  const White = [1, 1, 1];
  const Magenta = [1, 0, 1];
  const Cyan = [0, 1, 1];
  const Yellow = [1, 1, 0];

  const colorForDepth = {
    0: Red,
    1: Green,
    2: Blue,
    3: White,
    4: Cyan,
    5: Magenta,
    6: Yellow,
    7: Red,
    8: Green,
    9: [1, 1, 1],
  };

  const cube = {
    vertices: [
      [-1, -1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, 1, -1],
    ],
    lines: [
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 3],
      [4, 5],
      [5, 6],
      [6, 7],
      [4, 7],
    ],
  };

  const drawCube = regl({
    vert: `
      precision mediump float;
      attribute vec3 position;
      uniform mat4 projection, view, model;

      void main() {
        gl_Position = projection * view * model * vec4(position, 1.0);
      }
    `,
    frag: `
      precision mediump float;
      uniform vec3 color;
      void main () {
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      model: (context, props) => props.model,
      color: (context, props) => props.color,
    },
    attributes: {
      position: cube.vertices,
    },
    elements: cube.lines,
    primitive: "lines",
  });

  let tree;

  window.setTree = (_tree) => {
    tree = _tree;
  };

  function drawTreeNode(node) {
    const min = [node.Aabb.Min.X, node.Aabb.Min.Y, node.Aabb.Min.Z];
    const max = [node.Aabb.Max.X, node.Aabb.Max.Y, node.Aabb.Max.Z];

      drawCube({
        model: aabbToTransform(min, max, node.Depth),
        color: colorForDepth[node.Depth],
      });

    for (const child of node.Children || []) {
      drawTreeNode(child);
    }
  }

  regl.frame(() => {
    camera(() => {
      regl.clear({ color: [0, 0, 0, 1] });
      if (tree) {
        drawTreeNode(tree.RootNode);
      }
    });
  });
};

function aabbToTransform(min, max, depth) {
  const scale = 1 / Math.pow(2, depth);
  const center = vec3.scale([], vec3.add(vec3.create(), min, max), 0.5);
  return mat4.fromRotationTranslationScale(
    mat4.create(),
    quat.create(),
    vec3.scale([], center, 0.995),
    [scale, scale, scale]
  );
}
