import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LANG_STORAGE_KEY } from './i18n.config';
import { LanguageService } from './language.service';

/**
 * TC-12 / PA-19: cambio correcto de idioma de la interfaz. El servicio es el
 * único punto que muta el idioma (Transloco + localStorage + signal + <html lang>).
 */
describe('TC-12 / PA-19: LanguageService', () => {
  let transloco: { setActiveLang: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    transloco = { setActiveLang: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: transloco }],
    });
  });

  it('use(lang) actualiza Transloco, localStorage, el signal y <html lang>', () => {
    const service = TestBed.inject(LanguageService);

    service.use('en');

    expect(transloco.setActiveLang).toHaveBeenCalledWith('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(service.current()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('al arrancar lee el idioma guardado y lo sincroniza', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'qu');

    const service = TestBed.inject(LanguageService);

    expect(service.current()).toBe('qu');
    expect(document.documentElement.lang).toBe('qu');
  });

  it('idioma guardado inválido cae al idioma por defecto (es)', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'xx');

    expect(TestBed.inject(LanguageService).current()).toBe('es');
  });
});
