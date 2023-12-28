export default {
  '*.(js|ts|tsx|vue|yaml|yml|json|jsonc)': [`eslint -c eslint.config.js --max-warnings=0 --no-warn-ignored`],
  '*.(css|less|scss)': ['stylelint']
};
