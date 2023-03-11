import { GetStaticProps } from "next";
import React from "react";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";

interface Props {
  post: Post;
}

function Post(props: Props) {
  return (
    <main>
      <Header />
      <img
        className="w-full h-40 object-cover"
        src={urlFor(props.post.mainImage).url()!}
        alt="Post"
      />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl"></h1>
        <h2></h2>
      </article>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `
*[_type == "post"]{
    _id,
    slug{
        current
    }
}
`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

//SSR
export const getStaticProps: GetStaticProps = async (context) => {
  const query = `
    *[_type == "post" && slug.current ==$slug][0] {
        _id,
        _createdAt,
        title,
        author-> {
            name,
            image
        },
        'comments': *[
            _type =="comment" &&
            post._ref == ^._id &&
            approved == true
        ],
        description,
        mainImage,
        slug,
        body
    }`;

  const post = await sanityClient.fetch(query, {
    slug: context?.params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60, //update cash after 60 seconds: (Incremental Static Regeneration)
  };
};
