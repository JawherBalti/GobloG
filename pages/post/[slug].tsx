import { GetStaticProps } from "next";
import React, { useState } from "react";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post;
}

function Post(props: Props) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => setSubmitted(true))
      .catch((err) => setSubmitted(false));
  };

  return (
    <main>
      <Header />
      <img
        className="w-full h-80 object-cover"
        src={urlFor(props.post.mainImage).url()!}
        alt="Post"
      />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{props.post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {props.post.description}
        </h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(props.post.author.image).url()!}
            alt="Author"
          />
          <p className="font-extralight text-sm">
            Posted by{" "}
            <span className="text-green-600">{props.post.author.name}</span> -
            Published at {new Date(props.post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={props.post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="text-xl font-bold my-5" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
              img: (props: any) => <img className="w-full" src={props._ref} />,
            }}
          />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold">Thank you for commenting!</h3>
          <p>A moderator must approve it so it can be displayed.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed the article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>
          <hr className="py-3 mt-2" />

          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={props.post._id}
          />

          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border border-black rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:border-none focus:ring"
              placeholder=""
              type="text"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border border-black rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:border-none focus:ring"
              placeholder=""
              type="text"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border border-black  rounded py-2 px-3 form-text-area mt-1 block w-full ring-yellow-500 outline-none focus:border-none focus:ring"
              placeholder=""
              rows={8}
            />
          </label>

          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">Name Is Required!</span>
            )}
            {errors.email && (
              <span className="text-red-500">Email Is Required!</span>
            )}
            {errors.comment && (
              <span className="text-red-500">Comment Is Required!</span>
            )}
          </div>

          <input
            className="shadow bg-yellow-500 hover:bg-yellow-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rouded cursor-pointer"
            type="submit"
          />
        </form>
      )}

      <div
        className="flex flex-col p-10 my-10
      max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2"
      >
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {props.post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500">{comment.name}:</span>
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
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
