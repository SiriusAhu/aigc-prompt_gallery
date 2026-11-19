export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 允许中文正文与标题
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0],
  },
};
