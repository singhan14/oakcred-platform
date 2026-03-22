import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} - OakCred` : 'OakCred - Credit Intelligence Platform';
    
    // Force Safari to override its strict localhost port cache by actively mutating the icon hrefs
    const links = document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']");
    links.forEach(link => {
      link.href = link.href.split('?')[0] + '?v=' + new Date().getTime();
    });
    return () => { document.title = prev; };
  }, [title]);
}
