import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Share } from "react-native";
import { Magnetometer, Barometer, Accelerometer } from "expo-sensors";
import {
  PerspectiveCamera,
  Scene,
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
let rotation360;
let bStartMeasure = false;
// let magX = [];
// let magY = [];
// let magZ = [];
// let xMagV = 0;
// let yMagV = 0;
// let zMagV = 0;

export default function App() {
  let barometerValues = [];
  let accelerometerValues = { x: [], y: [], z: [] };
  let magnetometerValues = { x: [], y: [], z: [] };
  let magnetometerAvg = { x: 0, y: 0, z: 0 };
  let magnetoMax = { x: 0, y: 0, z: 0 };
  let magnetoMin = { x: 0, y: 0, z: 0 };
  let magnetRot = { x: 0, y: 0, z: 0 };
  let accelerometerAvg = { x: 0, y: 0, z: 0 };
  let timeout;

  const barometerSizeAverage = 20;
  const magnetbarometerSizeAverage = 6;
  const accelerometerSizeAverage = 8;

  Magnetometer.setUpdateInterval(200);
  Magnetometer.addListener(async (res) => {
    magnetometerValues.x = await dataServices.poolingData(
      magnetometerValues.x,
      parseInt(res.x * 1000),
      magnetbarometerSizeAverage
    );

    magnetometerValues.y = await dataServices.poolingData(
      magnetometerValues.y,
      parseInt(res.y * 1000),
      magnetbarometerSizeAverage
    );

    magnetometerValues.z = await dataServices.poolingData(
      magnetometerValues.z,
      parseInt(res.z * 1000),
      magnetbarometerSizeAverage
    );
    return magnetometerUpdate();
  });

  function magnetometerUpdate() {
    dataServices
      .averageCalcSemOutliers(
        magnetometerValues.x,
        0,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
      .then((res) => {
        magnetometerAvg.x = parseInt(res);
        if (
          Math.abs(accelerometerAvg.z > 90) ||
          Math.abs(accelerometerAvg.z < 10)
        ) {
          if (parseInt(res) > magnetoMax.x) {
            magnetoMax.x = parseInt(res);
          }
          if (parseInt(res) < magnetoMin.x || magnetoMin.x === 0) {
            magnetoMin.x = parseInt(res);
          }
        }
      });
    dataServices
      .averageCalcSemOutliers(
        magnetometerValues.y,
        0,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
      .then((res) => {
        magnetometerAvg.y = parseInt(res);
        if (
          Math.abs(accelerometerAvg.y > 90) ||
          Math.abs(accelerometerAvg.y < 10)
        ) {
          if (parseInt(res) > magnetoMax.y) {
            magnetoMax.y = parseInt(res);
          }
          if (parseInt(res) < magnetoMin.y || magnetoMin.y === 0) {
            magnetoMin.y = parseInt(res);
          }
        }
      });
    dataServices
      .averageCalcSemOutliers(
        magnetometerValues.z,
        0,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
      .then((res) => {
        magnetometerAvg.z = parseInt(res);
        if (
          Math.abs(accelerometerAvg.x > 90) ||
          Math.abs(accelerometerAvg.x < 10)
        ) {
          if (parseInt(res) > magnetoMax.z) {
            magnetoMax.z = parseInt(res);
          }
          if (parseInt(res) < magnetoMin.z || magnetoMin.z === 0) {
            magnetoMin.z = parseInt(res);
          }
        }
      });

    return calcGiro();
  }

  function calcGiro() {
    Object.keys(magnetRot).forEach((eixo) => {
      magnetRot[eixo] = parseInt(
        (180 / Math.abs(magnetoMax[eixo] - magnetoMin[eixo])) *
          (magnetometerAvg[eixo] - magnetoMin[eixo])
      );
    });
    return updateGiroAng();
  }

  function updateGiroAng() {
    if (Math.abs(accelerometerAvg.x) > 90) {
      // Lateral para cima
      let rad = Math.atan(magnetometerAvg.z / magnetometerAvg.y);

      const degrees = parseInt(rad * (180 / Math.PI)) + 90;

      if (
        magnetRot.y > 105 ||
        (degrees > 150 && magnetRot.z > 90) ||
        (degrees < 15 && magnetRot.z < 10 && magnetRot.y > 90)
      ) {
        rotation360 = degrees + 180;
      } else {
        rotation360 = degrees;
      }

      // console.log(
      //   "giro: ",
      //   degrees,
      //   " - rot360: ",
      //   rotation360,
      //   " - x: ",
      //   magnetRot.x,
      //   " - y: ",
      //   magnetRot.y,
      //   " - z: ",
      //   magnetRot.z
      // );
    } else if (Math.abs(accelerometerAvg.y) > 90) {
      // Ponta para cima
      let rad = Math.atan(magnetometerAvg.z / magnetometerAvg.x);

      const degrees = parseInt(rad * (180 / Math.PI)) + 90;

      if (
        (magnetRot.z < 180 &&
          ((magnetRot.z > 0 && degrees > 130) || magnetRot.z > 10) &&
          magnetRot.x < 95) ||
        (degrees > 160 && magnetRot.z < 10 && magnetRot.x < 105) ||
        (degrees < 15 && magnetRot.z > 100 && magnetRot.x < 105)
      ) {
        rotation360 = degrees + 180;
      } else {
        rotation360 = degrees;
      }

      // console.log(
      //   "giro: ",
      //   degrees,
      //   " - rot360: ",
      //   rotation360,
      //   " - x: ",
      //   magnetRot.x,
      //   " - y: ",
      //   magnetRot.y,
      //   " - z: ",
      //   magnetRot.z
      // );
    } else if (Math.abs(accelerometerAvg.z) > 90) {
      // Tela para cima

      let rad = Math.atan(magnetometerAvg.x / magnetometerAvg.y);

      const degrees = parseInt(rad * (180 / Math.PI)) + 90;

      if (
        magnetRot.y > 105 ||
        (degrees > 150 && magnetRot.x > 90) ||
        (degrees < 10 && magnetRot.x < 10 && magnetRot.y > 60)
      ) {
        rotation360 = degrees + 180;
      } else {
        rotation360 = degrees;
      }
    }

    return bStartMeasure ? updateDegreeMov() : "";
  }

  setInterval(() => {
    // console.log("angulo: ", accelerometerAvg);
    // console.log("giro: ", rotation360);
  }, 1000);

  Accelerometer.setUpdateInterval(150);
  Accelerometer.addListener(async (res) => {
    accelerometerValues.x = await dataServices.poolingData(
      accelerometerValues.x,
      parseInt(res.x * 100),
      accelerometerSizeAverage
    );
    accelerometerValues.y = await dataServices.poolingData(
      accelerometerValues.y,
      parseInt(res.y * 100),
      accelerometerSizeAverage
    );
    accelerometerValues.z = await dataServices.poolingData(
      accelerometerValues.z,
      parseInt(res.z * 100),
      accelerometerSizeAverage
    );

    return accelerometerUpdate();
  });

  async function accelerometerUpdate() {
    accelerometerAvg.x = parseInt(
      await dataServices.averageCalcSemOutliers(
        accelerometerValues.x,
        2,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
    );
    accelerometerAvg.y = parseInt(
      await dataServices.averageCalcSemOutliers(
        accelerometerValues.y,
        2,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
    );
    accelerometerAvg.z = parseInt(
      await dataServices.averageCalcSemOutliers(
        accelerometerValues.z,
        2,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
    );
    return;
  }

  Barometer.setUpdateInterval(50);
  Barometer.addListener(async (res) => {
    // setPressure(res.pressure);
    // barometerValues.push(parseInt(res.pressure*10000))

    barometerValues = await dataServices.poolingData(
      barometerValues,
      parseInt(res.pressure * 1000),
      barometerSizeAverage
    );
    return barometerUpdate();
  });

  function barometerUpdate() {
    dataServices
      .averageCalcSemOutliers(
        barometerValues,
        0.9,
        dataServices.averageCalc,
        dataServices.calcStdDeviation
      )
      .then((res) => {
        // console.log(parseInt(res));
      });
  }

  // setInterval(barometerUpdate, 200);

  // const ws = new WebSocket("wss://echo.websocket.org");
  const ws = new WebSocket("ws://192.168.3.10:81");
  // const ws = new WebSocket("ws://192.168.43.12:81");
  // console.log("Iniciado WebSocket");

  ws.onopen = (event) => {
    console.log("Event data: ", event.data);
  };
  ws.onmessage = async function (event) {
    const lidarData = event.data.split(",");
    const lidarFiltered = await bufferReceive(lidarData);
    // console.log("Dados filtrados: ", lidarFiltered);
  };
  ws.onclose = function (event) {
    // console.log("closed, code is:", event.code);
  };

  useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  const onContextCreate = async (gl, reloadFunction) => {
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

    const updatePoints = () => {
      points = {};
      positions = [];
      scene.children = [];
      if (pointsCoordinates.length > 1) {
        console.log("updating points");
        pointsCoordinates.forEach((coord) => {
          positions.push(coord.x / 100, coord.y / 100, coord.z / 100);
        });
        pointsGeometry.setAttribute(
          "position",
          new Float32BufferAttribute(positions, 3)
        );
        points = new Points(pointsGeometry, pointsMaterial);
        scene.add(points);
      }
    };

    // const updatePoints = () => {
    //   let newPositions = []
    //   pointsCoordinates.forEach((coord) => {
    //     newPositions.push(coord.x / 100, coord.y / 100, coord.z / 100);
    //   });
    //   // console.log(points)
    //   // positions = [];
    //   // if (pointsCoordinates.length > 100) {
    //   //   console.log("updating points")
    //   //   pointsCoordinates.forEach((coord) => {
    //   //     positions.push(coord.x / 100, coord.y / 100, coord.z / 100);
    //   //   });
    //   //   pointsGeometry.setAttribute(
    //   //     "position",
    //   //     new Float32BufferAttribute(positions, 3)
    //   //   );
    //   //   pointsGeometry.attributes.position.needsUpdate = true; // Indica que os atributos foram atualizados
    //   // }
    //   return points.geometry.attributes.position = newPositions
    // };

    setInterval(updatePoints, 15000);

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

  const stopMeasure = async () => {
    console.log("stop measure");
    bStartMeasure = false;
    compile();
  };

  const startMeasure = async () => {
    console.log("start measure");
    msrValues["degreeMov"] = {};
    bStartMeasure = true;
  };

  const styles = StyleSheet.create({
    temporario: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    container: {
      flex: 1,
    },
    draw: {
      height: 700,
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
      height: 20,
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
      <GLView style={styles.draw} onContextCreate={onContextCreate} />
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
      {/* <View style={styles.temporario}> */}

      {/* <Text>Pressure: {averagePressure} hPa</Text> */}
      {/* </View> */}
      <View style={styles.buttonContainer}>
        {/* <Text style={styles.text}>x: {x}</Text>
        <Text style={styles.text}>y: {y}</Text>
        <Text style={styles.text}>z: {z}</Text> */}
        {/* <Text style={styles.text}>media: {averagePressure.toFixed(3)}</Text> */}
        {/* <Text style={styles.text}>localização: {text}</Text> */}
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
            icon="stop"
            label="stop"
            onPress={stopMeasure}
            style={styles.leftButton}
          />
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
          <IconButton
            icon="start"
            label="start"
            onPress={startMeasure}
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
  xyz: [],
  move: { x: 0, y: 0 },
  lastMoves: [],
  zReg: {},
  degreeMov: {},
};
const tol = 0.3;
const elQtyMovDetect = -4; // Quantity of elements of array to average the moves
const qtyMsgAvgCalc = 20; // Quantity of measures to calculate the average
//36 ms = 5cm
let measureStarted;
let zAxis = 0;
let counter = 0;
const incrZ = 50;

async function pointsFilter(angle, distance) {
  let indexAngle = parseInt(angle);
  let indexDistance = parseInt(distance);

  msrValues["lastValues"][indexAngle] =
    msrValues["lastValues"][indexAngle] || [];

  if (msrValues["lastValues"][indexAngle].length >= qtyMsgAvgCalc) {
    let average = await dataServices.averageCalcSemOutliers(
      msrValues["lastValues"][indexAngle],
      tol,
      dataServices.averageCalc,
      dataServices.calcStdDeviation
    );
    average > 0 ? (msrValues["avgValues"][indexAngle] = average) : "";
    msrValues["lastValues"][indexAngle].shift();
  }

  indexDistance > 0 && indexAngle % 3 === 0
    ? msrValues["lastValues"][indexAngle].push(indexDistance)
    : "";
}

async function updateZaxis() {
  const newValues = { ...msrValues["avgValues"] };
  zAxis += 1; // normal é 50
  return (msrValues["zReg"][zAxis] = newValues);
}

async function updateDegreeMov() {
  const newValues = { ...msrValues["avgValues"] };
  return (msrValues["degreeMov"][rotation360] = newValues);
}

async function bufferReceive(data) {
  counter++;
  if (counter > 1000) {
    counter = 0;
  }
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

  // Check all angles received
  for (let index = 1; index < qtyAngles; index++) {
    let indexAngle = initAngle + index * incAngle;
    let distIndex = parseInt(
      dataServices.bytesGroup(data, 7 + index * 3, 8 + index * 3)
    );

    if (indexAngle / 100 < 360) {
      await pointsFilter(indexAngle / 100, distIndex);
    }
  }

  return;
}

const xyzGenerate = async () => {
  msrValues["xyz"] = [];
  pointsCoordinates = [];
  console.log("iniciando compilação: ", new Date());

  return new Promise((resolve, reject) => {
    if (msrValues["zReg"] && false) {
      Object.keys(msrValues["zReg"]).forEach((zReg) => {
        Object.keys(msrValues["zReg"][zReg]).forEach(async (angle) => {
          await dataServices
            .lidarToXYZ(
              angle,
              msrValues["zReg"][zReg][angle],
              parseInt(zReg * incrZ)
            )
            .then((res) => msrValues["xyz"].push(res));
        });
      });
    } else if (msrValues["degreeMov"]) {
      // console.log("Valores recebidos: ", msrValues['degreeMov'])
      Object.keys(msrValues["degreeMov"]).forEach(async (degreeMag) => {
        // console.log('degreeMag: ', degreeMag)
        if (degreeMag % 5 === 0) {
          Object.keys(msrValues["degreeMov"][degreeMag]).forEach(
            async (degreeLidar) => {
              resolve(
                await dataServices
                  .lidarToXYZ(
                    degreeLidar,
                    msrValues["degreeMov"][degreeMag][degreeLidar],
                    0
                  )
                  .then(async (res) => {
                    await dataServices
                      .lidarToXYZ(degreeMag, res.x, 0)
                      .then((res2) => {
                        return msrValues["xyz"].push({
                          x: res2.y,
                          y: res.y,
                          z: res2.x,
                        });
                      });
                  })
                  .catch((err) => console.log(err))
              );
            }
          );
        }
      });
    }

    // return (
    //   pointsCoordinates = msrValues["xyz"],
    //   console.log("Finalizando compilação: ", new Date()),
    //   console.log("Dados xyz: ", msrValues["xyz"]),
    //   dataServices.shareFile(await dataServices.colladaSave(msrValues["xyz"]))
    // );
  });
};

function compile() {
  xyzGenerate().then(async () => {
    (pointsCoordinates = msrValues["xyz"]),
      dataServices.shareFile(await dataServices.colladaSave(msrValues["xyz"]));
  });
}
