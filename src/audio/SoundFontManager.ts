import Soundfont, { Player } from 'soundfont-player';
import { SoundFont2 } from 'soundfont2';
import { Channel } from '../types';

export interface SoundFontPreset {
  id: string;
  name: string;
  category: 'keyboard' | 'strings' | 'bass' | 'guitar' | 'wind' | 'synth';
  icon: string;
}

export const SOUNDFONT_PRESETS: SoundFontPreset[] = [
  { id: 'acoustic_grand_piano', name: 'Acoustic Grand Piano', category: 'keyboard', icon: '🎹' },
  { id: 'electric_piano_1', name: 'Rhodes Electric Piano', category: 'keyboard', icon: '🎹' },
  { id: 'electric_bass_finger', name: 'Electric Bass (Finger)', category: 'bass', icon: '🎸' },
  { id: 'string_ensemble_1', name: 'String Ensemble / Violins', category: 'strings', icon: '🎻' },
  { id: 'acoustic_guitar_nylon', name: 'Nylon Acoustic Guitar', category: 'guitar', icon: '🎸' },
  { id: 'synth_brass_1', name: '80s Synth Brass', category: 'synth', icon: '🎺' },
  { id: 'flute', name: 'Orchestral Flute', category: 'wind', icon: '🪈' }
];

export class SoundFontManager {
  private static instance: SoundFontManager;
  private players: Map<string, Player> = new Map();
  private loadingPromises: Map<string, Promise<Player>> = new Map();

  // Armazenamento para SoundFonts customizados carregados via Drag & Drop (.sf2)
  private customSF2Buffers: Map<string, Map<number, AudioBuffer>> = new Map();

  private constructor() {}

  public static getInstance(): SoundFontManager {
    if (!SoundFontManager.instance) {
      SoundFontManager.instance = new SoundFontManager();
    }
    return SoundFontManager.instance;
  }

  /**
   * Carrega um instrumento SoundFont padrão (MusyngKite Bank)
   */
  public async loadPreset(presetId: string, ctx: AudioContext): Promise<Player> {
    if (this.players.has(presetId)) {
      return this.players.get(presetId)!;
    }

    if (this.loadingPromises.has(presetId)) {
      return this.loadingPromises.get(presetId)!;
    }

    const loadPromise = Soundfont.instrument(ctx, presetId as any, {
      soundfont: 'MusyngKite',
      format: 'mp3'
    }).then((player) => {
      this.players.set(presetId, player);
      this.loadingPromises.delete(presetId);
      return player;
    }).catch((err) => {
      this.loadingPromises.delete(presetId);
      console.error(`Erro ao carregar SoundFont ${presetId}:`, err);
      throw err;
    });

    this.loadingPromises.set(presetId, loadPromise);
    return loadPromise;
  }

  /**
   * Carrega e decodifica um arquivo .sf2 customizado solto pelo usuário
   */
  public async loadCustomSF2(file: File, ctx: AudioContext): Promise<{ id: string; name: string }> {
    const arrayBuffer = await file.arrayBuffer();
    const sf2 = new SoundFont2(new Uint8Array(arrayBuffer));

    const sfId = `custom-sf2-${Date.now()}`;
    const buffersMap = new Map<number, AudioBuffer>();

    // Extrai e converte amostras PCM do SF2 para AudioBuffers Web Audio
    sf2.samples.forEach((sample) => {
      const header = sample.header;
      if (!header || !header.sampleRate || header.sampleRate <= 0) return;
      const length = sample.data.length;
      if (length <= 0) return;

      try {
        const audioBuffer = ctx.createBuffer(1, length, header.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        const int16 = sample.data;

        for (let i = 0; i < length; i++) {
          const val = int16[i];
          channelData[i] = val < 0 ? val / 32768 : val / 32767;
        }

        const rootKey = (header.originalPitch > 0 && header.originalPitch <= 127) ? header.originalPitch : 60;
        buffersMap.set(rootKey, audioBuffer);
      } catch (e) {
        console.warn('Erro ao decodificar amostra do SoundFont:', e);
      }
    });

    this.customSF2Buffers.set(sfId, buffersMap);

    const name = sf2.metaData?.name || file.name.replace(/\.[^/.]+$/, '');
    return { id: sfId, name };
  }

  /**
   * Toca uma nota melódica via SoundFont com roteamento para o nó de destino (Mixer strip)
   */
  public playNote(
    channel: Channel,
    midiNote: number,
    time: number,
    duration: number,
    velocity: number,
    destNode: AudioNode,
    ctx: AudioContext
  ) {
    // 1. Toca SoundFont de Preset (Piano, Rhodes, Bass, Strings, etc.)
    if (channel.instrumentType === 'soundfont' && channel.soundfontPreset) {
      const player = this.players.get(channel.soundfontPreset);
      if (player) {
        player.play(midiNote, time, {
          gain: velocity,
          duration: Math.max(0.2, duration),
          destination: destNode
        });
        return;
      } else {
        // Se ainda não estava carregado em memória, dispara carregamento assíncrono
        this.loadPreset(channel.soundfontPreset, ctx);
      }
    }

    // 2. Toca SoundFont Customizado (.sf2) carregado via arquivo
    if (channel.instrumentType === 'custom_sf2' && channel.soundfontPreset) {
      const buffersMap = this.customSF2Buffers.get(channel.soundfontPreset);
      if (buffersMap && buffersMap.size > 0) {
        // Encontra a amostra mais próxima da nota MIDI solicitada
        let closestKey = 60;
        let minDiff = Infinity;
        for (const key of buffersMap.keys()) {
          const diff = Math.abs(key - midiNote);
          if (diff < minDiff) {
            minDiff = diff;
            closestKey = key;
          }
        }

        const buffer = buffersMap.get(closestKey);
        if (buffer) {
          const source = ctx.createBufferSource();
          source.buffer = buffer;

          // Pitch shift baseado na distância da nota raiz
          const semitoneDiff = midiNote - closestKey;
          source.playbackRate.value = Math.pow(2, semitoneDiff / 12);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(velocity, time);
          gain.gain.setValueAtTime(velocity * 0.9, time + duration - 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

          source.connect(gain);
          gain.connect(destNode);

          source.start(time);
          source.stop(time + duration);
          return;
        }
      }
    }
  }
}

export const soundFontManager = SoundFontManager.getInstance();
