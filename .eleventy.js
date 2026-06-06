module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public": "/" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/services": "services" });

  return {
    dir: {
      input: "src/pages",
      includes: "../includes",
      layouts: "../layouts",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
