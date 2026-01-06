import antfu from '@antfu/eslint-config'

export default antfu(
  {
    javascript: {
      overrides: {
        // Override the default antfu javascript rules, which classifies console.log as errors. Reduce this to warnings
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
  },
)
