# 🎛️ MusicX Studio — Web FL Studio Channel Rack

> Protótipo de uma estação de trabalho de áudio digital (DAW) focada no clássico **Channel Rack** do FL Studio, construída 100% com tecnologias web nativas (**HTML5, CSS3 e Web Audio API**) sem nenhuma dependência externa ou arquivos de áudio pré-gravados.

---

## 🌟 Visão Geral

O **MusicX Studio** recria no navegador a experiência icônica do sequenciador de passos (Step Sequencer) do FL Studio. Todos os instrumentos (Kick, Snare, Hi-Hat, Clap e Bass 303) são **sintetizados em tempo real** através de osciladores, filtros biquad e geradores de ruído da própria **Web Audio API**.

---

## ✨ Principais Funcionalidades

- **🎹 Sequenciador de 16 Passos (4/4)**:
  - Divisão visual clássica de 4 em 4 passos (blocos alternados em carvão e laranja característicos).
  - Pré-escuta instantânea do som ao clicar e ativar qualquer *pad*.
  - Indicador visual luminoso e sincronizado com o passo atual em reprodução (*playhead*).

- **🔊 Síntese Sonora em Tempo Real (Zero Samples / Zero Downloads)**:
  - Nenhum arquivo `.wav` ou `.mp3` é baixado. Todo o áudio é sintetizado matematicamente no processador do navegador.
  - Carregamento instantâneo e funcionamento 100% offline.

- **🎚️ Controles por Canal**:
  - **Mute LED**: Ative ou silencie qualquer canal individualmente com um clique no LED verde.
  - **Knob de Volume (V)**: Controle de ganho dedicado para cada instrumento (0 a 100%).
  - **Pré-visualização do Nome**: Estilo industrial e display dos canais.

- **⏱️ Motor de Tempo e Transporte de Alta Precisão**:
  - **BPM Ajustável**: Fader de andamento com controle em tempo real de 60 a 180 BPM.
  - **Displays LCD Retrô**: Leituras digitais verdes para o andamento (BPM) e para o passo atual (`STEP 01` a `16`).
  - **Algoritmo Lookahead Scheduler**: Implementação do padrão de temporização precisa de áudio web (*A Tale of Two Clocks*), garantindo que a reprodução não sofra engasgos (*jitter*) causados pela renderização da interface.

---

## 🔬 Arquitetura de Síntese Sonora

Cada canal possui seu próprio circuito virtual construído com nós de áudio nativos:

| Canal | Instrumento | Método de Síntese | Características Técnicas |
| :--- | :--- | :--- | :--- |
| **Kick 808** | Bumbo Sub | Oscilador Senoidal + Modulação de Pitch | Queda exponencial de frequência (150 Hz $\to$ 0.01 Hz) em 400ms com curva rápida de ganho. |
| **Snare Hard** | Caixa | Ruído Branco + Highpass Filter | Buffer de ruído aleatório cortado em 1000 Hz com decaimento acentuado de 180ms. |
| **Hat Closed** | Chimbal Fechado | Ruído Branco + Highpass Filter Extremo | Buffer de ruído filtrado em 7000 Hz com decaimento ultracurto de 50ms. |
| **Clap 90s** | Palma Vintage | Ruído Branco + Bandpass Filter | Filtro passa-faixa centrado em 1200 Hz ($Q=2$) com envelope de 220ms. |
| **303 Bass** | Baixo Ácido | Oscilador Dente de Serra (Sawtooth) + Lowpass Sweep | Inspirado no lendário Roland TB-303 (Nota C2 / 65.41 Hz) com varredura dinâmica de corte de filtro (600 Hz $\to$ 120 Hz). |

---

## 📁 Estrutura do Projeto

```
musicx-studio/
├── .devcontainer/
│   └── devcontainer.json   # Configuração para GitHub Codespaces (Live Server e portas)
├── index.html              # Aplicação completa (Estrutura, Estilização e Audio Engine)
├── package.json            # Scripts de desenvolvimento rápido
└── README.md               # Documentação do projeto
```

---

## 🚀 Como Executar

### 1. Diretamente no Navegador (Sem instalar nada)
Basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Safari, Brave).

### 2. Com Servidor Local (Node.js)
Se você tiver o Node.js instalado:
```bash
npm run dev
# ou
npx serve .
```
Acesse em: `http://localhost:3000`

### 3. No GitHub Codespaces (Na Nuvem)
Este repositório já conta com **Dev Containers** configurados:
1. No topo do repositório no GitHub, clique no botão **Code** > aba **Codespaces**.
2. Clique em **Create codespace on main**.
3. O ambiente será montado com a extensão **Live Server** pré-instalada.
4. Clique em **"Go Live"** no rodapé do VS Code ou execute `npm run dev` no terminal integrado.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível.
- **CSS3 Moderno**: Variáveis CSS (Custom Properties), Flexbox, gradientes, sombras internas simulando hardware analógico (*skeuomorphism*) e micro-animações.
- **JavaScript (ES6+)**: Lógica reativa do sequenciador e gerenciamento de estado.
- **Web Audio API**: `AudioContext`, `OscillatorNode`, `AudioBufferSourceNode`, `BiquadFilterNode`, `GainNode` e `StereoPannerNode`.

---

## 🗺️ Roadmap de Evoluções Futuras

- [ ] **Piano Roll**: Edição melódica com notas em diferentes alturas para o sintetizador 303.
- [ ] **Carregador de Samples**: Suporte a *drag-and-drop* de arquivos `.wav`/`.mp3` locais do usuário.
- [ ] **Mixer de Efeitos**: Rack de masterização com Reverb, Delay e Distorção/Overdrive.
- [ ] **Suporte a Múltiplos Patterns**: Criação e encadeamento de padrões para composição de músicas completas.
- [ ] **Suporte a MIDI**: Conexão com teclados e controladores MIDI físicos via Web MIDI API.
- [ ] **Exportação de Áudio**: Exportação do beat em arquivo `.wav` via `OfflineAudioContext`.

---

## 📄 Licença

Este projeto é de código aberto sob a licença [MIT](https://opensource.org/licenses/MIT).
