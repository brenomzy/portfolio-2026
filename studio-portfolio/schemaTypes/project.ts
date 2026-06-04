import {defineField, defineType, defineArrayMember} from 'sanity'

// Reusable alt-text field for every image — accessibility is non-negotiable.
const altField = defineField({
  name: 'alt',
  title: 'Alternative text',
  type: 'string',
  description: 'Describe the image for screen readers and SEO.',
})

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'client',
      type: 'string',
      description: 'Company or person the work was for.',
    }),
    defineField({
      name: 'year',
      type: 'number',
      validation: (rule) => rule.min(1990).max(2100).integer(),
    }),
    defineField({
      name: 'role',
      title: 'Role(s)',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'cover',
      type: 'image',
      options: {hotspot: true},
      fields: [altField],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [altField],
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Case study',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [altField],
        }),
      ],
    }),
    defineField({
      name: 'links',
      title: 'External links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'url', type: 'url', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      description: 'Surface this project on the home page.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'client', media: 'cover'},
  },
})
