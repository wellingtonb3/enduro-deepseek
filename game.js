const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações do jogo
const roadWidth = 400; // Largura da pista (agora mais estreita, com duas faixas)
const segmentLength = 200; // Comprimento de cada segmento da pista
const drawDistance = 600; // Distância de renderização
const maxSpeed = 10; // Velocidade máxima do jogador
const minSpeed = 0; // Velocidade mínima (parado)
const acceleration = 0.1; // Aceleração ao pressionar a seta para cima
const deceleration = 0.1; // Desaceleração ao pressionar a seta para baixo

let playerX = 0; // Posição horizontal do jogador
let playerZ = 0; // Posição vertical do jogador (profundidade)
let playerSpeed = 0; // Velocidade atual do jogador (começa parado)
let playerLives = 3; // Vidas do jogador
let carsPassed = 0; // Contador de carros ultrapassados
let isAccelerating = false; // Estado de aceleração
let isBraking = false; // Estado de frenagem
let raceStarted = false; // Estado da corrida (só começa após o jogador acelerar)

// Competidores (carros na mesma direção, mas em outra faixa)
const competitors = [];
for (let i = 0; i < 10; i++) {
    competitors.push({
        x: Math.random() < 0.5 ? -roadWidth / 4 : roadWidth / 4, // Posição na faixa esquerda ou direita
        z: drawDistance + i * 100, // Posição inicial em um grid de largada
        speed: 0, // Começam parados
        maxSpeed: Math.random() * 3 + 2, // Velocidade máxima aleatória
        passed: false, // Indica se o competidor já foi ultrapassado
    });
}

// Função para renderizar a pista
function renderRoad() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawDistance; i += segmentLength) {
        const scale = 1 / (1 + i / drawDistance); // Escala para perspectiva

        const x1 = canvas.width / 2 - (roadWidth / 2) * scale;
        const x2 = canvas.width / 2 + (roadWidth / 2) * scale;
        const y1 = canvas.height - i;
        const y2 = canvas.height - (i + segmentLength);

        // Desenha a pista
        ctx.fillStyle = '#555';
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

        // Desenha as faixas da pista
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const laneWidth = (x2 - x1) / 2;
        ctx.moveTo(x1 + laneWidth, y1);
        ctx.lineTo(x1 + laneWidth, y2);
        ctx.stroke();
    }
}

// Função para renderizar o carro do jogador
function renderPlayer() {
    const playerScale = 1 / (1 + 0 / drawDistance); // Escala do jogador (fixa, pois está "perto" da câmera)
    const playerDrawX = canvas.width / 2 + playerX * playerScale;
    const playerDrawY = canvas.height - 80; // Posição Y fixa na parte inferior da tela

    // Desenha o carro do jogador
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerDrawX - 20, playerDrawY - 40, 40, 80); // Corpo do carro
    ctx.fillStyle = '#333';
    ctx.fillRect(playerDrawX - 15, playerDrawY - 35, 30, 60); // Janelas do carro
    ctx.fillStyle = 'black';
    ctx.fillRect(playerDrawX - 25, playerDrawY - 20, 10, 20); // Roda esquerda
    ctx.fillRect(playerDrawX + 15, playerDrawY - 20, 10, 20); // Roda direita
}

// Função para renderizar competidores
function renderCompetitors() {
    competitors.forEach((competitor) => {
        const scale = 1 / (1 + competitor.z / drawDistance);
        const x = canvas.width / 2 + competitor.x * scale;
        const y = canvas.height - competitor.z;

        // Desenha o competidor
        ctx.fillStyle = 'green';
        ctx.fillRect(x - 15, y - 30, 30, 60); // Corpo do carro
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 10, y - 25, 20, 50); // Janelas do carro
        ctx.fillStyle = 'black';
        ctx.fillRect(x - 20, y - 15, 10, 20); // Roda esquerda
        ctx.fillRect(x + 10, y - 15, 10, 20); // Roda direita
    });
}

// Função para verificar colisão com competidores
function checkCollision() {
    const playerScale = 1 / (1 + 0 / drawDistance);
    const playerDrawX = canvas.width / 2 + playerX * playerScale;
    const playerDrawY = canvas.height - 80; // Ajustado para a nova posição do carro

    competitors.forEach((competitor) => {
        const scale = 1 / (1 + competitor.z / drawDistance);
        const competitorX = canvas.width / 2 + competitor.x * scale;
        const competitorY = canvas.height - competitor.z;

        // Verifica se há colisão
        if (
            Math.abs(playerDrawX - competitorX) < 30 && // Distância horizontal
            Math.abs(playerDrawY - competitorY) < 60 // Distância vertical
        ) {
            // Colisão detectada!
            playerLives--; // Perde uma vida
            competitor.z = drawDistance; // Reseta a posição do competidor
            competitor.x = Math.random() < 0.5 ? -roadWidth / 4 : roadWidth / 4; // Posiciona em uma faixa aleatória

            // Feedback visual (tela treme)
            canvas.style.transform = 'translate(5px, 5px)';
            setTimeout(() => {
                canvas.style.transform = 'translate(0, 0)';
            }, 100);

            // Verifica se o jogador perdeu todas as vidas
            if (playerLives <= 0) {
                alert(`Game Over! Carros ultrapassados: ${carsPassed}`);
                resetGame();
            }
        }
    });
}

// Função para verificar se o jogador ultrapassou um competidor
function checkCarsPassed() {
    competitors.forEach((competitor) => {
        // Verifica se o jogador ultrapassou o competidor
        if (!competitor.passed && playerZ > competitor.z + 50) {
            carsPassed++; // Incrementa o contador de carros ultrapassados
            competitor.passed = true; // Marca o competidor como ultrapassado
        }
    });
}

// Função para resetar o jogo
function resetGame() {
    playerLives = 3;
    playerX = 0;
    playerZ = 0;
    playerSpeed = 0;
    carsPassed = 0;
    raceStarted = false; // A corrida só começa após o jogador acelerar
    competitors.forEach((competitor, i) => {
        competitor.z = drawDistance + i * 100; // Posição inicial em um grid de largada
        competitor.speed = 0; // Começam parados
        competitor.passed = false; // Reseta o estado de ultrapassagem
    });
}

// Função para atualizar competidores
function updateCompetitors() {
    if (!raceStarted) return; // Competidores só começam a se mover após o jogador acelerar

    competitors.forEach((competitor) => {
        // Competidores aceleram gradualmente
        if (competitor.speed < competitor.maxSpeed) {
            competitor.speed += 0.05;
        }
        competitor.z -= competitor.speed; // Competidores se movem na mesma direção que o jogador
        if (competitor.z < 0) {
            competitor.z = drawDistance; // Reseta a posição do competidor
            competitor.x = Math.random() < 0.5 ? -roadWidth / 4 : roadWidth / 4; // Posiciona em uma faixa aleatória
            competitor.passed = false; // Reseta o estado de ultrapassagem
        }
    });
}

// Controles
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        playerX -= 10; // Move para a esquerda
    } else if (e.key === 'ArrowRight') {
        playerX += 10; // Move para a direita
    } else if (e.key === 'ArrowUp') {
        isAccelerating = true; // Acelera o carro
        raceStarted = true; // Inicia a corrida
    } else if (e.key === 'ArrowDown') {
        isBraking = true; // Freia o carro
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        isAccelerating = false; // Para de acelerar
    } else if (e.key === 'ArrowDown') {
        isBraking = false; // Para de frear
    }
});

// Loop do jogo
function gameLoop() {
    renderRoad();
    renderPlayer();
    renderCompetitors(); // Renderiza os competidores
    updateCompetitors(); // Atualiza os competidores
    checkCollision();
    checkCarsPassed(); // Verifica se o jogador ultrapassou competidores

    // Atualiza a velocidade do jogador
    if (isAccelerating && playerSpeed < maxSpeed) {
        playerSpeed += acceleration;
    } else if (isBraking && playerSpeed > minSpeed) {
        playerSpeed -= deceleration;
    }

    playerZ += playerSpeed;

    // Exibe o contador de carros ultrapassados
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Carros ultrapassados: ${carsPassed}`, 20, 30);

    requestAnimationFrame(gameLoop);
}

resetGame(); // Inicia o jogo com todos os carros parados
gameLoop(); // Inicia o loop do jogo