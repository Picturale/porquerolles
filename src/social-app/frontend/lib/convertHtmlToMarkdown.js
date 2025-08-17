/**
 * Utilitaire pour convertir le HTML en format mixte Markdown/HTML
 */

// Convertit le HTML généré par l'éditeur en format de stockage (markdown/html mixte)
export const htmlToMarkdown = (html) => {
  if (!html) return '';
  
  let result = html;
  
  // Convertir les balises <strong> en **texte**
  result = result.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  
  // Convertir les balises <blockquote> en > texte
  result = result.replace(/<blockquote>(.*?)<\/blockquote>/g, (match, content) => {
    const lines = content.split('<br>');
    return lines.map(line => `> ${line}`).join('\n');
  });
  
  // Préserver les alignements avec des div
  // Mais ne pas envelopper plusieurs fois
  result = result.replace(/<div style="text-align:\s*(left|center|right);">(.*?)<\/div>/g, 
    (match, align, content) => {
      // Si le contenu contient déjà une div d'alignement, ne pas la réenvelopper
      if (content.includes('style="text-align:')) {
        return content;
      }
      return `<div style="text-align: ${align};">${content}</div>`;
    });
  
  // Convertir les liens
  result = result.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
  
  // Convertir les sauts de ligne <br> en \n
  result = result.replace(/<br\s*\/?>/g, '\n');
  
  // Gérer les paragraphes et les divisions d'alignement
  // Récupérer l'alignement mais conserver uniquement le contenu textuel
  result = result.replace(/<div[^>]*?>(.+?)<\/div>/gs, (match, content) => {
    // Extraire l'alignement s'il existe
    const alignMatch = match.match(/style="text-align:\s*(left|center|right);"/);
    const alignment = alignMatch ? alignMatch[1] : null;
    
    // Si c'est un paragraphe aligné, préserver l'alignement
    if (alignment && alignment !== 'left') {
      return `<div style="text-align: ${alignment};">${content}</div>`;
    }
    
    // Sinon, juste retourner le contenu
    return content;
  });
  
  // Préserver les balises hr pour les séparateurs horizontaux
  result = result.replace(/<hr\s*\/?>/g, '<hr>');
  
  // Préserver les balises a pour les liens si elles n'ont pas déjà été converties
  result = result.replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/g, (match, url, text) => {
    // Si le lien ne contient pas de [text](url), le préserver tel quel
    if (!text.includes('[') && !text.includes(']')) {
      return `<a href="${url}">${text}</a>`;
    }
    return match;
  });
  
  // Nettoyer le HTML restant SAUF les balises div d'alignement, les hr et les a
  result = result.replace(/<(?!\/?div style="text-align:[^>]+>|hr[^>]*>|\/?a\s+href=[^>]+>)[^>]+(>|$)/g, '');
  
  return result;
};

// Convertit le format de stockage (markdown/html mixte) en HTML pour l'éditeur
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  let result = markdown;
  
  // Convertir les **texte** en <strong>
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convertir les > texte en <blockquote>
  result = result.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Préserver les alignements avec des div
  // Les div d'alignement ont déjà été préservées, ne pas les reconvertir
  
  // Convertir les liens [texte](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Préserver les balises hr
  if (markdown.includes('<hr>')) {
    result = result.replace(/<hr>/g, '<hr>');
  }
  
  // Préserver les liens HTML s'ils existent
  result = result.replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/g, (match) => match);
  
  // Convertir les sauts de ligne \n en <br>
  result = result.replace(/\n/g, '<br>');
  
  // Envelopper chaque paragraphe dans une div pour permettre l'alignement par paragraphe
  // Seulement si le paragraphe n'est pas déjà dans une div
  result = result.replace(/(.+?)(<br>|$)/g, (match, paragraph, ending) => {
    // Ne pas envelopper si c'est déjà dans une div ou un autre conteneur
    if (paragraph.trim() && 
        !paragraph.includes('<div') && 
        !paragraph.includes('<p') && 
        !paragraph.includes('<blockquote')) {
      return `<div>${paragraph}</div>${ending}`;
    }
    return match;
  });
  
  // Convertir les mentions et hashtags
  result = result.replace(/@([a-zA-Z0-9_]+)/g, '<span class="preview-mention">@$1</span>');
  result = result.replace(/#([a-zA-Z0-9_]+)/g, '<span class="preview-hashtag">#$1</span>');
  
  return result;
};
