import Head from "next/head";
import Image from "next/image";

export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-16">
      <Head>
        <title>Experienced Software Engineer & Former Chef | About Me - Lucas (Panz) | Your App Name</title>
        <meta
          name="description"
          content="Meet Lucas (Panz), a skilled software engineer based in Seattle with 3 years of experience. Formerly a fine dining chef, he brings a client-centric approach to software development. Explore his outdoor passions and culinary delights. Discover the story behind the nickname 'Panz' and get to know the person behind the code. | Your App Name."
        />
      </Head>
      <article>
        <section>
          <div>
            <div className="flex flex-row w-full items-center  pb-8">
              <h2 className=" text-center pr-10 text-xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
              Impatient? TL;DR
            </h2>
            <Image
              src="/images/indy-bst-ever-cropped.jpg"
              className="rounded-full object-cover"
              width={120}
              height={120}
              alt="Lucas Steinmacher photo"
            />
            </div>
            <p>
              Howdy! I'm Lucas but some call me Panz. I'm a
              software engineer based out of the greater Seattle area, and I
              love building tools and web apps for peopl,  mainly working with Typescript.
            </p>
          </div>
        </section>
        <section>
          <div className="mt-8">
            <h2 className="mb-8 text-center text-xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
              About Me
            </h2>
            <p>
              I'm a software engineer based out of the
              greater Seattle area. I've been working in the industry for about
              3 years now, working at a few different companies, and I'm currently looking for my next opportunity.
              I've worked on projects ranging from internal tools built in Javascript or Typescript for video editing, transcript automation using Whisper AI,
              Django applications for a fintech company and a few other projects in between.
              <br />
              <br />
              Also, as mentioned, I used to work in the service industry as a
              chef, mainly in fine dining, which I feel gives me a unique
              perspective on software and how it affects the clients using it.
              Drawing from my background as a former chef in fine dining, I bring a client-centric approachto software engineering.
              By prioritizing customer needs, building relationships, and suggesting thoughtful solutions,
              I create products that not only meet but exceed expectations, just as I did in the kitchen.
              <br />
              <br />
              A little more about me: I'm a Northern Michigan native who cherishes the great outdoors.
              Trail running, hiking, and snowboarding have been lifelong passions of mine.
              Today, you can find me exploring the scenic trails in and around the Seattle area and the breathtaking Cascades.
              <br />
              <br />
              Though I no longer pursue a professional career in cooking, my passion for food remains unwavering.
              I find joy in baking and cooking for loved ones, and occasionally, throwing a BBQ just to get people together.
              Sharing culinary delights is my way of expressing love and appreciation for the people in my life, and my fascination with food and its culture will forever hold a special place in my heart.
            </p>
          </div>
        </section>
        <section>
          <div className="mt-8">
            <h2 className="mb-8 text-center text-xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
              Ok, Whats whith the name?
            </h2>
            <p>
              Why I'm so glad you asked. Panz (pronounced like the plural of the
              cooking utensil, pans) was given to me when I was working in fine
              dining as a chef at a restaurant named{' '}
              <a
                className="text-[#d68501] hover:text-[#d68401bb] hover:underline"
                href="https://www.seattletimes.com/life/food-drink/seattles-james-beard-award-winning-restaurant-tilth-is-closing-forever/"
                alt="Tilth restaurant"
                target="_blank"
                rel="me noopener noreferrer"
              >
                Tilth
              </a>{' '}.
              <br /><br />
              They liked to give out nicknames to the senior staff. I was
              told that the name was given to me because of my Germanic last
              name and the fact that I'm a{' '}
              <a
                className="text-[#d68501] hover:text-[#d68401bb] hover:underline"
                href="https://en.wiktionary.org/wiki/Panzer"
                alt="Panzer"
                target="_blank"
                rel="me noopener noreferrer"
              >
                tank
              </a>{' '}
              in the kitchen. Anyhow, the name was given to me and it stuck
              around, and I just kinda ran with it.
              <br />
              <br />
              Whatever you call me, just don't overthink it.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
