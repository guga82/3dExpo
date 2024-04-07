# App Lidar

Aplicativo para smartphone para realizar a leitura 3D de objetos e ambientes usando sensor lidar


## Visão Geral

Projeto desenvolvido a princípio para fazer a leitura de Silos e Armazens de grãos. O Aplicativo irá gerar nuvens de pontos com coordenadas medidas pelo sensor Lidar em conjunto com o Smartphone.
Além desta coleta de dados, também haverá uma tela para calcular a medição e fazer correções e conversões nas medições encontradas

## Desafios

Utilizar sensores de mercado e fácil substituição e em conjunto com as tecnologias do smartphones realizar as medições de grandes objetos com baixo custo.

Usar:
   - Barometro para alterar medir altura
   - Acelerometro para medir a inclinação do sensor
   - Magnetometro para a orientação do sensor (confirmar a necessidade)

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/guga82/appLidar.git

   
## Versões
1.0.0 - Versão inicial -> Leitura dos sensores do acelerômetro do smartphone
1.0.1 - Filtro para leitura do sensor Lidar
1.0.2 - Giro para captar leitura 3D


## Pendências
- Verificar estabilizaçao da leitura para disparo
- Melhorar suavização dos pontos (eliminar ruídos)
   - detectar retas ou tendências
   - detectar pontos fora das retas ou tendências
- Detectar padrões (retas)
- Transformar leitura em pontos ao invés de conectar por linhas
- Leitura de deslocamentos de altura e lateral
- Leitura de deslocamento de angulos
- Tela para cálculos de sacos
- 


- Corrigir giro do sensor pelo eixo Y (tela pra cima) ou X (tela para frente)


## Próximos passos
- Calcular o perímetro total
- Extrair o diâmetro/raio do silo

