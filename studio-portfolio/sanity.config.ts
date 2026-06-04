import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, SINGLETON_TYPES} from './structure'

const singletonTypes = new Set<string>(SINGLETON_TYPES)

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'feb37gnz',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Keep singletons out of the global "create new" menu.
    templates: (templates) =>
      templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Hide singletons from the "+ Create" action elsewhere in the Studio.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !singletonTypes.has(item.templateId))
        : prev,
    // Remove "duplicate" / "delete" actions on singleton documents.
    actions: (actions, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? actions.filter(
            ({action}) => action && !['duplicate', 'delete', 'unpublish'].includes(action),
          )
        : actions,
  },
})
