import { useCallback } from 'react';

export const usePoster = (defaultPoster: string = '/images/posters/defaultPoster.png') => {
  const handlePosterError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {    
    if (e.currentTarget.src !== defaultPoster) {
      e.currentTarget.src = defaultPoster;
    }
  }, [defaultPoster]);

  const getPosterSrc = useCallback((src?: string) => {
    return src || defaultPoster;
  }, [defaultPoster]);

  return { handlePosterError, getPosterSrc };
};