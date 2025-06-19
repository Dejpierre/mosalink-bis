// Service pour l'intégration Apple Music
// Note: En production, vous devrez configurer MusicKit JS avec votre Developer Token

export interface AppleMusicSearchResult {
  id: string;
  type: 'songs' | 'albums' | 'playlists' | 'artists';
  attributes: {
    name: string;
    artistName?: string;
    albumName?: string;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    previews?: Array<{
      url: string;
    }>;
    url?: string;
    isrc?: string;
    releaseDate?: string;
    genreNames?: string[];
    durationInMillis?: number;
    trackNumber?: number;
    discNumber?: number;
  };
}

export interface AppleMusicSearchResponse {
  results: {
    songs?: { data: AppleMusicSearchResult[] };
    albums?: { data: AppleMusicSearchResult[] };
    playlists?: { data: AppleMusicSearchResult[] };
    artists?: { data: AppleMusicSearchResult[] };
  };
}

class AppleMusicService {
  private developerToken: string | null = null;
  private musicKit: any = null;
  private currentAudio: HTMLAudioElement | null = null;

  // Initialiser MusicKit (nécessite un Developer Token Apple Music)
  async initialize(developerToken?: string) {
    if (typeof window === 'undefined') return;

    try {
      // En mode développement, on simule les données
      if (!developerToken) {
        console.log('🎵 Apple Music en mode simulation (pas de Developer Token)');
        return;
      }

      this.developerToken = developerToken;

      // Charger MusicKit JS
      if (!window.MusicKit) {
        await this.loadMusicKitScript();
      }

      // Configurer MusicKit
      this.musicKit = window.MusicKit.configure({
        developerToken: this.developerToken,
        app: {
          name: 'Bento Grid Editor',
          build: '1.0.0'
        }
      });

      console.log('✅ Apple Music service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Apple Music service:', error);
    }
  }

  private async loadMusicKitScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MusicKit script'));
      document.head.appendChild(script);
    });
  }

  // Rechercher du contenu Apple Music
  async search(query: string, types: string[] = ['songs', 'albums', 'artists']): Promise<AppleMusicSearchResult[]> {
    if (!query.trim()) return [];

    // Mode simulation pour le développement
    if (!this.musicKit) {
      return this.simulateSearch(query, types);
    }

    try {
      const response = await this.musicKit.api.search(query, {
        types: types.join(','),
        limit: 10
      });

      const results: AppleMusicSearchResult[] = [];

      // Traiter les résultats
      types.forEach(type => {
        const typeResults = response.results[type];
        if (typeResults && typeResults.data) {
          results.push(...typeResults.data);
        }
      });

      return results;
    } catch (error) {
      console.error('Apple Music search error:', error);
      return this.simulateSearch(query, types);
    }
  }

  // Simulation pour le développement avec des URLs audio réelles
  private simulateSearch(query: string, types: string[]): AppleMusicSearchResult[] {
    const mockResults: AppleMusicSearchResult[] = [];

    if (types.includes('songs')) {
      mockResults.push(
        {
          id: 'song-1',
          type: 'songs',
          attributes: {
            name: `${query} - Chanson Populaire`,
            artistName: 'Artiste Célèbre',
            albumName: 'Album Fantastique',
            artwork: {
              url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
              width: 400,
              height: 400
            },
            previews: [{
              url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
            }],
            url: 'https://music.apple.com/song/sample',
            genreNames: ['Pop', 'Rock'],
            durationInMillis: 210000,
            releaseDate: '2024-01-01'
          }
        },
        {
          id: 'song-2',
          type: 'songs',
          attributes: {
            name: `Bohemian Rhapsody`,
            artistName: 'Queen',
            albumName: 'A Night at the Opera',
            artwork: {
              url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
              width: 400,
              height: 400
            },
            previews: [{
              url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
            }],
            url: 'https://music.apple.com/song/bohemian-rhapsody',
            genreNames: ['Rock', 'Classic Rock'],
            durationInMillis: 355000,
            releaseDate: '1975-10-31'
          }
        }
      );
    }

    if (types.includes('albums')) {
      mockResults.push({
        id: 'album-1',
        type: 'albums',
        attributes: {
          name: `${query} - Album Complet`,
          artistName: 'Artiste Talentueux',
          artwork: {
            url: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400',
            width: 400,
            height: 400
          },
          url: 'https://music.apple.com/album/sample',
          genreNames: ['Alternative', 'Indie'],
          releaseDate: '2024-01-01'
        }
      });
    }

    if (types.includes('artists')) {
      mockResults.push({
        id: 'artist-1',
        type: 'artists',
        attributes: {
          name: `${query} Artist`,
          artwork: {
            url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            width: 400,
            height: 400
          },
          url: 'https://music.apple.com/artist/sample',
          genreNames: ['Pop', 'Electronic']
        }
      });
    }

    return mockResults.filter(result => types.includes(result.type));
  }

  // Obtenir l'URL de l'artwork avec la taille souhaitée
  getArtworkUrl(artwork: any, size: number = 400): string {
    if (!artwork || !artwork.url) return '';
    return artwork.url.replace('{w}', size.toString()).replace('{h}', size.toString());
  }

  // Formater la durée en minutes:secondes
  formatDuration(durationInMillis: number): string {
    const minutes = Math.floor(durationInMillis / 60000);
    const seconds = Math.floor((durationInMillis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Convertir les résultats de recherche en données de carte
  convertToCardData(result: AppleMusicSearchResult) {
    const artwork = result.attributes.artwork;
    const artworkUrl = artwork ? this.getArtworkUrl(artwork, 800) : '';

    return {
      type: result.type.slice(0, -1) as 'song' | 'album' | 'playlist' | 'artist', // Remove 's' from plural
      id: result.id,
      name: result.attributes.name,
      artistName: result.attributes.artistName,
      albumName: result.attributes.albumName,
      artwork: artworkUrl,
      previewUrl: result.attributes.previews?.[0]?.url,
      appleMusicUrl: result.attributes.url,
      isrc: result.attributes.isrc,
      releaseDate: result.attributes.releaseDate,
      genreNames: result.attributes.genreNames,
      durationInMillis: result.attributes.durationInMillis,
      trackNumber: result.attributes.trackNumber,
      discNumber: result.attributes.discNumber
    };
  }

  // Autoriser l'utilisateur à se connecter à Apple Music
  async authorize(): Promise<boolean> {
    // En mode simulation, on simule une autorisation réussie
    if (!this.musicKit) {
      console.log('🎵 Simulation: Autorisation Apple Music réussie');
      return true;
    }

    try {
      await this.musicKit.authorize();
      return this.musicKit.isAuthorized;
    } catch (error) {
      console.error('Apple Music authorization failed:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur est autorisé
  isAuthorized(): boolean {
    // En mode simulation, on retourne toujours true
    if (!this.musicKit) {
      return true;
    }
    return this.musicKit ? this.musicKit.isAuthorized : false;
  }

  // Arrêter la lecture actuelle
  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // Jouer un aperçu avec gestion améliorée
  async playPreview(previewUrl: string): Promise<HTMLAudioElement | null> {
    if (!previewUrl) {
      console.warn('Pas d\'URL d\'aperçu disponible');
      return null;
    }

    try {
      // Arrêter la lecture précédente
      this.stopCurrentAudio();

      // Créer un nouvel élément audio
      const audio = new Audio();
      
      // Configuration de l'audio
      audio.crossOrigin = 'anonymous';
      audio.volume = 0.5;
      audio.preload = 'metadata';

      // Gestion des événements
      return new Promise((resolve, reject) => {
        audio.addEventListener('loadeddata', () => {
          console.log('✅ Audio chargé avec succès');
        });

        audio.addEventListener('canplay', async () => {
          try {
            this.currentAudio = audio;
            await audio.play();
            console.log('🎵 Lecture démarrée');
            
            // Arrêter après 30 secondes
            setTimeout(() => {
              if (this.currentAudio === audio) {
                this.stopCurrentAudio();
                console.log('⏹️ Lecture arrêtée automatiquement');
              }
            }, 30000);
            
            resolve(audio);
          } catch (playError) {
            console.error('❌ Erreur lors de la lecture:', playError);
            reject(playError);
          }
        });

        audio.addEventListener('error', (e) => {
          console.error('❌ Erreur de chargement audio:', e);
          reject(new Error('Impossible de charger l\'audio'));
        });

        // Charger l'audio
        audio.src = previewUrl;
        audio.load();
      });

    } catch (error) {
      console.error('❌ Erreur générale lors de la lecture:', error);
      throw error;
    }
  }

  // Vérifier si un audio est en cours de lecture
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  // Obtenir l'audio actuel
  getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }
}

export const appleMusicService = new AppleMusicService();

// Types pour TypeScript
declare global {
  interface Window {
    MusicKit: any;
  }
}