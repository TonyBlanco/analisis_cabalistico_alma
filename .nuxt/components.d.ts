
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'AnalysisDisplay': typeof import("../components/analysis-display")['default']
    'MandalaVisualization': typeof import("../components/mandala-visualization")['default']
    'MysticalForm': typeof import("../components/mystical-form")['default']
    'ThemeProvider': typeof import("../components/theme-provider")['default']
    'TreeOfLifeVisualization': typeof import("../components/tree-of-life-visualization")['default']
    'UiAccordion': typeof import("../components/ui/accordion")['default']
    'UiAlertDialog': typeof import("../components/ui/alert-dialog")['default']
    'UiAlert': typeof import("../components/ui/alert")['default']
    'UiAspectRatio': typeof import("../components/ui/aspect-ratio")['default']
    'UiAvatar': typeof import("../components/ui/avatar")['default']
    'UiBadge': typeof import("../components/ui/badge")['default']
    'UiBreadcrumb': typeof import("../components/ui/breadcrumb")['default']
    'UiButton': typeof import("../components/ui/button")['default']
    'UiCalendar': typeof import("../components/ui/calendar")['default']
    'UiCard': typeof import("../components/ui/card")['default']
    'UiCarousel': typeof import("../components/ui/carousel")['default']
    'UiCheckbox': typeof import("../components/ui/checkbox")['default']
    'UiCollapsible': typeof import("../components/ui/collapsible")['default']
    'UiCommand': typeof import("../components/ui/command")['default']
    'UiContextMenu': typeof import("../components/ui/context-menu")['default']
    'UiDateRangePicker': typeof import("../components/ui/date-range-picker")['default']
    'UiDialog': typeof import("../components/ui/dialog")['default']
    'UiDrawer': typeof import("../components/ui/drawer")['default']
    'UiDropdownMenu': typeof import("../components/ui/dropdown-menu")['default']
    'UiForm': typeof import("../components/ui/form")['default']
    'UiHoverCard': typeof import("../components/ui/hover-card")['default']
    'UiInputOtp': typeof import("../components/ui/input-otp")['default']
    'UiInput': typeof import("../components/ui/input")['default']
    'UiLabel': typeof import("../components/ui/label")['default']
    'UiMenubar': typeof import("../components/ui/menubar")['default']
    'UiNavigationMenu': typeof import("../components/ui/navigation-menu")['default']
    'UiPagination': typeof import("../components/ui/pagination")['default']
    'UiPopover': typeof import("../components/ui/popover")['default']
    'UiProgress': typeof import("../components/ui/progress")['default']
    'UiRadioGroup': typeof import("../components/ui/radio-group")['default']
    'UiResizable': typeof import("../components/ui/resizable")['default']
    'UiScrollArea': typeof import("../components/ui/scroll-area")['default']
    'UiSelect': typeof import("../components/ui/select")['default']
    'UiSeparator': typeof import("../components/ui/separator")['default']
    'UiSheet': typeof import("../components/ui/sheet")['default']
    'UiSkeleton': typeof import("../components/ui/skeleton")['default']
    'UiSlider': typeof import("../components/ui/slider")['default']
    'UiSonner': typeof import("../components/ui/sonner")['default']
    'UiSwitch': typeof import("../components/ui/switch")['default']
    'UiTable': typeof import("../components/ui/table")['default']
    'UiTabs': typeof import("../components/ui/tabs")['default']
    'UiTaskCard': typeof import("../components/ui/task-card")['default']
    'UiTextarea': typeof import("../components/ui/textarea")['default']
    'UiToast': typeof import("../components/ui/toast")['default']
    'UiToaster': typeof import("../components/ui/toaster")['default']
    'UiToggleGroup': typeof import("../components/ui/toggle-group")['default']
    'UiToggle': typeof import("../components/ui/toggle")['default']
    'UiTooltip': typeof import("../components/ui/tooltip")['default']
    'UiUseToast': typeof import("../components/ui/use-toast")['default']
    'VibrationChart': typeof import("../components/vibration-chart")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
      'LazyAnalysisDisplay': LazyComponent<typeof import("../components/analysis-display")['default']>
    'LazyMandalaVisualization': LazyComponent<typeof import("../components/mandala-visualization")['default']>
    'LazyMysticalForm': LazyComponent<typeof import("../components/mystical-form")['default']>
    'LazyThemeProvider': LazyComponent<typeof import("../components/theme-provider")['default']>
    'LazyTreeOfLifeVisualization': LazyComponent<typeof import("../components/tree-of-life-visualization")['default']>
    'LazyUiAccordion': LazyComponent<typeof import("../components/ui/accordion")['default']>
    'LazyUiAlertDialog': LazyComponent<typeof import("../components/ui/alert-dialog")['default']>
    'LazyUiAlert': LazyComponent<typeof import("../components/ui/alert")['default']>
    'LazyUiAspectRatio': LazyComponent<typeof import("../components/ui/aspect-ratio")['default']>
    'LazyUiAvatar': LazyComponent<typeof import("../components/ui/avatar")['default']>
    'LazyUiBadge': LazyComponent<typeof import("../components/ui/badge")['default']>
    'LazyUiBreadcrumb': LazyComponent<typeof import("../components/ui/breadcrumb")['default']>
    'LazyUiButton': LazyComponent<typeof import("../components/ui/button")['default']>
    'LazyUiCalendar': LazyComponent<typeof import("../components/ui/calendar")['default']>
    'LazyUiCard': LazyComponent<typeof import("../components/ui/card")['default']>
    'LazyUiCarousel': LazyComponent<typeof import("../components/ui/carousel")['default']>
    'LazyUiCheckbox': LazyComponent<typeof import("../components/ui/checkbox")['default']>
    'LazyUiCollapsible': LazyComponent<typeof import("../components/ui/collapsible")['default']>
    'LazyUiCommand': LazyComponent<typeof import("../components/ui/command")['default']>
    'LazyUiContextMenu': LazyComponent<typeof import("../components/ui/context-menu")['default']>
    'LazyUiDateRangePicker': LazyComponent<typeof import("../components/ui/date-range-picker")['default']>
    'LazyUiDialog': LazyComponent<typeof import("../components/ui/dialog")['default']>
    'LazyUiDrawer': LazyComponent<typeof import("../components/ui/drawer")['default']>
    'LazyUiDropdownMenu': LazyComponent<typeof import("../components/ui/dropdown-menu")['default']>
    'LazyUiForm': LazyComponent<typeof import("../components/ui/form")['default']>
    'LazyUiHoverCard': LazyComponent<typeof import("../components/ui/hover-card")['default']>
    'LazyUiInputOtp': LazyComponent<typeof import("../components/ui/input-otp")['default']>
    'LazyUiInput': LazyComponent<typeof import("../components/ui/input")['default']>
    'LazyUiLabel': LazyComponent<typeof import("../components/ui/label")['default']>
    'LazyUiMenubar': LazyComponent<typeof import("../components/ui/menubar")['default']>
    'LazyUiNavigationMenu': LazyComponent<typeof import("../components/ui/navigation-menu")['default']>
    'LazyUiPagination': LazyComponent<typeof import("../components/ui/pagination")['default']>
    'LazyUiPopover': LazyComponent<typeof import("../components/ui/popover")['default']>
    'LazyUiProgress': LazyComponent<typeof import("../components/ui/progress")['default']>
    'LazyUiRadioGroup': LazyComponent<typeof import("../components/ui/radio-group")['default']>
    'LazyUiResizable': LazyComponent<typeof import("../components/ui/resizable")['default']>
    'LazyUiScrollArea': LazyComponent<typeof import("../components/ui/scroll-area")['default']>
    'LazyUiSelect': LazyComponent<typeof import("../components/ui/select")['default']>
    'LazyUiSeparator': LazyComponent<typeof import("../components/ui/separator")['default']>
    'LazyUiSheet': LazyComponent<typeof import("../components/ui/sheet")['default']>
    'LazyUiSkeleton': LazyComponent<typeof import("../components/ui/skeleton")['default']>
    'LazyUiSlider': LazyComponent<typeof import("../components/ui/slider")['default']>
    'LazyUiSonner': LazyComponent<typeof import("../components/ui/sonner")['default']>
    'LazyUiSwitch': LazyComponent<typeof import("../components/ui/switch")['default']>
    'LazyUiTable': LazyComponent<typeof import("../components/ui/table")['default']>
    'LazyUiTabs': LazyComponent<typeof import("../components/ui/tabs")['default']>
    'LazyUiTaskCard': LazyComponent<typeof import("../components/ui/task-card")['default']>
    'LazyUiTextarea': LazyComponent<typeof import("../components/ui/textarea")['default']>
    'LazyUiToast': LazyComponent<typeof import("../components/ui/toast")['default']>
    'LazyUiToaster': LazyComponent<typeof import("../components/ui/toaster")['default']>
    'LazyUiToggleGroup': LazyComponent<typeof import("../components/ui/toggle-group")['default']>
    'LazyUiToggle': LazyComponent<typeof import("../components/ui/toggle")['default']>
    'LazyUiTooltip': LazyComponent<typeof import("../components/ui/tooltip")['default']>
    'LazyUiUseToast': LazyComponent<typeof import("../components/ui/use-toast")['default']>
    'LazyVibrationChart': LazyComponent<typeof import("../components/vibration-chart")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const AnalysisDisplay: typeof import("../components/analysis-display")['default']
export const MandalaVisualization: typeof import("../components/mandala-visualization")['default']
export const MysticalForm: typeof import("../components/mystical-form")['default']
export const ThemeProvider: typeof import("../components/theme-provider")['default']
export const TreeOfLifeVisualization: typeof import("../components/tree-of-life-visualization")['default']
export const UiAccordion: typeof import("../components/ui/accordion")['default']
export const UiAlertDialog: typeof import("../components/ui/alert-dialog")['default']
export const UiAlert: typeof import("../components/ui/alert")['default']
export const UiAspectRatio: typeof import("../components/ui/aspect-ratio")['default']
export const UiAvatar: typeof import("../components/ui/avatar")['default']
export const UiBadge: typeof import("../components/ui/badge")['default']
export const UiBreadcrumb: typeof import("../components/ui/breadcrumb")['default']
export const UiButton: typeof import("../components/ui/button")['default']
export const UiCalendar: typeof import("../components/ui/calendar")['default']
export const UiCard: typeof import("../components/ui/card")['default']
export const UiCarousel: typeof import("../components/ui/carousel")['default']
export const UiCheckbox: typeof import("../components/ui/checkbox")['default']
export const UiCollapsible: typeof import("../components/ui/collapsible")['default']
export const UiCommand: typeof import("../components/ui/command")['default']
export const UiContextMenu: typeof import("../components/ui/context-menu")['default']
export const UiDateRangePicker: typeof import("../components/ui/date-range-picker")['default']
export const UiDialog: typeof import("../components/ui/dialog")['default']
export const UiDrawer: typeof import("../components/ui/drawer")['default']
export const UiDropdownMenu: typeof import("../components/ui/dropdown-menu")['default']
export const UiForm: typeof import("../components/ui/form")['default']
export const UiHoverCard: typeof import("../components/ui/hover-card")['default']
export const UiInputOtp: typeof import("../components/ui/input-otp")['default']
export const UiInput: typeof import("../components/ui/input")['default']
export const UiLabel: typeof import("../components/ui/label")['default']
export const UiMenubar: typeof import("../components/ui/menubar")['default']
export const UiNavigationMenu: typeof import("../components/ui/navigation-menu")['default']
export const UiPagination: typeof import("../components/ui/pagination")['default']
export const UiPopover: typeof import("../components/ui/popover")['default']
export const UiProgress: typeof import("../components/ui/progress")['default']
export const UiRadioGroup: typeof import("../components/ui/radio-group")['default']
export const UiResizable: typeof import("../components/ui/resizable")['default']
export const UiScrollArea: typeof import("../components/ui/scroll-area")['default']
export const UiSelect: typeof import("../components/ui/select")['default']
export const UiSeparator: typeof import("../components/ui/separator")['default']
export const UiSheet: typeof import("../components/ui/sheet")['default']
export const UiSkeleton: typeof import("../components/ui/skeleton")['default']
export const UiSlider: typeof import("../components/ui/slider")['default']
export const UiSonner: typeof import("../components/ui/sonner")['default']
export const UiSwitch: typeof import("../components/ui/switch")['default']
export const UiTable: typeof import("../components/ui/table")['default']
export const UiTabs: typeof import("../components/ui/tabs")['default']
export const UiTaskCard: typeof import("../components/ui/task-card")['default']
export const UiTextarea: typeof import("../components/ui/textarea")['default']
export const UiToast: typeof import("../components/ui/toast")['default']
export const UiToaster: typeof import("../components/ui/toaster")['default']
export const UiToggleGroup: typeof import("../components/ui/toggle-group")['default']
export const UiToggle: typeof import("../components/ui/toggle")['default']
export const UiTooltip: typeof import("../components/ui/tooltip")['default']
export const UiUseToast: typeof import("../components/ui/use-toast")['default']
export const VibrationChart: typeof import("../components/vibration-chart")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyAnalysisDisplay: LazyComponent<typeof import("../components/analysis-display")['default']>
export const LazyMandalaVisualization: LazyComponent<typeof import("../components/mandala-visualization")['default']>
export const LazyMysticalForm: LazyComponent<typeof import("../components/mystical-form")['default']>
export const LazyThemeProvider: LazyComponent<typeof import("../components/theme-provider")['default']>
export const LazyTreeOfLifeVisualization: LazyComponent<typeof import("../components/tree-of-life-visualization")['default']>
export const LazyUiAccordion: LazyComponent<typeof import("../components/ui/accordion")['default']>
export const LazyUiAlertDialog: LazyComponent<typeof import("../components/ui/alert-dialog")['default']>
export const LazyUiAlert: LazyComponent<typeof import("../components/ui/alert")['default']>
export const LazyUiAspectRatio: LazyComponent<typeof import("../components/ui/aspect-ratio")['default']>
export const LazyUiAvatar: LazyComponent<typeof import("../components/ui/avatar")['default']>
export const LazyUiBadge: LazyComponent<typeof import("../components/ui/badge")['default']>
export const LazyUiBreadcrumb: LazyComponent<typeof import("../components/ui/breadcrumb")['default']>
export const LazyUiButton: LazyComponent<typeof import("../components/ui/button")['default']>
export const LazyUiCalendar: LazyComponent<typeof import("../components/ui/calendar")['default']>
export const LazyUiCard: LazyComponent<typeof import("../components/ui/card")['default']>
export const LazyUiCarousel: LazyComponent<typeof import("../components/ui/carousel")['default']>
export const LazyUiCheckbox: LazyComponent<typeof import("../components/ui/checkbox")['default']>
export const LazyUiCollapsible: LazyComponent<typeof import("../components/ui/collapsible")['default']>
export const LazyUiCommand: LazyComponent<typeof import("../components/ui/command")['default']>
export const LazyUiContextMenu: LazyComponent<typeof import("../components/ui/context-menu")['default']>
export const LazyUiDateRangePicker: LazyComponent<typeof import("../components/ui/date-range-picker")['default']>
export const LazyUiDialog: LazyComponent<typeof import("../components/ui/dialog")['default']>
export const LazyUiDrawer: LazyComponent<typeof import("../components/ui/drawer")['default']>
export const LazyUiDropdownMenu: LazyComponent<typeof import("../components/ui/dropdown-menu")['default']>
export const LazyUiForm: LazyComponent<typeof import("../components/ui/form")['default']>
export const LazyUiHoverCard: LazyComponent<typeof import("../components/ui/hover-card")['default']>
export const LazyUiInputOtp: LazyComponent<typeof import("../components/ui/input-otp")['default']>
export const LazyUiInput: LazyComponent<typeof import("../components/ui/input")['default']>
export const LazyUiLabel: LazyComponent<typeof import("../components/ui/label")['default']>
export const LazyUiMenubar: LazyComponent<typeof import("../components/ui/menubar")['default']>
export const LazyUiNavigationMenu: LazyComponent<typeof import("../components/ui/navigation-menu")['default']>
export const LazyUiPagination: LazyComponent<typeof import("../components/ui/pagination")['default']>
export const LazyUiPopover: LazyComponent<typeof import("../components/ui/popover")['default']>
export const LazyUiProgress: LazyComponent<typeof import("../components/ui/progress")['default']>
export const LazyUiRadioGroup: LazyComponent<typeof import("../components/ui/radio-group")['default']>
export const LazyUiResizable: LazyComponent<typeof import("../components/ui/resizable")['default']>
export const LazyUiScrollArea: LazyComponent<typeof import("../components/ui/scroll-area")['default']>
export const LazyUiSelect: LazyComponent<typeof import("../components/ui/select")['default']>
export const LazyUiSeparator: LazyComponent<typeof import("../components/ui/separator")['default']>
export const LazyUiSheet: LazyComponent<typeof import("../components/ui/sheet")['default']>
export const LazyUiSkeleton: LazyComponent<typeof import("../components/ui/skeleton")['default']>
export const LazyUiSlider: LazyComponent<typeof import("../components/ui/slider")['default']>
export const LazyUiSonner: LazyComponent<typeof import("../components/ui/sonner")['default']>
export const LazyUiSwitch: LazyComponent<typeof import("../components/ui/switch")['default']>
export const LazyUiTable: LazyComponent<typeof import("../components/ui/table")['default']>
export const LazyUiTabs: LazyComponent<typeof import("../components/ui/tabs")['default']>
export const LazyUiTaskCard: LazyComponent<typeof import("../components/ui/task-card")['default']>
export const LazyUiTextarea: LazyComponent<typeof import("../components/ui/textarea")['default']>
export const LazyUiToast: LazyComponent<typeof import("../components/ui/toast")['default']>
export const LazyUiToaster: LazyComponent<typeof import("../components/ui/toaster")['default']>
export const LazyUiToggleGroup: LazyComponent<typeof import("../components/ui/toggle-group")['default']>
export const LazyUiToggle: LazyComponent<typeof import("../components/ui/toggle")['default']>
export const LazyUiTooltip: LazyComponent<typeof import("../components/ui/tooltip")['default']>
export const LazyUiUseToast: LazyComponent<typeof import("../components/ui/use-toast")['default']>
export const LazyVibrationChart: LazyComponent<typeof import("../components/vibration-chart")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>

export const componentNames: string[]
