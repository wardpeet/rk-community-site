const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

/**
 * A blog post that covers all of this can be found at https://www.gatsbyjs.org/docs/schema-customization/
 * It's a good read and explains evertyhing we are trying to do here.
 */
exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions

  // This is the smallest way to map talk titles into markdown nodes
  createTypes(`
    type MarkdownRemark implements Node @infer {
      frontmatter: MarkdownRemarkFrontmatter
    }

    type MarkdownRemarkFrontmatter @infer {
      talks: [MarkdownRemark] @link(by: "frontmatter.title")
    }
  `)

  // This is the a "compiled" version of the above createTypes version which is a lot of manual work :)
  // first we need to create the MarkdownRemark node again, add the node interface & create a field called frontmatter

  // the second type we create MarkdownRemarkFrontmatter with the talk fields that we will override with a custom resolver.


  // the @ symbols above means graphql extensions, you can compare them with directives which add some metadata to the query we can use in gatsby core.
  // @infer means we'll try to find the correct type for yoru fields. If it looks like a Date we will make it a Date type.
  // @link in the above code is the same as our runQuery code inside the resolver

  /*
  createTypes([
    schema.buildObjectType({
      name: 'MarkdownRemark',
      interfaces: ['Node'],
      extensions: {
        infer: true,
      },
      fields: {
        frontmatter: 'MarkdownRemarkFrontmatter'
      }
    }),
    schema.buildObjectType({
      name: 'MarkdownRemarkFrontmatter',
      extensions: {
        infer: true,
      },
      fields: {
        talks: {
          type: '[MarkdownRemark]',
          resolve(parent, args, context, info) {
            if (!parent.talks) {
              return null;
            }

            return context.nodeModel.runQuery({
              query: {
                filter: {
                  frontmatter: {
                    title: {
                      in: parent.talks,
                    }
                  }
                },
              },
              type: "MarkdownRemark",
              firstOnly: false,
            })
          }
        },
      },
    })]
  );
  */
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  // const talkTemplate = path.resolve(`./src/templates/Talk/index.jsx`);
  const storyTemplate = path.resolve(`./src/templates/Story/index.jsx`);
  // const speakerTemplate = path.resolve(`./src/templates/Speaker/index.jsx`);
  // const meetupTemplate = path.resolve(`./src/templates/Meetup/index.jsx`);

  return graphql(
    `
      {
        stories: allMarkdownRemark(
          filter: { fileAbsolutePath: { regex: "/stories/" } }
        ) {
          nodes {
            fields {
              slug
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    // Create blog posts pages.
    const {
      stories: { nodes: stories },
    } = result.data;

    stories.forEach(story => {
      createPage({
        path: `/story${story.fields.slug}`,
        component: storyTemplate,
        context: {
          slug: story.fields.slug,
        },
      });
    });
  });
};
