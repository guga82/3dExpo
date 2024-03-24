import * as FileSystem from "expo-file-system";
import { Share } from "react-native";
const collada = require('./collada')

class DataServices {
  // Pooling function
  async poolingData(data, newValue, size) {
    let dataTmp = [...data];

    if (dataTmp.length >= size) {
      dataTmp.shift();
    }

    newValue !== "" ? dataTmp.push(newValue) : "";

    return dataTmp;
  }

  // bytes group
  bytesGroup(data, high, low) {
    // Extraindo os bytes High e Low
    const highByte = parseInt(data[high], 16);
    const lowByte = parseInt(data[low], 16);

    // Combinação dos bytes High e Low
    return (highByte << 8) | lowByte;
  }

  // Função para converter ângulo e medida em coordinates XYZ
  async lidarToXYZ(angleDegrees, distance, z) {
    let coordinates = {};
    const angleRadians = (angleDegrees * Math.PI) / 180.0;
    const zRadians = (z * Math.PI) / 180.0;
    coordinates.x = parseInt(distance * Math.cos(angleRadians));
    coordinates.y = parseInt(distance * Math.sin(angleRadians));
    // coordinates.z = z === undefined ? 0 : z;
    coordinates.z = parseInt(distance * Math.cos(zRadians));
    return coordinates;
  }

  // Function to calculate the opposite angle of a given angle
  calculateOppositeAngle(angle) {
    // Check if the angle is within the range [0, 360]
    if (angle < 0 || angle > 360) {
      throw new Error("The angle must be within the range [0, 360] degrees.");
    }

    // Calculate the opposite angle by adding 180 degrees to the given angle
    let oppositeAngle = angle + 180;

    // If the opposite angle exceeds 360 degrees, subtract 360 to keep the value within the range [0, 360]
    if (oppositeAngle > 360) {
      oppositeAngle -= 360;
    }

    return oppositeAngle;
  }

  // Pipe the data into another stream (like a parser or standard out)
  async averageCalcSemOutliers(
    data,
    desviosPadraoLimite,
    fAverageCalc,
    fCalcStdDeviation
  ) {
    // Ordena os dados
    const orderedData = [...data].sort((a, b) => {
      if (a > b) return 1;
      else if (a < b) return -1;
      else return 0;
    });

    // Calcula a média e o desvio padrão
    const media = await fAverageCalc(orderedData);
    const stdDeviation = await fCalcStdDeviation(orderedData, media);

    // Filtra os valores que não são considerados outliers
    const filteredData = orderedData.filter((valor) => {
      const distanciaEmDesviosPadrao = Math.abs(valor - media) / stdDeviation;
      return desviosPadraoLimite > 0
        ? distanciaEmDesviosPadrao <= desviosPadraoLimite
        : true;
    });

    // Calcula a média dos valores filtrados

    return await fAverageCalc(filteredData);
  }

  async averageCalc(data) {
    if (data[0] === undefined) {
      return 0;
    }
    return (
      (await data.reduce((acc, valor) => acc + parseInt(valor), 0)) /
      data.length
    );
  }

  async calcStdDeviation(data, media) {
    const diferencaQuadrada = await data.map((valor) =>
      Math.pow(valor - media, 2)
    );
    const variancia =
      diferencaQuadrada.reduce((acc, valor) => acc + valor, 0) / data.length;
    return Math.sqrt(variancia);
  }

  // Função para calcular a média dos valores de um array
  async avgCalc(array) {
    // Verifica se o array está vazio
    if (array.length === 0) {
      return 0; // Retorna 0 se o array estiver vazio para evitar divisão por zero
    }

    // Usa o método reduce para somar todos os valores do array
    const sum = await array.reduce((acc, value) => (acc += value), 0);

    // Calcula a média dividindo a soma pelo número de elementos no array
    const average = sum / array.length;

    return average;
  }

  async colladaSave(conteudo) {
    const xmlCollada = await collada(conteudo)
    console.log("iniciando salvamento do arquivo com o conteudo: ", xmlCollada )
    const filePath = `${FileSystem.cacheDirectory}cloudPoints.pdf`;

    try {
      await FileSystem.writeAsStringAsync(filePath, xmlCollada);
      console.log("File has been saved");
    } catch (erro) {
      console.error("Error to save the file:", erro);
    }
    return filePath;
  }

  async shareFile(receivedFilePath) {
    const fileToSend = await FileSystem.readAsStringAsync(receivedFilePath);

    await Share.share({
      title: "cloudPoints",
      message: fileToSend,
      url: receivedFilePath,
    });
  }
}

export default new DataServices();
