import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdnIcon } from '../cdn-icon/cdn-icon';

/** Iconos populares organizados por categoría para facilitar la selección */
const POPULAR_ICONS: { category: string; icons: string[] }[] = [
  {
    category: 'Comida',
    icons: ['UtensilsCrossed', 'Utensils', 'Coffee', 'Pizza', 'Apple', 'Beef', 'Cake', 'Cookie', 'IceCream', 'Wine'],
  },
  {
    category: 'Transporte',
    icons: ['Car', 'Bus', 'Train', 'Plane', 'Bike', 'Ship', 'Fuel', 'ParkingCircle', 'MapPin', 'Navigation'],
  },
  {
    category: 'Hogar',
    icons: ['Home', 'Building', 'Bed', 'Sofa', 'Lamp', 'Bath', 'Key', 'DoorOpen', 'Warehouse', 'Building2'],
  },
  {
    category: 'Servicios',
    icons: ['Zap', 'Wifi', 'Phone', 'Tv', 'Radio', 'Smartphone', 'Monitor', 'Lightbulb', 'Droplet', 'Flame'],
  },
  {
    category: 'Salud',
    icons: ['HeartPulse', 'Stethoscope', 'Pill', 'Syringe', 'Activity', 'Thermometer', 'Brain', 'Eye', 'Ear', 'Hand'],
  },
  {
    category: 'Educacion',
    icons: ['GraduationCap', 'Book', 'BookOpen', 'Pencil', 'School', 'Library', 'Notebook', 'FileText', 'Languages', 'Calculator'],
  },
  {
    category: 'Entretenimiento',
    icons: ['Gamepad2', 'Music', 'Film', 'Tv2', 'Headphones', 'Camera', 'Ticket', 'PartyPopper', 'Dice5', 'Drama'],
  },
  {
    category: 'Compras',
    icons: ['ShoppingCart', 'ShoppingBag', 'Store', 'CreditCard', 'Wallet', 'Receipt', 'Tag', 'Gift', 'Package', 'Shirt'],
  },
  {
    category: 'Trabajo',
    icons: ['Briefcase', 'Building2', 'Laptop', 'Monitor', 'Printer', 'FileSpreadsheet', 'PenTool', 'Presentation', 'Users', 'Calendar'],
  },
  {
    category: 'Otros',
    icons: ['Sparkles', 'Star', 'Heart', 'Settings', 'Tool', 'Wrench', 'Hammer', 'Scissors', 'Umbrella', 'Sun'],
  },
];

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [FormsModule, CdnIcon],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="close.emit()">
      <div
        class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="border-b border-slate-200 p-4">
          <h2 class="text-lg font-semibold text-slate-900">Seleccionar icono</h2>
          <p class="mt-1 text-sm text-slate-500">
            Elige un icono o escribe el nombre de cualquier icono de
            <a
              href="https://lucide.dev/icons/"
              target="_blank"
              rel="noopener"
              class="text-violet-600 underline hover:text-violet-700"
            >Lucide</a>
          </p>

          <!-- Buscador -->
          <div class="mt-3">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Buscar icono... (ej: Heart, Car, Music)"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        <!-- Contenido -->
        <div class="flex-1 overflow-y-auto p-4">
          @if (searchQuery().length > 0) {
            <!-- Modo búsqueda: mostrar el icono buscado -->
            <div class="mb-4">
              <p class="mb-2 text-sm font-medium text-slate-700">Vista previa:</p>
              <button
                type="button"
                (click)="selectIcon(searchQuery())"
                class="inline-flex items-center gap-2 rounded-lg border-2 border-violet-600 bg-violet-50 px-4 py-3 transition hover:bg-violet-100"
              >
                <app-cdn-icon [name]="searchQuery()" class="size-8 text-slate-700" />
                <span class="text-sm font-medium text-slate-900">{{ searchQuery() }}</span>
              </button>
            </div>
          }

          <!-- Grid de iconos populares -->
          @for (group of filteredIcons(); track group.category) {
            <div class="mb-6">
              <h3 class="mb-2 text-sm font-medium text-slate-500">{{ group.category }}</h3>
              <div class="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                @for (icon of group.icons; track icon) {
                  <button
                    type="button"
                    (click)="selectIcon(icon)"
                    class="flex size-10 items-center justify-center rounded-lg border-2 border-slate-200 bg-white transition hover:border-violet-400 hover:bg-violet-50"
                    [title]="icon"
                  >
                    <app-cdn-icon [name]="icon" class="size-5 text-slate-600" />
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-200 p-4">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPicker {
  /** Emite el nombre del icono seleccionado */
  iconSelected = output<string>();
  /** Emite cuando se cierra el modal */
  close = output<void>();

  protected searchQuery = signal('');

  protected filteredIcons = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return POPULAR_ICONS;

    return POPULAR_ICONS.map((group) => ({
      category: group.category,
      icons: group.icons.filter((icon) => icon.toLowerCase().includes(query)),
    })).filter((group) => group.icons.length > 0);
  });

  protected selectIcon(iconName: string): void {
    this.iconSelected.emit(iconName);
    this.close.emit();
  }
}
