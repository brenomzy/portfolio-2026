import {defineField, defineType, defineArrayMember} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  // Edited as a singleton (see structure.ts) — only one About document exists.
  fields: [
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'photo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for screen readers and SEO.',
        }),
      ],
    }),
    defineField({
      name: 'skills',
      title: 'Skills & tools',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    select: {media: 'photo'},
    prepare: ({media}) => ({title: 'About', media}),
  },
})
