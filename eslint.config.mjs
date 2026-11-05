import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    // This rule targets the legacy pages router; the app router handles plain anchors fine.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
];
export default eslintConfig;
