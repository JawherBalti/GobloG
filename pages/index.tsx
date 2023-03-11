import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRef } from "react";
import Header from "../components/Header";
import { sanityClient, urlFor } from "../sanity";
import { Post } from "../typings";

interface Props {
  posts: [Post];
}

export default function Home(props: Props) {
  const ref = useRef<null | HTMLDivElement>(null);

  const handleClick = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center mx-auto">
      <Head>
        <title>GoBloG</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header handleClick={handleClick} />

      <div className="flex justify-between items-center max-w-7xl bg-slate-400 border-y border-black mt-10 py-10 lg:p-0">
        <div className="px-10 space-y-5">
          <h1 className="text-6xl max-w-xl font-bold ">
            Build the habit of reading and writing with{" "}
            <span className="underline decoration-black decoration-4">
              GobloG
            </span>
          </h1>
          <h2 className="font-bold text-3xl text-white">
            Share your thaughts and ideas with the world
          </h2>
        </div>

        <img
          className="hidden md:inline-flex h-32 lg:h-full"
          src="/favicon.png"
          alt="mediumlogo"
        />
      </div>

      <div
        ref={ref}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6 max-w-7xl"
      >
        {props.posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="h-96 border rounded-lg group cursor-pointer overflow-hidden">
              <img
                className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                src={urlFor(post.mainImage).url()!}
                alt="post"
              />
              <div className="flex justify-between p-5 bg-white">
                <div>
                  <p className="text-lg font-bold">{post.title}</p>
                  <p className="text-xs">
                    {post.description} by {post.author.name}
                  </p>
                </div>
                <img
                  className="h-12 w-12 rounded-full"
                  src={urlFor(post.author.image).url()!}
                  alt="Author Image"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  const query = `
  *[_type == "post"] {
    _id,
    title,
    author-> {
      name,
      image
    },
    description,
    mainImage,
    slug
  }`;

  const posts = await sanityClient.fetch(query);
  return {
    props: {
      posts,
    },
  };
};
