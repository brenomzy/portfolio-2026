import type {StructureResolver} from 'sanity/structure'

// Types that should exist exactly once. Creation of new ones is blocked in
// sanity.config.ts (template filter), so these behave as singletons.
export const SINGLETON_TYPES = ['about', 'siteSettings'] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('project').title('Projects'),
      S.divider(),
      S.documentTypeListItem('about').title('About'),
      S.documentTypeListItem('siteSettings').title('Site Settings'),
    ])
