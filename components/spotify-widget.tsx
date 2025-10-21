import React, { useState } from 'react';
import { Music, X } from 'lucide-react';

type SpotifyWidgetProps = {
  playlistId: string;
  position?: 'left' | 'right';
  /** Tema del reproductor: 0 = claro, 1 = oscuro (por defecto). */
  theme?: 0 | 1;
};

export const SpotifyWidget = ({
  playlistId,
  position = 'right',
  theme = 1,
}: SpotifyWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=${theme}`;
  const isRight = position === 'right';

  const positionClasses = `fixed bottom-6 sm:bottom-4 ${
    isRight ? 'right-4 sm:right-6' : 'left-4 sm:left-6'
  } z-50`;

  return (
    <div className={positionClasses}>
      <div
        className={`shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden
          ${
            isOpen
              ? 'w-[320px] max-w-[90vw] sm:max-w-xs h-auto rounded-xl bg-white/10 dark:bg-gray-900/70 border border-gray-300/20'
              : 'w-12 h-12 sm:w-14 sm:h-14 rounded-full hover:bg-primary border-2 border-primary'
          }`}
      >
        {/* Botón toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-full h-full text-white transition-colors duration-200 ${
            isOpen
              ? 'justify-between p-3 bg-black/60 hover:bg-black/80 rounded-t-xl rounded-b-none'
              : 'rounded-full'
          } font-semibold cursor-pointer`}
          aria-expanded={isOpen}
          aria-controls="spotify-embed-content"
          aria-label={isOpen ? 'Cerrar reproductor' : 'Abrir reproductor de Spotify'}
        >
          {isOpen ? (
            <>
              <div className="flex items-center gap-1">
                <Music className="w-5 h-5" />
                <span className="text-xs font-medium leading-none">Ocultar</span>
              </div>
              <X className="w-5 h-5" />
            </>
          ) : (
            <Music className="w-6 h-6 animate-pulse leading-none inline-block" />
          )}
        </button>

        {/* Contenido del iframe */}
        <div
          id="spotify-embed-content"
          className={`p-2 pt-0 transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
           <iframe
            style={{ borderRadius: '8px' }}
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Spotify Playlist Embed"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
