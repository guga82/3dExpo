import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Magnetometer } from 'expo-sensors';
import {
  PerspectiveCamera,
  Scene,
  AmbientLight,
  PointLight,
  SpotLight,
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
// import * as NavigationBar from "expo-navigation-bar";
import IconButton from "./components/iconButton";
import firstCoordinates from "./assets/newCoordinates";
import dataServices from "./services/dataServices";

let pointsCoordinates = firstCoordinates;
let camPos = 120;
let rotX;
let rotY;
let rotZ;

export default function App() {
  let timeout;

  // const ws = new WebSocket("wss://echo.websocket.org");
  const ws = new WebSocket("ws://192.168.3.10:81");
  // const ws = new WebSocket("ws://192.168.43.12:81");
  console.log("Iniciado WebSocket");

  ws.onopen = (event) => {
    console.log("Event data: ", event.data);
  };
  ws.onmessage = async function (event) {
    const lidarData = event.data.split(",");
    const lidarFiltered = await bufferReceive(lidarData);
    // console.log("Dados filtrados: ", lidarFiltered);
  };
  ws.onclose = function (event) {
    console.log("closed, code is:", event.code);
  };

  useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0x6ad6f0;

    // Create a WebGLRenderer without a DOM element
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(sceneColor);

    const camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(-2, 0, camPos); // move a câmera para trás para ver melhor os pontos
    camera.lookAt(0, 0, 0); // aponta a câmera para o centro da cena

    const scene = new Scene();

    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);

    const spotLight = new SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);

    const pointsGeometry = new BufferGeometry();
    let positions = [];

    pointsCoordinates.forEach((coord) => {
      positions.push(coord.x / 100, coord.y / 100, coord.z / 100);
    });
    pointsGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3)
    );

    let pointsMaterial = new PointsMaterial({ color: 0xffffff });
    let points = new Points(pointsGeometry, pointsMaterial);
    scene.add(points);



    const updatePoints = ()=>{
      positions = []
      pointsCoordinates.forEach((coord) => {
        positions.push(coord.x / 100, coord.y / 100, coord.z / 100);
      });
      pointsGeometry.setAttribute(
        "position",
        new Float32BufferAttribute(positions, 3)
      );
      points = new Points(pointsGeometry, pointsMaterial);

    }

    setInterval(updatePoints,300)

    let aumenta = false;

    rotX = points.rotation.x;
    rotY = points.rotation.y;
    rotZ = points.rotation.z;

    function update() {
      // No update needed for static point cloud

      // points.rotation.y += 0.025;
      // points.rotation.x += 0.025;
      // points.rotation.z += 0.025;

      points.rotation.x = rotX;
      points.rotation.y = rotY;
      points.rotation.z = rotZ;

      // if (aumenta === true) {
      //   camPos += 1;
      //   camPos > 220 ? (aumenta = false) : "";
      // } else {
      //   camPos -= 1;
      //   camPos < 80 ? (aumenta = true) : "";
      // }

      camera.position.set(-2, 0, camPos); // move a câmera para trás para ver melhor os pontos
    }

    // Setup an animation loop
    const render = () => {
      timeout = requestAnimationFrame(render);
      update();
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
  };

  // ROTATION FUNCTIONS
  const onUp = async () => {
    rotX += 0.2;
  };
  const onDown = async () => {
    rotX -= 0.2;
  };

  const onLeft = async () => {
    rotY -= 0.2;
  };
  const onRight = async () => {
    rotY += 0.2;
  };

  const onRotLeft = async () => {
    rotZ += 0.2;
  };
  const onRotRight = async () => {
    rotZ -= 0.2;
  };
  const onZoomIn = async () => {
    camPos -= 2;
  };

  const onZoomOut = async () => {
    camPos += 2;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: "lightblue",
      padding: 10,
      height: 70,
      alignItems: "center", // Centraliza o texto do cabeçalho
    },
    headerText: {
      fontSize: 20,
      fontWeight: "bold",
    },
    buttonContainer: {
      flex: 1,
      marginTop: 0,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      backgroundColor: "lightgray",
    },
    upButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 0, // Espaçamento entre os botões de cima e de baixo
    },
    leftRightButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    downButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 0, // Espaçamento entre os botões de cima e de baixo
    },
    upButton: {
      marginRight: 10, // Espaçamento entre os botões de cima e de esquerda/direita
    },
    leftButton: {
      marginRight: 10, // Espaçamento entre os botões de esquerda e direita
    },
    rightButton: {
      marginRight: 10, // Espaçamento entre os botões de esquerda e direita
    },
    downButton: {},
  });

  return (
    <View style={styles.container}>
      {/* <View> */}
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
      {/* </View> */}
      {/* Cabeçalho */}
      {/* <View style={{ backgroundColor: "lightblue", padding: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Cabeçalho</Text>
        <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
        <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
        <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
        <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
      </View> */}
      {/* Botões */}
      <View style={styles.buttonContainer}>
        {/* Botões para cima e para baixo */}
        <View style={styles.upButtonContainer}>
          <IconButton
            icon="turn-slight-left"
            label="RotLeft"
            onPress={onRotLeft}
            style={styles.upButton}
          />
          <IconButton
            icon="north"
            label="Up"
            onPress={onUp}
            style={styles.upButton}
          />
          <IconButton
            icon="turn-slight-right"
            label="RotRight"
            onPress={onRotRight}
            style={styles.upButton}
          />
        </View>

        {/* Botões para esquerda e direita */}
        <View style={styles.leftRightButtonContainer}>
          <IconButton
            icon="zoom-out"
            label="zoomOut"
            onPress={onZoomOut}
            style={styles.leftButton}
          />
          <IconButton
            icon="west"
            label="Left"
            onPress={onLeft}
            style={styles.leftButton}
          />
          <IconButton
            icon="east"
            label="Right"
            onPress={onRight}
            style={styles.rightButton}
          />
          <IconButton
            icon="zoom-in"
            label="zoomOut"
            onPress={onZoomIn}
            style={styles.leftButton}
          />
        </View>

        <View style={styles.downButtonContainer}>
          <IconButton
            icon="south"
            label="down"
            onPress={onDown}
            style={styles.downButton}
          />
        </View>
      </View>
    </View>
  );
}

let msrValues = {
  lastValues: {},
  avgValues: {},
  stdDeviation: {},
  xyz: {},
  move: { x: 0, y: 0 },
  lastMoves: [],
};
const tol = 0.03;

const elQtyMovDetect = -4; // Quantity of elements of array to average the moves

const qtyMsgAvgCalc = 20; // Quantity of measures to calculate the average

async function pointsFilter(angle, distance) {
  let indexAngle = parseInt(angle);
  let indexDistance = parseInt(distance);

  msrValues["lastValues"][indexAngle] =
    msrValues["lastValues"][indexAngle] || [];

  if (msrValues["lastValues"][indexAngle].length >= qtyMsgAvgCalc) {
    let average = await dataServices.averageCalcSemOutliers(
      msrValues["lastValues"][indexAngle],
      indexAngle,
      dataServices.averageCalc,
      dataServices.calcStdDeviation
    );
    average > 0 ? (msrValues["avgValues"][indexAngle] = average) : "";
    msrValues["lastValues"][indexAngle].shift();
  }

  indexDistance > 0
    ? msrValues["lastValues"][indexAngle].push(indexDistance)
    : "";

  //return console.log(JSON.stringify(msrValues["lastValues"]));
}

async function moveCalc(msrValues) {
  let detectedMovement = { x: [], y: [] };
  for (let angle = 1; angle <= 360; angle++) {
    const oppositeAngle = dataServices.calculateOppositeAngle(angle);

    if (
      msrValues["avgValues"][angle] &&
      msrValues["avgValues"][oppositeAngle] &&
      msrValues["lastValues"][angle]
    ) {
      const actDistAngle = await dataServices.averageCalc([
        ...msrValues["lastValues"][angle].slice(elQtyMovDetect),
      ]);
      const actDistOpsAngle = await dataServices.averageCalc([
        ...msrValues["lastValues"][oppositeAngle].slice(elQtyMovDetect),
      ]);

      if (angle === 270 || angle === 50) {
        msrValues["avgValues"][angle] = actDistAngle;
        msrValues["avgValues"][oppositeAngle] = actDistOpsAngle;
        const difAngle =
          (msrValues["avgValues"][angle] -
            msrValues["avgValues"][oppositeAngle]) /
          2;

        console.log("Grados ", angle, ": ", difAngle);
        console.log("X: ", dataServices.lidarToXYZ(angle, difAngle).y);
      }
    }
  }
  return [
    await dataServices.avgCalc(detectedMovement.x),
    await dataServices.avgCalc(detectedMovement.y),
  ];
}

async function bufferReceive(data) {
  let byteSize = parseInt(data[2], 16);

  if (byteSize !== 58) {
    return;
  }

  let initAngle = dataServices.bytesGroup(data, 5, 6);
  let endAngle = dataServices.bytesGroup(data, byteSize - 3, byteSize - 2);

  if (initAngle / 100 < 360) {
    await pointsFilter(
      initAngle / 100,
      parseInt(dataServices.bytesGroup(data, 7, 8), 16)
    );
  }

  let qtyAngles = (byteSize - 10) / 3;
  let incAngle;

  if (endAngle > initAngle) {
    incAngle = (endAngle - initAngle) / qtyAngles;
  } else {
    incAngle = (36000 + endAngle - initAngle) / qtyAngles;
  }

  // console.log("start: ", initAngle, " - end: ", endAngle)
  // console.log('inc ang: ', incAngle, '/', parseInt(data[2],16))

  // Check all angles received
  for (let index = 1; index < qtyAngles; index++) {
    let indexAngle = initAngle + index * incAngle;
    let distIndex = parseInt(
      dataServices.bytesGroup(data, 7 + index * 3, 8 + index * 3)
    );

    // Verificar a necessidade de ainda utilizar esta função
    // let coordXYZ = lidarToXYZ(indexAngle / 100, distIndex);

    if (indexAngle / 100 < 360) {
      await pointsFilter(indexAngle / 100, distIndex);
    }
  }

  // Verify if start new turn from LiDAR sensor
  // if (endAngle < initAngle) {
  //   const avgMove = await moveCalc(); //|| [0,0]

  //   msrValues["move"].x += avgMove[0];
  //   msrValues["move"].y += avgMove[1];
  // }
  return;
}


setInterval(async () => {
  msrValues["xyz"] = Object.keys(msrValues["avgValues"]).map((angle) =>
    dataServices.lidarToXYZ(angle, msrValues["avgValues"][angle])
  );
  // console.log(msrValues);
  pointsCoordinates = msrValues["xyz"];

  // // Dentro da função bufferReceive, após atualizar pointsCoordinates:
  // pointsGeometry.dispose(); // Limpe a geometria antiga
  // pointsGeometry = new BufferGeometry(); // Crie uma nova geometria
  // const newPositions = []; // Array para as novas posições

  // // Popule o novo array de posições com as novas coordenadas
  // pointsCoordinates.forEach((coord) => {
  //   newPositions.push(coord.x / 100, coord.y / 100, coord.z / 100);
  // });

  // // Atribua as novas posições à geometria dos pontos
  // pointsGeometry.setAttribute(
  //   "position",
  //   new Float32BufferAttribute(newPositions, 3)
  // );

  // // Sinalize que a geometria foi atualizada
  // pointsGeometry.attributes.position.needsUpdate = true;

  // console.log(msrValues["lastValues"][270]);
  // console.log(parseInt(msrValues["avgValues"][90]), " / ", parseInt(msrValues["avgValues"][270]));
}, 100);
