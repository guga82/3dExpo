module.exports = async function (coordinates) {
  const dataServices = require("./dataServices").default;

  // Função para criar o conteúdo do arquivo COLLADA com uma nuvem de pontos
  async function createColladaPointCloud(positions) {
    const xml = `
          <?xml version="1.0" encoding="utf-8"?>
          <COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
              <asset>
                  <contributor>
                      <author>Seu Nome</author>
                  </contributor>
                  <created>YYYY-MM-DDTHH:MM:SSZ</created>
                  <modified>YYYY-MM-DDTHH:MM:SSZ</modified>
                  <unit name="meter" meter="1"/>
                  <up_axis>Z_UP</up_axis>
              </asset>
              <library_geometries>
                  <geometry id="pointCloud">
                      <mesh>
                          <source id="positions">
                              <float_array id="positions_array" count="${await positions.length}">${await positions.join(
      " "
    )}</float_array>
                              <technique_common>
                                  <accessor source="#positions_array" count="${
                                    (await positions.length) / 3
                                  }" stride="3">
                                      <param name="X" type="float"/>
                                      <param name="Y" type="float"/>
                                      <param name="Z" type="float"/>
                                  </accessor>
                              </technique_common>
                          </source>
                          <vertices id="vertices">
                              <input semantic="POSITION" source="#positions"/>
                          </vertices>
                          <lines count="${(await positions.length) / 6}">
                              <input semantic="VERTEX" source="#vertices" offset="0"/>
                              <p>${await generateIndices(positions.length)}</p>
                          </lines>
                      </mesh>
                  </geometry>
              </library_geometries>
              <library_visual_scenes>
                  <visual_scene id="Scene" name="Scene">
                      <node id="PointCloud" name="PointCloud">
                          <instance_geometry url="#pointCloud"/>
                      </node>
                  </visual_scene>
              </library_visual_scenes>
              <scene>
                  <instance_visual_scene url="#Scene"/>
              </scene>
          </COLLADA>
      `;
    return xml;
  }

  const pointSize = 8;
  
  // Função para gerar os índices das linhas
  async function generateIndices(positionsCount) {
    const indices = [];
    for (let i = 0; i < positionsCount / 3; i += 2) {
      indices.push(`${i} ${i + 1}`);
    }
    return indices.join(" ");
  }

  let positions
  console.log('compilando coordenadas: ', coordinates)

  try {
    positions = coordinates.reduce((acc, cur, index) => {
        // if (index > 1) {
        //   acc.push(coordinates[index - 1].x);
        //   acc.push(coordinates[index - 1].y);
        //   acc.push(coordinates[index - 1].z);
        // }
        acc.push(cur.x);
        acc.push(cur.y);
        acc.push(cur.z);
        acc.push(cur.x+pointSize);
        acc.push(cur.y+pointSize);
        acc.push(cur.z+pointSize);
        return acc;
      }, []);
  } catch (err){
    console.log('Falha ao tentar compilar coordenadas: ', err)
  }



  // Create file with collada format
  // const colladaContent = await createColladaPointCloud(positions, 12);

  return await createColladaPointCloud(positions)
};
