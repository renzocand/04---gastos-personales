import { Injectable, signal } from '@angular/core';

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@latest/icons';

/**
 * Servicio para cargar iconos de Lucide desde CDN.
 * Los iconos se cachean en memoria para evitar requests repetidos.
 */
@Injectable({ providedIn: 'root' })
export class LucideCdnService {
  private cache = new Map<string, string>();
  private pending = new Map<string, Promise<string>>();

  /**
   * Carga un icono SVG desde el CDN de Lucide.
   * @param name Nombre del icono en kebab-case (ej: "utensils-crossed")
   * @returns Promise con el contenido SVG
   */
  async loadIcon(name: string): Promise<string> {
    const kebabName = this.toKebabCase(name);

    // Retornar de cache si existe
    if (this.cache.has(kebabName)) {
      return this.cache.get(kebabName)!;
    }

    // Si ya hay una petición pendiente, esperar esa
    if (this.pending.has(kebabName)) {
      return this.pending.get(kebabName)!;
    }

    // Hacer fetch al CDN
    const promise = this.fetchIcon(kebabName);
    this.pending.set(kebabName, promise);

    try {
      const svg = await promise;
      this.cache.set(kebabName, svg);
      return svg;
    } finally {
      this.pending.delete(kebabName);
    }
  }

  private async fetchIcon(kebabName: string): Promise<string> {
    try {
      const response = await fetch(`${CDN_BASE}/${kebabName}.svg`);
      if (!response.ok) {
        console.warn(`Icon "${kebabName}" not found, using fallback`);
        return this.getFallbackIcon();
      }
      return response.text();
    } catch (error) {
      console.warn(`Failed to load icon "${kebabName}":`, error);
      return this.getFallbackIcon();
    }
  }

  private getFallbackIcon(): string {
    // Icono "package" como fallback
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>`;
  }

  /**
   * Convierte PascalCase a kebab-case
   * Ej: "UtensilsCrossed" → "utensils-crossed"
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
  }
}
