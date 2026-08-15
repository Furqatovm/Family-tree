import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'FamilyTree — Oila Shajarasi va Merosini Asrang',
  description = 'Interaktiv oila shajarasi yaratish, avlodlar tarixi, fotosuratlari, jonli Oila Xaritasi va PDF kitob eksporti tizimi.',
  keywords = 'oila shajarasi, nasabnoma, shajara, family tree uzbekistan, genealogy',
}) => {
  useEffect(() => {
    // Dynamic document title
    document.title = title.includes('FamilyTree') ? title : `${title} | FamilyTree`;

    // Dynamic Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Dynamic Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Dynamic OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    // Dynamic OpenGraph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }, [title, description, keywords]);

  return null;
};
